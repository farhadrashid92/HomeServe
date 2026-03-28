# agents.md

## Project Overview

This project is a **Home Service Booking Web Application for Pakistan** built using the **MERN stack (MongoDB, Express.js, React.js, Node.js)**.

The platform allows users to browse and book home services such as cleaning, plumbing, electrician, maintenance, and more. Service providers can manage bookings and services, while admins manage the entire platform.

The project must follow **clean architecture, modern UI/UX practices, and scalable code structure**.

---

# AI Agent Roles

AI agents should operate under clearly defined roles to maintain clean code and separation of concerns.

## 1. UI/UX Design Agent

Responsibilities:

* Design modern and user-friendly interfaces
* Ensure responsive design for mobile, tablet, and desktop
* Create reusable UI components
* Maintain consistent design system

Guidelines:

* Use **Tailwind CSS**
* Avoid animation libraries
* Use simple **CSS transitions when necessary**
* Follow **minimal and modern design patterns**

Focus areas:

* Layout
* Typography
* Spacing
* Component consistency
* Accessibility

---

## 2. Frontend Development Agent

Responsibilities:

* Build the **React frontend**
* Convert UI designs into reusable React components
* Implement routing and page layouts
* Prepare the frontend for backend integration

Tech Stack:

* React.js
* Tailwind CSS
* React Router
* Axios

Rules:

* Use functional components
* Use React hooks
* Keep components small and reusable
* Avoid large monolithic components

Recommended structure:

src/
components/
pages/
layouts/
hooks/
services/
utils/
assets/

---

## 3. Backend Development Agent

Responsibilities:

* Build REST APIs
* Handle business logic
* Manage authentication and authorization
* Implement booking system APIs

Tech Stack:

* Node.js
* Express.js
* JWT authentication

Rules:

* Use MVC pattern
* Separate controllers, routes, and services
* Implement proper error handling
* Validate request data

Recommended structure:

backend/
controllers/
routes/
models/
middleware/
services/
utils/
config/

---

## 4. Database Agent

Responsibilities:

* Design MongoDB schemas
* Maintain efficient relationships between collections
* Ensure scalable database structure

Primary collections:

Users
ServiceProviders
Services
Bookings
Reviews
Notifications

Rules:

* Use Mongoose
* Use indexes for performance
* Normalize data where necessary
* Prevent redundant fields

---

## 5. Authentication & Security Agent

Responsibilities:

* Implement authentication system
* Protect API routes
* Handle user roles

Authentication features:

* JWT authentication
* Role based access control

Roles:

Customer
Service Provider
Admin

Security practices:

* Password hashing with bcrypt
* Token verification middleware
* Rate limiting
* Input validation

---

## 6. Booking System Agent

Responsibilities:

* Implement the booking workflow
* Handle booking status updates
* Maintain booking history

Booking flow:

Browse service
Select provider
Choose date and time
Add address
Confirm booking

Booking statuses:

Pending
Accepted
In Progress
Completed
Cancelled

---

## 7. Admin Panel Agent

Responsibilities:

* Manage platform data
* Provide administrative dashboards
* Monitor platform activity

Admin features:

* Manage users
* Manage service providers
* Manage services
* Manage bookings
* Platform analytics

---

# Development Phases

Agents must follow this order when building the system.

Phase 1
Frontend UI development

Phase 2
Backend API development

Phase 3
Database schema implementation

Phase 4
Authentication and authorization

Phase 5
Booking system integration

Phase 6
Admin dashboard features

Phase 7
Performance optimization

---

# UI Pages

Public pages:

Home
Services
Service Details
About
Contact
Login
Register
Become a Provider
FAQ

User dashboard:

Profile
My Bookings
Booking History
Notifications

Provider dashboard:

Provider Profile
Manage Services
Booking Requests
Reviews

Admin dashboard:

Manage Users
Manage Providers
Manage Services
Manage Bookings
Analytics

---

# Home Services to Include

Cleaning Services
House cleaning
Deep cleaning
Sofa cleaning
Carpet cleaning

Maintenance Services
AC repair
Appliance repair
Generator maintenance

Electrical Services
Electrician
Wiring
Switchboard repair

Plumbing Services
Pipe repair
Water leakage fix
Bathroom installation

Other Services
Pest control
Painting
Carpenter
CCTV installation
Home shifting
Gardening

---

# Code Quality Rules

All agents must follow these rules:

* Write clean, readable code
* Use consistent naming conventions
* Avoid code duplication
* Use reusable components
* Document complex logic
* Follow best security practices

---

# Performance Guidelines

* Use lazy loading where possible
* Optimize images
* Avoid unnecessary re-renders
* Use efficient database queries
* Implement caching where needed

---

# Final Goal

The final product should be:

* Responsive
* Scalable
* Easy to maintain
* Production-ready
* User-friendly
