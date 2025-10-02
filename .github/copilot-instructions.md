# AI Agent Instructions for Electronic Shop Project

## Project Overview

This is a Vue 3 e-commerce application with a Node.js/Express backend. The project uses:

- Frontend: Vue 3 with Composition API, Vue Router, Tailwind CSS
- Backend: Express.js, MongoDB, JWT authentication
- Key features: Product catalog, cart management, authentication, responsive design

## Project Structure

````
FE/                    # Frontend Vue application
├── src/
│   ├── api/          # API service layers
│   ├── components/   # Reusable Vue components
│   ├── routes/       # Vue router configuration
│   ├── utils/        # Utility functions
│   └── views/        # Page components
BE/     # Backend Express application
├── src/
│   ├── config/       # Configuration files
│   ├── controllers/  # Route controllers
│   ├── middleware/   # Express middleware
│   ├── models/       # Mongoose models
│   └── routes/       # Express routes


## Key Patterns and Conventions

### Frontend Patterns

1. **Component Organization**

   - Use `<script setup>` syntax for Vue 3 components
   - Components follow kebab-case naming (e.g., `product-card.vue`)
   - Reusable components live in `src/components/`

2. **State Management**

   - Reactive state with `ref` and `computed`
   - API calls centralized in `src/api/` services
   - Component-level state with `ref/reactive`

3. **Styling**
   - Tailwind CSS for styling
   - Scoped styles in components
   - Responsive design with Tailwind breakpoints

### Backend Patterns

1. **API Structure**

   - RESTful endpoints in `routes/`
   - Controllers handle business logic
   - Mongoose models define data schema

2. **Authentication**
   - JWT-based auth with Bearer token
   - Auth middleware for protected routes
   - Token management in `authMiddleware.js`

## Common Development Tasks

### Adding New Features

1. Frontend:

   ```javascript
   // New component template
   <script setup>
   import { ref, computed } from 'vue'
   // Component logic
   </script>

   <template>
     <!-- Template with Tailwind classes -->
   </template>
````

2. Backend:
   ```javascript
   // New route template
   import express from "express";
   const router = express.Router();
   router.get("/", controllerFunction);
   export default router;
   ```

### Working with Products

- Product data structure follows `src/models/products.model.js` schema
- Use `ProductCard` component for consistent product display
- Product images handle fallbacks via `getFullImage` utility

### Styling Guidelines

- Use Tailwind utility classes for styling
- Follow responsive design patterns:
  ```html
  <div
    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
  ></div>
  ```
- Mobile-first approach with progressive enhancement

## Testing and Debugging

- Console logs in service layer for API debugging
- Error boundaries in API calls with try/catch
- Detailed error messages in development mode

## Common Pitfalls

- Always handle API loading/error states
- Check token expiration in auth flows
- Validate image URLs and provide fallbacks
- Handle responsive layouts at all breakpoints
