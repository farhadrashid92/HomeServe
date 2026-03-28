# HomeServe API Testing Guide

This guide provides instructions on how to test the backend APIs for the HomeServe application using **Postman** or **Thunder Client** (VS Code Extension).

## Base URL
All requests should be made to: `http://localhost:5000/api`

---

## 1. Authentication

### Register a User
*   **Method:** POST
*   **Endpoint:** `/auth/register`
*   **Body (JSON):**
    ```json
    {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "password": "password123",
      "phone": "+923001234567",
      "profileImage": "https://example.com/avatar.jpg",
      "address": "456 Side St, Lahore",
      "role": "customer" // Or "provider", "admin"
    }
    ```

### Login a User
*   **Method:** POST
*   **Endpoint:** `/auth/login`
*   **Body (JSON):**
    ```json
    {
      "email": "jane@example.com",
      "password": "password123"
    }
    ```
*   *(Save the `token` from the response. You will need it to access protected routes).*

---

## 2. Using the Authentication Token

For protected routes (e.g., creating a booking, creating a service), you must include the JWT token in your request headers.

1.  In Postman/Thunder Client, go to the **Headers** tab for your request.
2.  Add a new key-value pair:
    *   **Key:** `Authorization`
    *   **Value:** `Bearer YOUR_JWT_TOKEN_HERE`

*(Alternatively, use the **Auth/Bearer Token** tab in Postman/Thunder Client).*

---

## 3. Services

### Get All Services (Public)
*   **Method:** GET
*   **Endpoint:** `/services`

### Create a Service (Protected: Provider/Admin)
*   **Method:** POST
*   **Endpoint:** `/services`
*   **Headers:** `Authorization: Bearer <token>`
*   **Body (JSON):**
    ```json
    {
      "title": "Deep Home Cleaning",
      "description": "Complete 3 BHK deep cleaning.",
      "category": "Cleaning",
      "price": 4500,
      "image": "https://images.unsplash.com/photo-1581578731548-c64695cc6952"
    }
    ```

---

## 4. Bookings

### Create a Booking (Protected: Customer)
*   **Method:** POST
*   **Endpoint:** `/bookings`
*   **Headers:** `Authorization: Bearer <token>`
*   **Body (JSON):**
    ```json
    {
      "provider": "664c123abc456def7890xyz", // Must be a valid User ObjectId with 'provider' role
      "service": "664d123abc456def7890xyz",  // Must be a valid Service ObjectId
      "date": "2024-05-20",
      "time": "10:00 AM",
      "address": "123 Main St, Lahore",
      "notes": "Please bring your own cleaning supplies."
    }
    ```

### Get My Bookings (Protected)
*   **Method:** GET
*   **Endpoint:** `/bookings`
*   **Headers:** `Authorization: Bearer <token>`

---

## 5. Reviews

### Add a Review (Protected)
*   **Method:** POST
*   **Endpoint:** `/reviews`
*   **Headers:** `Authorization: Bearer <token>`
*   **Body (JSON):**
    ```json
    {
      "serviceId": "664d123abc456def7890xyz", // Must be a valid Service ObjectId
      "rating": 5,
      "comment": "Excellent service!"
    }
    ```

### Get Reviews for a Service (Public)
*   **Method:** GET
*   **Endpoint:** `/reviews/services/664d123abc456def7890xyz/reviews` 
*(Replace with valid Service ID)*
