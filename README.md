# 🍽️ Restaurant Table Booking App

A backend application that allows users to browse restaurants, check table availability, and make reservations in real-time. Built with flexibility in mind to support dynamic table assignments, real-time booking conflicts, and user management.

---

## 🚀 Features

- 🔐 User authentication (signup, login, OTP verification)
- 🏢 Restaurant management (CRUD support for restaurants and tables)
- 📅 Real-time table availability based on date/time & active bookings
- 📖 Booking system with support for multiple tables per reservation
- ❌ Booking cancellation with reason tracking
- 🛠️ Built using RESTful APIs and Mongoose relationships

---

## 🧠 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (with Mongoose)
- **Auth**: JWT, OTP via email (Using nodemailer)

---

## 🗃️ Data Models

### User
- `email`, `password`, `emailVerified`, `createdAt`, `updatedAt`

### Restaurant
- `name`, `location`, `cuisine`, `numberOfTables`

### Table
- `tableNumber`, `capacity`, `restaurantId`

### Booking
- `userId`, `restaurantId`, `reservationDateTime`, `reservationEnd`, `reservationStatus`

### TableBooking
- Links tables to a booking (supports multi-table bookings)

### OTP
- Stores OTP codes linked to user, with expiry

### BookingCancellation
- Tracks who canceled a booking, when, and why

---

## 📖 API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/verify-otp`

### Users
- `GET /api/users/profile`
- `PUT /api/users/profile`

### Restaurants
- `POST /api/restaurants/`
- `GET /api/restaurants/`
- `GET /api/restaurants/:id`
- `PUT /api/restaurants/:id`
- `DELETE /api/restaurants/:id`

### Tables
- `POST /api/tables/` *(Add table to restaurant)*
- `GET /api/tables/restaurant/:restaurantId`
- `DELETE /api/tables/:id`

### Bookings
- `POST /api/bookings/` *(Create booking with tables)*
- `GET /api/bookings/user/:userId`
- `GET /api/bookings/restaurant/:restaurantId`
- `POST /api/bookings/check-availability` *(Returns available tables)*

### Booking Cancellation
- `POST /api/bookings/:id/cancel`

---

## 🛠️ Setup Instructions

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/restaurant-booking-app.git
   cd restaurant-booking-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```env
   MONGO_URI=your_mongo_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

---

## 🤝 Future Features (Ideas)

- 🧾 Admin dashboard for restaurant owners
- 📱 Responsive frontend (React or Vue)
- 🔔 Email notifications for bookings/cancellations
- 📊 Booking analytics (most active restaurants, peak hours)
- 🌐 Multi-language support

---

## 👨‍💻 Author

Built with ❤️ by **Raj**  
_“Saving lives one table at a time.”_ 😄
