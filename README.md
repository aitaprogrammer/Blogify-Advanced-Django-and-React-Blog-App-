# Blogify 🚀

> A production-ready, full-stack blogging platform designed to connect content creators and readers through a decoupled client-server architecture.

## 📖 Overview

Blogify is a robust social blogging application that pairs a **Django 5 REST API** backend with a **React 19** Single-Page Application (SPA) frontend. The platform is engineered to solve common engagement and usability challenges using "smart" architectural features, such as a personalized feed algorithm and optimistic UI updates.

## ✨ Key Features

* **🧠 "Smart Feed" Algorithm:** Dynamically ranks content to prioritize relevance, elevating posts from users and categories you follow above generic new content.
* **⚡ Optimistic UI & Atomic Actions:** Delivers a seamless user experience by updating the UI immediately (e.g., for likes) while handling state changes via dedicated atomic API endpoints in the background.
* **🔍 Unified Multi-Field Search:** A single search query simultaneously scans post titles, content, authors, and tags for an optimized discovery experience.
* **🛡️ Secure Authentication:** Utilizes HttpOnly cookie-based session management to persist sessions safely and mitigate XSS vulnerabilities.
* **🎨 Responsive Design:** Built with Vanilla CSS 3 variables for theming and a responsive layout for web and mobile consumers.

## 🛠️ Technology Stack

### Frontend (Client)
* **Core:** React 19, Vite
* **Routing:** React Router v7
* **State Management:** React Context API (Auth)
* **Networking:** Axios (with interceptors)
* **Forms & Validation:** Formik, Yup
* **UI/UX:** Vanilla CSS 3, react-hot-toast

### Backend (Server)
* **Framework:** Django 5
* **API Toolkit:** Django REST Framework (DRF)
* **Database:** SQLite (Dev), PostgreSQL-ready (Prod)
* **Filtering:** django-filter
* **Security:** Session Authentication (HttpOnly)

## 🏗️ Architecture

Blogify follows a classic decoupled REST model:

1.  **Frontend Consumer:** Handles presentation logic and communicates with the server via asynchronous JSON requests.
2.  **Backend API:** Serves as a pure data API, exposing endpoints for users, posts, and social interactions.
3.  **Data Schema:** An interconnected model linking users to content, social interactions, and topic taxonomies.

## 🚀 Roadmap

While fully functional for local development, the following enhancements are planned:

* **TypeScript Migration:** Porting the React frontend codebase to TypeScript for strict typing.
* **Rich Text Editor:** Integrating a modern editor (e.g., Tiptap) compatible with React 19.
* **Real-time Updates:** Implementing WebSockets for live notifications (likes, follows).

## 📄 License
Free for all 😁
