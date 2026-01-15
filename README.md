# Blogify 🚀

> [cite_start]A production-ready, full-stack blogging platform designed to connect content creators and readers through a decoupled client-server architecture[cite: 3, 4].

## 📖 Overview

[cite_start]Blogify is a robust social blogging application that pairs a **Django 5 REST API** backend with a **React 19** Single-Page Application (SPA) frontend. [cite_start]The platform is engineered to solve common engagement and usability challenges using "smart" architectural features, such as a personalized feed algorithm and optimistic UI updates[cite: 5, 6].

## ✨ Key Features

* [cite_start]**🧠 "Smart Feed" Algorithm:** Dynamically ranks content to prioritize relevance, elevating posts from users and categories you follow above generic new content[cite: 6, 72, 73].
* [cite_start]**⚡ Optimistic UI & Atomic Actions:** Delivers a seamless user experience by updating the UI immediately (e.g., for likes) while handling state changes via dedicated atomic API endpoints in the background[cite: 6, 90, 92].
* [cite_start]**🔍 Unified Multi-Field Search:** A single search query simultaneously scans post titles, content, authors, and tags for an optimized discovery experience[cite: 6, 83].
* [cite_start]**🛡️ Secure Authentication:** Utilizes HttpOnly cookie-based session management to persist sessions safely and mitigate XSS vulnerabilities[cite: 7, 104, 105].
* [cite_start]**🎨 Responsive Design:** Built with Vanilla CSS 3 variables for theming and a responsive layout for web and mobile consumers[cite: 4, 21, 60].

## 🛠️ Technology Stack

### Frontend (Client)
* [cite_start]**Core:** React 19, Vite [cite: 4, 14]
* [cite_start]**Routing:** React Router v7 
* [cite_start]**State Management:** React Context API (Auth) 
* [cite_start]**Networking:** Axios (with interceptors) 
* [cite_start]**Forms & Validation:** Formik, Yup [cite: 20]
* [cite_start]**UI/UX:** Vanilla CSS 3, react-hot-toast [cite: 21, 22]

### Backend (Server)
* [cite_start]**Framework:** Django 5 [cite: 25]
* [cite_start]**API Toolkit:** Django REST Framework (DRF) [cite: 27]
* [cite_start]**Database:** SQLite (Dev), PostgreSQL-ready (Prod) [cite: 32, 33]
* [cite_start]**Filtering:** django-filter [cite: 34]
* [cite_start]**Security:** Session Authentication (HttpOnly) [cite: 29, 30]

## 🏗️ Architecture

[cite_start]Blogify follows a classic decoupled REST model[cite: 11]:

1.  [cite_start]**Frontend Consumer:** Handles presentation logic and communicates with the server via asynchronous JSON requests[cite: 12, 16].
2.  [cite_start]**Backend API:** Serves as a pure data API, exposing endpoints for users, posts, and social interactions[cite: 12, 15].
3.  [cite_start]**Data Schema:** An interconnected model linking users to content, social interactions, and topic taxonomies[cite: 46, 47].

## 🚀 Roadmap

[cite_start]While fully functional for local development, the following enhancements are planned[cite: 9]:

* [cite_start]**TypeScript Migration:** Porting the React frontend codebase to TypeScript for strict typing[cite: 9, 127].
* [cite_start]**Rich Text Editor:** Integrating a modern editor (e.g., Tiptap) compatible with React 19[cite: 128].
* [cite_start]**Real-time Updates:** Implementing WebSockets for live notifications (likes, follows)[cite: 9, 129].

## 📄 License

[Insert your license here]
