from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db.models import Count, Case, When, Value, IntegerField, Q
from .models import Post, Category, Comment
from .serializers import (
    PostListSerializer, 
    PostDetailSerializer, 
    CategorySerializer, 
    CommentSerializer
)

class IsAuthorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the author of the post.
        # Note: has_object_permission is called AFTER has_permission (which checks if user is logged in).
        # So we can safely access request.user here.
        return obj.author == request.user


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'

    @action(detail=True, methods=['post', 'get'], permission_classes=[permissions.IsAuthenticated])
    def follow(self, request, slug=None):
        category = self.get_object()
        user = request.user
        
        if request.method == 'POST':
            if user in category.followers.all():
                category.followers.remove(user)
                return Response({'status': 'Unfollowed', 'is_followed': False})
            else:
                category.followers.add(user)
                return Response({'status': 'Followed', 'is_followed': True})
        
        is_followed = user in category.followers.all()
        return Response({'status': 'Current status', 'is_followed': is_followed})


class PostViewSet(viewsets.ModelViewSet):
    # We only show published posts by default.
    queryset = Post.objects.all()  # Base queryset (will be filtered in get_queryset)
    # We use the 'slug' field (e.g., 'my-first-post') instead of 'id' in URLs.
    lookup_field = 'slug'
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]

    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['category', 'status']
    search_fields = ['title', 'content', 'author__username', 'tags__name']

    def get_queryset(self):
        """
        Show all published posts to everyone.
        Additionally, show draft posts to their authors.
        Sort by followed users/categories first.
        """
        if self.request.user.is_authenticated:
            user = self.request.user
            # Get IDs of users and categories the user follows
            # Note: user.profile.following gives users the current user follows
            # user.followed_categories gives categories the current user follows
            followed_user_ids = user.profile.following.values_list('id', flat=True)
            followed_category_ids = user.followed_categories.values_list('id', flat=True)
            
            queryset = Post.objects.filter(
                Q(status='published') | Q(status='draft', author=user)
            ).annotate(
                is_followed=Case(
                    When(Q(author__in=followed_user_ids) | Q(category__in=followed_category_ids), then=Value(1)),
                    default=Value(0),
                    output_field=IntegerField(),
                )
            ).order_by('-is_followed', '-created_at')
        else:
            queryset = Post.objects.filter(status='published').order_by('-created_at')
        
        return queryset

    def get_serializer_class(self):
        """
        Return a lightweight serializer for list views to save bandwidth,
        and a heavy serializer for detail views to show content/comments.
        """
        if self.action == 'list':
            return PostListSerializer
        return PostDetailSerializer

    def perform_create(self, serializer):
        """
        Dependency Injection for the 'author' field.
        
        When a user sends a POST request, they don't send their own ID.
        We manually grab the logged-in user (self.request.user) and inject it
        into the save method. This ensures the post is cryptographically tied
        to the authenticated token, preventing spoofing.
        """
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post', 'get'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, slug=None):
        """
        Custom endpoint: /api/posts/{slug}/like/
        GET: Checks if the user liked the post.
        POST: Toggles the like status.
        """
        post = self.get_object()
        user = request.user
        
        if request.method == 'POST':
            if user in post.likes.all():
                # User already liked, do nothing (idempotent)
                return Response({'status': 'Already liked', 'likes_count': post.likes.count(), 'is_liked': True})
            else:
                post.likes.add(user)
                return Response({'status': 'Post liked', 'likes_count': post.likes.count(), 'is_liked': True})
        
        # Handle GET request
        is_liked = user in post.likes.all()
        return Response({'status': 'Current status', 'likes_count': post.likes.count(), 'is_liked': is_liked})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def add_comment(self, request, slug=None):
        """
        Custom endpoint: POST /api/posts/{slug}/add_comment/
        Allows an authenticated user to add a comment to a specific post.
        """
        post = self.get_object() # Retrieves the post based on the slug in the URL
        serializer = CommentSerializer(data=request.data)
        
        if serializer.is_valid():
            # We inject the author (current user) and the post (from URL)
            serializer.save(author=request.user, post=post)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def comments(self, request, slug=None):
        """
        Custom endpoint: GET /api/posts/{slug}/comments/
        Retrieves all comments for a specific post.
        """
        post = self.get_object()
        comments = post.comments.all()
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]

    def perform_create(self, serializer):
        # When creating a comment directly via /api/comments/, we need to ensure
        # the author is set to the current user.
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post', 'get'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        comment = self.get_object()
        user = request.user
        
        if request.method == 'POST':
            if user in comment.likes.all():
                return Response({'status': 'Already liked', 'likes_count': comment.likes.count(), 'is_liked': True})
            else:
                comment.likes.add(user)
                return Response({'status': 'Comment liked', 'likes_count': comment.likes.count(), 'is_liked': True})
        
        is_liked = user in comment.likes.all()
        return Response({'status': 'Current status', 'likes_count': comment.likes.count(), 'is_liked': is_liked})
