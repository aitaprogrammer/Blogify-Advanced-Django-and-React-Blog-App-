from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, CategoryViewSet, CommentViewSet

# Create a router and register our viewsets with it.
router = DefaultRouter()

# Register the ViewSets.
# The first argument is the URL prefix (e.g., 'posts').
# The second argument is the ViewSet class.
# The router will automatically generate the URL patterns and names.
router.register(r'posts', PostViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'comments', CommentViewSet)

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
]

"""
HOW THE ROUTER WORKS:
---------------------
The DefaultRouter inspects the ViewSet and generates standard REST endpoints.
It uses the 'basename' (usually derived from the model name) to create URL names.

GENERATED URLS & NAMES:
-----------------------

1. POSTS (Lookup field: slug)
   - GET  /posts/          -> Name: 'post-list' (List all published posts)
   - POST /posts/          -> Name: 'post-list' (Create a new post)
   - GET  /posts/{slug}/   -> Name: 'post-detail' (Retrieve a specific post)
   - PUT  /posts/{slug}/   -> Name: 'post-detail' (Update a post)
   - DELETE /posts/{slug}/ -> Name: 'post-detail' (Delete a post)
   - POST /posts/{slug}/add_comment/ -> Name: 'post-add-comment' (Add a comment)
   - GET  /posts/{slug}/comments/    -> Name: 'post-comments' (List all comments for this post)

2. CATEGORIES (Lookup field: slug)
   - GET  /categories/        -> Name: 'category-list'
   - POST /categories/        -> Name: 'category-list'
   - GET  /categories/{slug}/ -> Name: 'category-detail'
   ...

3. COMMENTS (Lookup field: id/pk - Default)
   - GET  /comments/      -> Name: 'comment-list'
   - POST /comments/      -> Name: 'comment-list'
   - GET  /comments/{id}/ -> Name: 'comment-detail'
   ..
"""
