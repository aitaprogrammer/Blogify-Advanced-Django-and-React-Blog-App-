# Django Blog API Project Report

## 1. Project Overview
**Project Name:** MyBlog API
**Description:** A robust, RESTful API for a multi-user blogging platform built with Django and Django Rest Framework (DRF). It supports users, profiles, blog posts, categories, tags, and comments.
**Current Phase:** Phase 6 (Likes Functionality & User Registration)

## 2. Technology Stack
- **Backend Framework:** Django 5.x
- **API Framework:** Django Rest Framework (DRF)
- **Database:** SQLite (Development)
- **Filtering:** `django-filter`
- **Authentication:** Session & Basic Authentication (Default DRF)

## 3. Application Structure
The project consists of two main applications:

### A. `users` App
Handles user profiles and user-related data.
- **Models:** `Profile` (One-to-One with `User`)
- **Views:** `ProfileViewSet`

### B. `blog` App
Handles the core blogging functionality.
- **Models:** `Post`, `Category`, `Tag`, `Comment`
- **Views:** `PostViewSet`, `CategoryViewSet`, `CommentViewSet`

## 4. Database Schema (Models)

### User (Built-in)
- Standard Django User model (`username`, `email`, `password`, etc.)

### Profile (`users.models`)
- **Relationship:** One-to-One with `User`
- **Fields:** `bio`, `image`, etc. (Assumed based on standard patterns)

### Category (`blog.models`)
- **Fields:** `name`, `slug`
- **Purpose:** Grouping posts (e.g., "Tech", "Lifestyle").

### Tag (`blog.models`)
- **Fields:** `name`
- **Purpose:** Many-to-Many labeling for posts.

### Post (`blog.models`)
- **Fields:** 
  - `title`, `slug` (Unique identifier)
  - `content` (Text body)
  - `status` ('draft' or 'published')
  - `thumbnail` (Image)
  - `created_at`, `updated_at`
- **Relationships:**
  - `author` (ForeignKey to `User`)
  - `category` (ForeignKey to `Category`)
  - `tags` (ManyToMany to `Tag`)
  - `likes` (ManyToMany to `User`)

### Comment (`blog.models`)
- **Fields:** `body`, `created_at`, `active`
- **Relationships:**
  - `post` (ForeignKey to `Post`)
  - `author` (ForeignKey to `User`)

## 5. API Reference (Endpoints)
Base URL: `/api/`

### Authentication
### Authentication
The API supports Session Authentication.
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/register/` | Register a new user |
| `POST` | `/login/` | Login (Returns CSRF token) |
| `POST` | `/logout/` | Logout (Requires CSRF token) |

### Users & Profiles
| Method | Endpoint | Description | Permissions |
| :--- | :--- | :--- | :--- |
| `GET` | `/profiles/` | List all profiles | Public |
| `GET` | `/profiles/{username}/` | Retrieve specific profile | Public |
| `PUT` | `/profiles/{username}/` | Update profile | Owner Only |

### Blog Posts
| Method | Endpoint | Description | Permissions |
| :--- | :--- | :--- | :--- |
| `GET` | `/posts/` | List published posts | Public |
| `POST` | `/posts/` | Create a new post | Authenticated |
| `GET` | `/posts/{slug}/` | Retrieve post details | Public |
| `PUT` | `/posts/{slug}/` | Update post | Author Only |
| `DELETE` | `/posts/{slug}/` | Delete post | Author Only |

#### Custom Post Actions
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/posts/{slug}/comments/` | Get all comments for a post |
| `POST` | `/posts/{slug}/add_comment/` | Add a comment to a post |
| `GET/POST` | `/posts/{slug}/like/` | Check status (GET) or Toggle like (POST) |

#### Filtering & Search
**Endpoint:** `/api/posts/`
- **Filter by Category:** `?category={id}`
- **Filter by Status:** `?status=published`
- **Search:** `?search=query` (Searches `title`, `content`, `author__username`, `tags__name`)

### Categories
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/categories/` | List all categories |
| `GET` | `/categories/{slug}/` | Retrieve category details |

### Comments
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/comments/` | List all comments |
| `GET` | `/comments/{id}/` | Retrieve comment details |
| `PUT` | `/comments/{id}/` | Update comment (Author only) |

## 6. Frontend Developer Notes
1.  **Authentication:** Use `/api/login/` to get a session and CSRF token. Include `X-CSRFToken` header for unsafe requests (POST/PUT/DELETE).
2.  **Slugs:** Posts and Categories are identified by `slug` (e.g., `my-post-title`), not ID, in the URLs.
3.  **Pagination:** Default DRF pagination is enabled (check `count`, `next`, `previous` in responses).
4.  **Images:** Thumbnails return full URLs. Ensure the base domain is handled correctly in development vs production.
5.  **Search:** Use the `search` query parameter for a global search across titles, content, and tags.

## 7. Future Roadmap
- [ ] Implement Token or JWT Authentication (e.g., `djoser` or `SimpleJWT`).
- [x] Add Registration endpoint.
- [x] Add "Like" functionality for posts.
- [ ] Improve Profile model with more fields.
