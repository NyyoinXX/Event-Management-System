# Academic City University Event Management System

## Project Overview
A comprehensive event management platform designed specifically for Academic City University. This system allows students and staff to view and register for campus events such as workshops, seminars, and club activities. Administrators can create and manage events, while users can easily RSVP and track their event participation.

## Deployment Links
- [FrontEnd](https://event-management-system-faf2.onrender.com)
- [Backend API](https://event-management-system-api-fv9o.onrender.com)

## Test Login Credentials

### Admin Account
- Email: admin@example.com
- Password: admin123

### Regular User Account
- Email: testuser@example.com
- Password: test123

## Features Checklist

### User Registration & Event Preferences ✅
- [x] User registration and login system
- [x] Role-based authentication (Admin/User)
- [x] User profile management
- [x] Event preference settings

### Event Listings & RSVP ✅
- [x] Display upcoming events with details
- [x] Real-time seat availability tracking
- [x] RSVP functionality
- [x] Event categorization (Workshops, Seminars, Club Activities)
- [x] Search and filter events

### Event Creation (Admin Only) ✅
- [x] Create new events with details
- [x] Upload event images
- [x] Set event capacity
- [x] Event management dashboard
- [x] Delete events

### Event Calendar View ✅
- [x] Interactive calendar interface
- [x] Date-based event viewing
- [x] Category-based filtering
- [x] Event details preview

## Installation Instructions

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn


## API Documentation

### Authentication Endpoints
- POST `/register` - User registration
- POST `/login` - User login
- POST `/logout` - User logout

### Event Endpoints
- GET `/events` - Get all events
- GET `/event/:id` - Get specific event
- POST `/createEvent` - Create new event (Admin only)
- DELETE `/event/:id` - Delete event (Admin only)

### RSVP Endpoints
- GET `/event/:id/rsvps` - Get event RSVPs
- POST `/event/:id/rsvp` - Create/update RSVP
- GET `/event/:id/my-rsvp` - Get user's RSVP for event

### User Endpoints
- GET `/user/:userId/rsvps` - Get user's RSVPs
- GET `/admin/event-responses` - Get all event responses (Admin only)

## API Testing Screenshots
[Include screenshots of Postman tests for key endpoints]

## Technologies Used
- Frontend: React, TailwindCSS, React Router, Axios
- Backend: Node.js, Express, PostgreSQL
- Authentication: JWT, bcrypt
- File Upload: Multer

## Contributors
- Terence Anquandah - 10022200077

## License
This project is part of the Web Technologies Final Examination.
