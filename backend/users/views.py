from rest_framework import viewsets, permissions, generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from .models import Profile
from .serializers import ProfileSerializer, RegisterSerializer

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the profile.
        return obj.user == request.user

from rest_framework.decorators import action

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    lookup_field = 'user__username'

    @action(detail=True, methods=['post', 'get'], permission_classes=[permissions.IsAuthenticated])
    def follow(self, request, user__username=None):
        target_profile = self.get_object()
        target_user = target_profile.user
        current_user_profile = request.user.profile
        
        if request.user == target_user:
             return Response({'status': 'Cannot follow yourself'}, status=status.HTTP_400_BAD_REQUEST)

        if request.method == 'POST':
            if target_user in current_user_profile.following.all():
                current_user_profile.following.remove(target_user)
                return Response({'status': 'Unfollowed', 'is_followed': False})
            else:
                current_user_profile.following.add(target_user)
                return Response({'status': 'Followed', 'is_followed': True})
        
        is_followed = target_user in current_user_profile.following.all()
        return Response({'status': 'Current status', 'is_followed': is_followed})


class RegisterView(generics.CreateAPIView):
    queryset = Profile.objects.all() # Not really used but required by some generic views or we can just set serializer
    # Actually for CreateAPIView we just need serializer_class usually.
    # But let's follow standard pattern.
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            csrf_token = get_token(request)
            return Response({
                "message": "Login successful",
                "csrf_token": csrf_token,
                "user": {"id": user.id, "username": user.username}
            }, status=status.HTTP_200_OK)
        return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)


class CreatorListView(generics.ListAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        # Return profiles of users who have at least one published post
        queryset = Profile.objects.filter(user__blog_posts__status='published').distinct()
        
        if self.request.user.is_authenticated:
            queryset = queryset.exclude(user=self.request.user)
            
        return queryset
