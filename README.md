# Smart Parking Reservation System

A MERN-stack web application where users choose a parking facility, see live slot availability, reserve a slot, and receive a booking ID with a QR code. An admin manages parking facilities, slots, bookings and users.

College project: Web Technology.

## Features

**User:** register, login, logout, view parking facilities, view slots, book a slot, booking ID + QR code, cancel booking, booking history, in-app messages.

**Admin:** login, dashboard statistics, add/delete parking (slots A01, A02... are created automatically), add slots, mark slots Available/Occupied, view all bookings, view users.

## Technology stack

| Part | Technology |
|---|---|
| Frontend | React.js (Vite), JavaScript, HTML, CSS, React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Security | bcrypt (password hashing), JWT (login token) |
| Other | qrcode, dotenv, REST APIs |
| Deployment | Docker, docker-compose, Kubernetes |

## Folder structure

```
Smart-Parking/
├── backend/
│   ├── models/        User.js  Parking.js  ParkingSlot.js  Booking.js
│   ├── routes/        authRoutes.js  parkingRoutes.js  bookingRoutes.js  adminRoutes.js
│   ├── controllers/   authController.js  parkingController.js  bookingController.js  adminController.js
│   ├── middleware/    authMiddleware.js
│   ├── utils/         updateAvailableSlots.js
│   ├── server.js  seed.js  .env  Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/  Navbar  ParkingCard  ParkingSlot  BookingCard  Notification
│   │   ├── pages/       Home  Login  Register  ParkingFacilities  ParkingSlots
│   │   │                BookingConfirmation  MyBookings  AdminDashboard
│   │   ├── services/api.js
│   │   └── AuthContext.jsx  App.jsx  main.jsx  index.css
│   └── index.html  vite.config.js  nginx.conf  Dockerfile
├── k8s/               deployment.yaml  service.yaml  secret.yaml
├── docker-compose.yml
└── README.md
```

## How to install and run (without Docker)

Requirements: Node.js and MongoDB.

**MongoDB setup:** install MongoDB Community Server and MongoDB Compass. MongoDB runs as a service on `mongodb://127.0.0.1:27017`.

**Backend**
```
cd backend
npm install
npm run seed
npm run dev
```
The backend runs on http://localhost:5000.

**Frontend** (in a second terminal)
```
cd frontend
npm install
npm run dev
```
The frontend runs on http://localhost:5173.

## Environment variables (backend/.env)

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smart-parking
JWT_SECRET=your_secret_text
```

The `.env` file is private and listed in `.gitignore`.

## Admin setup

`npm run seed` creates a sample admin:
- Email: admin@smartparking.com
- Password: Admin@123

**Change this password before sharing or deploying the project.**
The register page always creates normal users, so nobody can make themselves admin from the website.
`npm run seed` deletes all parkings, slots and bookings and creates fresh demo data. Users are kept.

## API overview

| Method | URL | Who | Purpose |
|---|---|---|---|
| POST | /api/auth/register | public | create account |
| POST | /api/auth/login | public | login, returns JWT |
| GET | /api/parking | user | list parkings |
| GET | /api/parking/:id | user | one parking |
| GET | /api/parking/:id/slots | user | latest slot status |
| POST | /api/parking | admin | add parking + automatic slots |
| DELETE | /api/parking/:id | admin | delete parking |
| POST | /api/parking/:id/slots | admin | add one slot |
| PUT | /api/parking/:id/slots/:slotId | admin | set Available/Occupied |
| POST | /api/bookings | user | book a slot |
| GET | /api/bookings/my | user | my bookings |
| GET | /api/bookings/:id | user | one booking |
| PUT | /api/bookings/:id/cancel | user | cancel booking |
| GET | /api/bookings | admin | all bookings |
| GET | /api/admin/dashboard | admin | statistics |
| GET | /api/admin/users | admin | registered users |

## Docker

Docker packages the application into containers so it runs the same on any computer.

```
docker compose up --build
docker compose exec backend node seed.js
```
Open http://localhost:3000. Stop with `docker compose down`.

## Kubernetes

Kubernetes manages and deploys the containers.

```
docker tag smart-parking-backend:latest smart-parking-backend:1.0
docker tag smart-parking-frontend:latest smart-parking-frontend:1.0
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl get pods
kubectl exec deploy/backend -- node seed.js
```
Open http://localhost:30080. Remove everything with `kubectl delete -f k8s/`.

The MongoDB pod has no permanent volume, so data is lost if that pod is deleted. This is fine for a demo.

## Basic backend flow (booking a slot)

```
React button -> api.js -> Express route -> JWT middleware -> booking controller
-> MongoDB (is the slot Available?) -> create booking + QR -> slot = Reserved
-> JSON response -> React shows the confirmation page
```