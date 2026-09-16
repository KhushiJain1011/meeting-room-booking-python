## Meeting Room Booking System ##

A full-stack Meeting Room Booking System built for the Full Stack Developer take-home assignment.

Users can view rooms and bookings, create and cancel bookings, filter bookings by room/date, and find the next available time slot.

# Features 

- View meeting rooms and bookings by date
- Filter bookings by room
- Create and cancel bookings
- Validate booking times
- Working hours: 09:00–18:00
- Prevent overlapping bookings
- Allow back-to-back bookings
- Return the existing booking when a conflict occurs
- Find the earliest available slot for a requested duration
- Responsive UI with loading, empty, success, conflict, and error states
- Toast notifications using backend error/success messages
- FastAPI Swagger/OpenAPI documentation

## Tech Stack 

# Frontend 
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React

# Backend 
- Python
- FastAPI
- SQLAlchemy
- Pydantic
- Uvicorn

# Database 
- PostgreSQL

Project Structure
meeting-room-booking/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── crud.py
│   │   └── booking_logic.py
│   ├── seed.py
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── public/
│   └── package.json
│
└── README.md

Booking business logic is separated from the API route handlers.

# Booking Logic
Conflict Detection
- A booking is rejected when its time overlaps an existing booking in the same room.

  start_time < existing_booking.end_time \
  and end_time > existing_booking.start_time


This allows back-to-back bookings such as 10:00–11:00 and 11:00–12:00.

The API returns 409 Conflict and identifies the booking causing the conflict.

Other validation includes:
- End time must be after start time
- Booking must be within 09:00–18:00
- Room must exist

Next Available Slot:
The API finds the earliest available slot for a requested duration by checking:
- The gap before the first booking
- Gaps between bookings
- The gap after the last booking
If no suitable slot exists, the API returns an appropriate error message.
The scheduling logic was implemented manually without a scheduling library.

# Backend Setup
Requirements
- Python 3.10+
- PostgreSQL
- pip

From the backend directory:

cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt


Create a PostgreSQL database, for example:

meeting_booking


Create backend/.env:

DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/meeting_booking


Seed the predefined meeting rooms:

python seed.py


Start the backend:

uvicorn app.main:app --reload


Backend:
http://127.0.0.1:8000


Swagger documentation:
http://127.0.0.1:8000/docs



# Frontend Setup

From the frontend directory:

cd frontend
npm install


Create frontend/.env.local:
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000


Start the frontend:
npm run dev


Frontend:
http://localhost:3000


Make sure the backend is running at the same time.

API Endpoints

Method	Endpoint	Description

GET	/	Health check

GET	/api/rooms	Get all rooms

GET	/api/bookings?date=YYYY-MM-DD	Get bookings by date

GET	/api/bookings?date=YYYY-MM-DD&room_id=1	Filter bookings by room

POST	/api/bookings	Create a booking

DELETE	/api/bookings/{booking_id}	Cancel a booking

GET	/api/rooms/{room_id}/next-available	Find next available slot

Example:

GET /api/rooms/3/next-available?date=2026-09-15&duration=45

# Validation & Error Handling

The frontend validates input before making requests. Backend validation is handled through FastAPI/Pydantic and custom booking logic.

HTTP status codes include:

200 — Successful request

201 — Booking created

400 — Invalid booking data

404 — Room or booking not found

409 — Booking conflict

Backend messages are displayed directly through frontend toast notifications.

# Deployment

Frontend: Vercel

Backend: Render

Database: PostgreSQL

Live Links

Frontend: https://meeting-room-booking-python-bxerlowlp.vercel.app/

Backend: https://meeting-room-booking-python.onrender.com

API Docs: https://meeting-room-booking-python.onrender.com/docs

## Known Limitations

The project focuses on the requirements of the assignment and does not include:

- Authentication/user accounts
- Room creation or editing
- Recurring bookings
- Email notifications
- Calendar integrations
- Real-time WebSocket updates
- Rooms are predefined and loaded using the seed script as required by the assignment.

# Status

Core functionality: Complete

Booking conflict detection: Complete

Next available slot: Pending

Frontend: Complete

Backend API: Complete

PostgreSQL integration: Complete

Deployment: Pending