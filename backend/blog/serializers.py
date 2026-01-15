from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Post, Comment, Tag

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


class CategorySerializer(serializers.ModelSerializer):
    is_followed = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'is_followed']
        read_only_fields = ['slug']

    def get_is_followed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user in obj.followers.all()
        return False


class CommentSerializer(serializers.ModelSerializer):
    # We use ReadOnlyField with source='author.username' to flatten the relationship.
    # Instead of sending the User ID (e.g., 1), we send "admin".
    # This is ReadOnly because we don't want users setting the author name manually;
    # it's set automatically in the View based on the logged-in user.
    author = serializers.ReadOnlyField(source='author.username')
    likes_count = serializers.IntegerField(source='likes.count', read_only=True)
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'author', 'post', 'body', 'created_at', 'active', 'likes_count', 'is_liked']
        # 'post' is read-only here because the URL usually dictates which post we are commenting on,
        # or it is passed in the context. We don't want the user to arbitrarily change the post ID in the body.
        read_only_fields = ['post']

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user in obj.likes.all()
        return False


class PostListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for the "Index" page.
    Excludes heavy fields like 'content' and 'comments' to save bandwidth.
    """
    author = UserSerializer(read_only=True)
    # StringRelatedField calls the __str__ method of the Category model (returns name).
    # Efficient for lists where we just need the label.
    category = serializers.StringRelatedField()
    tags = serializers.StringRelatedField(many=True)
    likes_count = serializers.IntegerField(source='likes.count', read_only=True)
    is_liked = serializers.SerializerMethodField()
    first_comment = serializers.SerializerMethodField()
    comments_count = serializers.IntegerField(source='comments.count', read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'title', 'slug', 'author', 'category', 'tags', 'thumbnail', 'status', 'created_at', 'content', 'likes_count', 'is_liked', 'first_comment', 'comments_count']
        read_only_fields = ['slug']

    def get_is_liked(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return user in obj.likes.all()
        return False
    
    def get_first_comment(self, obj):
        first = obj.comments.filter(active=True).order_by('created_at').first()
        if first:
            return CommentSerializer(first).data
        return None


class PostDetailSerializer(serializers.ModelSerializer):
    """
    Heavy serializer for the "Single Post" page.
    Includes full content and nested comments.
    """
    author = UserSerializer(read_only=True)
    
    # READ: When fetching data, use the nested CategorySerializer to show full details (id, name, slug).
    category = CategorySerializer(read_only=True)
    
    # WRITE: When sending data (POST/PUT), accept a category ID (e.g., "category_id": 5).
    # source='category' maps this input to the actual 'category' model field.
    # write_only=True ensures this field doesn't appear in the output JSON.
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True
    )

    # Nested serializer to show comments inline.
    # many=True because a post has many comments.
    # read_only=True because we don't create comments via the Post endpoint.
    comments = CommentSerializer(many=True, read_only=True)

    # Tags: List of strings (e.g., ["tech", "django"])
    tags = serializers.ListField(
        child=serializers.CharField(max_length=50), write_only=True, required=False
    )
    tag_names = serializers.StringRelatedField(source='tags', many=True, read_only=True)
    likes_count = serializers.IntegerField(source='likes.count', read_only=True)
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'author', 'category', 'category_id', 
            'content', 'status', 'created_at', 'updated_at', 'comments',
            'tags', 'tag_names', 'thumbnail', 'likes_count', 'is_liked'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'slug']

    def get_is_liked(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return user in obj.likes.all()
        return False

    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        post = Post.objects.create(**validated_data)
        
        for tag_name in tags_data:
            tag, created = Tag.objects.get_or_create(name=tag_name)
            post.tags.add(tag)
        
        return post

    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags', None)
        
        # Update standard fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update tags if provided
        if tags_data is not None:
            instance.tags.clear() # Remove old tags
            for tag_name in tags_data:
                tag, created = Tag.objects.get_or_create(name=tag_name)
                instance.tags.add(tag)
        
        return instance
