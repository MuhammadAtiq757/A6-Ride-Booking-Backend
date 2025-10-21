# 🚗 LoopRide API

A **secure, scalable, and role-based backend API** for a ride booking system (like Uber/Pathao) built with **Express.js**, **TypeScript**, and **MongoDB**.

## 🎯 Project Overview

This API provides a complete ride booking platform where:
- **Riders** can request rides, track status, and provide feedback
- **Drivers** can accept rides, update status, and manage availability
- **Admins** can oversee the entire system, manage users, and generate reports

## ✨ Key Features

### 🔐 **Authentication & Authorization**
- JWT-based authentication system
- Role-based access control (Admin, Driver, Rider)
- Secure password hashing with bcryptjs
- Protected routes with middleware validation

### 🧍 **Rider Features**
- Request rides with pickup & destination coordinates
- Cancel rides (within allowed window)
- View complete ride history
- Rate and provide feedback on completed rides
- Real-time ride status tracking

### 🚗 **Driver Features**
- View available ride requests
- Accept/reject ride requests
- Update ride status throughout journey
- Set availability status (Online/Offline)
- View earnings and ride history
- Driver approval system

### 👨‍💼 **Admin Features**
- View all users, drivers, and rides
- Approve/suspend driver accounts
- Block/unblock user accounts
- Comprehensive system oversight
- User management dashboard

### 🛣️ **Ride Management**
- Complete ride lifecycle tracking
- Status progression: `REQUESTED` → `ACCEPTED` → `PICKED_UP` → `IN_TRANSIT` → `COMPLETED`
- Timestamp logging for all status changes
- Cancellation handling with reason tracking
- Prevention of ride conflicts

## 🏗️ **Architecture**

### **Tech Stack**
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT + bcryptjs
- **Validation:** Zod schemas
- **Session Management:** Express-session
- **Email:** Nodemailer
- **Caching:** Redis

### **Project Structure**
```
src/
├── modules/
│   ├── auth/          # Authentication logic
│   ├── user/          # User management
│   ├── driver/        # Driver-specific features
│   ├── ride/          # Core ride functionality
├── middlewares/       # Custom middleware
├── config/           # Configuration files
├── utils/            # Utility functions
├── errorHelpers/     # Error handling
└── app.ts            # Main application
```

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js (v16 or higher)
- MongoDB
- Redis (optional, for caching)

### **Installation**

1. **Clone the repository**
```bash
git clone <repository-url>
cd ride-booking-api
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ride-booking
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Session Secret
SESSION_SECRET=your-session-secret

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

4. **Start the development server**
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## 📡 **API Endpoints**

### **Authentication**
```http
POST   /api/auth/register           # User registration
POST   /api/auth/login              # User login
POST   /api/auth/logout             # User logout
POST   /api/auth/refresh-token      # Refresh JWT token
```

### **User Management**
```http
GET    /api/users/profile           # Get user profile
PATCH  /api/users/profile           # Update profile
GET    /api/users                   # Get all users (Admin only)
PATCH  /api/users/block/:id         # Block/unblock user (Admin)
```

### **Driver Management**
```http
POST   /api/drivers/register        # Driver registration
PATCH  /api/drivers/approve/:id     # Approve driver (Admin)
PATCH  /api/drivers/status          # Update availability status
GET    /api/drivers                 # Get all drivers (Admin)
GET    /api/drivers/earnings        # Get driver earnings
```

### **Ride Management**
```http
# Rider Endpoints
POST   /api/rides/request-ride      # Request a new ride
GET    /api/rides/all-ride-riders   # Get rider's ride history
PATCH  /api/rides/cancel/:rideId    # Cancel ride

# Driver Endpoints
GET    /api/rides/available         # Get available rides
PATCH  /api/rides/accept/:rideId    # Accept ride request
PATCH  /api/rides/status/:rideId    # Update ride status

# General Endpoints
GET    /api/rides/my-ride/:id       # Get single ride details
POST   /api/rides/feedback/:rideId  # Submit ride feedback
GET    /api/rides/all-ride-admin-driver # Get all rides (Admin/Driver)
```

## 🎭 **User Roles & Permissions**

### **👤 Rider (RIDER)**
- Request rides
- Cancel own rides (before pickup)
- View own ride history
- Rate completed rides

### **🚗 Driver (DRIVER)**
- View available ride requests
- Accept/reject rides
- Update ride status
- Set online/offline status
- View own ride history and earnings

### **👨‍💼 Admin (ADMIN/SUPER_ADMIN)**
- Full system access
- Manage all users and drivers
- View all rides and analytics
- Approve/suspend accounts
- Override ride statuses

## 📊 **Data Models**

### **User Schema**
```typescript
{
  name: string
  email: string
  password: string (hashed)
  phone: string
  role: 'RIDER' | 'DRIVER' | 'ADMIN' | 'SUPER_ADMIN'
  isActive: 'ACTIVE' | 'INACTIVE'
  isBlocked: 'BLOCKED' | 'UNBLOCKED'
  isDeleted: boolean
}
```

### **Driver Schema**
```typescript
{
  userId: ObjectId (ref: User)
  licenseNumber: string
  vehicleInfo: {
    make: string
    model: string
    year: number
    plateNumber: string
  }
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  driverStatus: 'ONLINE' | 'OFFLINE'
  rating: number
}
```

### **Ride Schema**
```typescript
{
  riderId: ObjectId (ref: User)
  driverId: ObjectId (ref: Driver)
  pickupLocation: { lati: number, long: number, address?: string }
  destination: { lati: number, long: number, address?: string }
  rideStatus: 'REQUESTED' | 'ACCEPTED' | 'PICKED_UP' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED'
  fare: number
  distance: number
  timestampsLog: {
    requestedAt: Date
    acceptedAt?: Date
    pickedUpAt?: Date
    completedAt?: Date
    cancelledAt?: Date
  }
  feedback?: string
  rating?: number
  cancelledBy?: ObjectId
  cancelReason?: string
}
```

## 🔐 **Security Features**

- **JWT Authentication** with secure token management
- **Password Hashing** using bcryptjs
- **Input Validation** with Zod schemas
- **Role-based Access Control** for all endpoints
- **Rate Limiting** and request validation
- **Secure Headers** and CORS configuration
- **Environment Variable** protection

## 🧪 **Testing**

```bash
# Run linting
npm run lint

# Run tests (when implemented)
npm test
```

## 🚀 **Deployment**

### **Environment Variables for Production**
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
REDIS_URL=your-production-redis-url
JWT_SECRET=your-production-jwt-secret
# ... other production configs
```

### **Build Commands**
```bash
# Install dependencies
npm install

# Start production server
npm start

# Development server
npm run dev
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **API Documentation**

### **Authentication Required**
Most endpoints require a valid JWT token in the Authorization header:
```http
Authorization: Bearer <your-jwt-token>
```

### **Error Responses**
All errors follow a consistent format:
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "error": "Detailed error information"
}
```

### **Success Responses**
All successful responses follow this format:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

## 🛠️ **Future Enhancements**

- [ ] Real-time WebSocket notifications
- [ ] Geo-location based driver matching
- [ ] Fare estimation algorithm
- [ ] Payment gateway integration
- [ ] Advanced analytics dashboard
- [ ] Mobile push notifications
- [ ] Multi-language support

## 📝 **License**

This project is licensed under the ISC License.

## 🙋‍♂️ **Support**

For support, email jobayerhossen2903@gmail.com or create an issue in the repository.

---

**Built with ❤️ using Node.js, Express.js, and MongoDB**