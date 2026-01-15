from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
import random

class Category(models.Model):
    """
    Represents a grouping or tag for blog posts.
    Used to organize content into topics.
    """
    name = models.CharField(max_length=100)
    # Slug is used for SEO-friendly URLs (e.g., /categories/tech-news/)
    slug = models.SlugField(unique=True)
    followers = models.ManyToManyField(User, related_name='followed_categories', blank=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
            # Handle duplicates
            original_slug = self.slug
            counter = 1
            while Category.objects.filter(slug=self.slug).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
        super().save(*args, **kwargs)


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class Post(models.Model):
    """
    The main content unit of the blog.
    Stores the article text, metadata, and relationships.
    """
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('published', 'Published'),
    )

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    content = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # If the User is deleted, delete all their posts (CASCADE).
    author = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='blog_posts'
    )

    # Critical: Prevent deleting a Category if it has posts assigned to it (PROTECT).
    # This ensures we don't accidentally orphan posts or leave them category-less.
    category = models.ForeignKey(
        Category, 
        on_delete=models.PROTECT,
        related_name='posts'
    )
    
    tags = models.ManyToManyField('Tag', blank=True)
    likes = models.ManyToManyField(User, related_name='liked_posts', blank=True)
    thumbnail = models.ImageField(upload_to='thumbnails/', blank=True)

    def save(self, *args, **kwargs):
        # If the slug is not set (i.e., it's a new post), generate it.
       
            # Create a basic slug from the title
        base_slug = slugify(self.title)
            # Generate a random 4-digit number
        random_num = random.randint(1000, 9999)
            # Combine them: "my-title-1234"
        self.slug = f"{base_slug}-{random_num}"
            
            # (Optional) Ensure absolute uniqueness by checking if it exists
        while Post.objects.filter(slug=self.slug).exists():
                random_num = random.randint(1000, 9999)
                self.slug = f"{base_slug}-{random_num}"

        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Comment(models.Model):
    """
    Represents user engagement on a specific post.
    """
    # If the Post is deleted, delete all associated comments (CASCADE).
    post = models.ForeignKey(
        Post, 
        on_delete=models.CASCADE, 
        related_name='comments'
    )

    # If the User is deleted, delete their comments (CASCADE).
    author = models.ForeignKey(
        User, 
        on_delete=models.CASCADE
    )

    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    # Allows "soft deletion" or moderation without removing the record from DB.
    active = models.BooleanField(default=True)
    likes = models.ManyToManyField(User, related_name='liked_comments', blank=True)

    def __str__(self):
        return f"Comment by {self.author} on {self.post}"
