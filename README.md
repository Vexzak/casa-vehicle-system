# Casa Vehicle Dealership Management System

A full-stack vehicle dealership management system built with Node.js, Express, React, and PostgreSQL. This system supports role-based access control for admins and regular users, featuring vehicle browsing, shopping cart, order management, messaging, and activity tracking.

## 🚀 Features

### For All Users (Including Guests)
- **Browse Vehicles**: View all available cars and motorcycles
- **Advanced Filtering**: Filter by type, brand, year range, and price range
- **Search Functionality**: Search vehicles by name or brand
- **Vehicle Details**: View detailed information including images, ratings, descriptions, and dealership location on an interactive map
- **Responsive Design**: Modern, mobile-friendly UI

### For Registered Users
- **Shopping Cart**: Add vehicles to cart and manage cart items
- **Purchase System**: Complete checkout and place orders
- **Order Tracking**: View order history and status (pending, approved, rejected, completed)
- **Messaging**: Send messages to admin about specific vehicles
- **Authentication**: Secure login and registration with JWT

### For Admin Users
- **Dashboard**: Overview of total vehicles, users, orders, and notifications
- **Vehicle Management**: Create, edit, and delete vehicles
- **Order Management**: View all orders and update order statuses
- **User Management**: View all registered users
- **Activity Logs**: Track all system activities
- **Notifications**: Receive notifications for new orders, messages, and registrations

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🛠️ Installation

### 1. Clone or Navigate to Project Directory

```bash
cd casa-vehicle-system
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file and configure your database credentials
# Example:
# PORT=5000
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=casa_vehicle_db
# DB_USER=postgres
# DB_PASSWORD=yourpassword
# JWT_SECRET=your_jwt_secret_key_change_this_in_production
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb casa_vehicle_db

# Or using psql
psql -U postgres
CREATE DATABASE casa_vehicle_db;
\q

# Initialize database tables
npm run init-db

# Seed sample data
npm run seed
```

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file (default: REACT_APP_API_URL=http://localhost:5000/api)
```

## 🚦 Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

### Start Frontend Development Server

```bash
cd frontend
npm start
# Application runs on http://localhost:3000
```

## 👥 Demo Credentials

### Admin Account
- **Email**: admin@casa.com
- **Password**: admin123

### Regular User Account
- **Email**: user@casa.com
- **Password**: user123

## 📁 Project Structure

```
casa-vehicle-system/
├── backend/
│   ├── config/
│   │   └── database.js          # PostgreSQL connection
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── vehicleController.js # Vehicle CRUD
│   │   ├── cartController.js    # Cart management
│   │   ├── orderController.js   # Order processing
│   │   ├── messageController.js # Messaging system
│   │   └── adminController.js   # Admin operations
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js              # Auth routes
│   │   ├── vehicles.js          # Vehicle routes
│   │   ├── cart.js              # Cart routes
│   │   ├── orders.js            # Order routes
│   │   ├── messages.js          # Message routes
│   │   └── admin.js             # Admin routes
│   ├── scripts/
│   │   ├── initDatabase.js      # Database initialization
│   │   └── seedData.js          # Sample data seeding
│   ├── uploads/                 # File uploads directory
│   ├── .env.example             # Environment variables template
│   ├── server.js                # Express server entry point
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js        # Navigation component
│   │   │   └── Navbar.css
│   │   ├── context/
│   │   │   └── AuthContext.js   # Authentication context
│   │   ├── pages/
│   │   │   ├── Home.js          # Home page with vehicle listing
│   │   │   ├── VehicleDetails.js # Vehicle detail page
│   │   │   ├── Login.js         # Login page
│   │   │   ├── Register.js      # Registration page
│   │   │   ├── Cart.js          # Shopping cart
│   │   │   ├── UserOrders.js    # User orders page
│   │   │   ├── AdminDashboard.js # Admin dashboard
│   │   │   ├── AdminVehicles.js  # Vehicle management
│   │   │   ├── AdminOrders.js    # Order management
│   │   │   └── [CSS files]
│   │   ├── utils/
│   │   │   └── api.js           # Axios API configuration
│   │   ├── App.js               # Main app with routing
│   │   ├── index.js             # React entry point
│   │   └── index.css            # Global styles
│   ├── .env.example
│   └── package.json
│
└── README.md
```

## 🗄️ Database Schema

### Tables

1. **users**: User accounts (admin and regular users)
2. **vehicles**: Vehicle inventory
3. **vehicle_images**: Vehicle image gallery
4. **cart**: Shopping cart items
5. **orders**: Purchase orders
6. **messages**: User-admin messaging
7. **activity_logs**: System activity tracking
8. **notifications**: Admin notifications

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### Vehicles
- `GET /api/vehicles` - Get all vehicles (with filters)
- `GET /api/vehicles/:id` - Get vehicle by ID
- `GET /api/vehicles/brands` - Get all brands
- `POST /api/vehicles` - Create vehicle (admin only)
- `PUT /api/vehicles/:id` - Update vehicle (admin only)
- `DELETE /api/vehicles/:id` - Delete vehicle (admin only)

### Cart
- `GET /api/cart` - Get user cart (protected)
- `POST /api/cart/add` - Add to cart (protected)
- `DELETE /api/cart/:id` - Remove from cart (protected)

### Orders
- `POST /api/orders` - Create order (protected)
- `GET /api/orders/user` - Get user orders (protected)
- `GET /api/orders/all` - Get all orders (admin only)
- `PUT /api/orders/:id/status` - Update order status (admin only)

### Messages
- `POST /api/messages` - Send message (protected)
- `GET /api/messages/user` - Get user messages (protected)
- `GET /api/messages/all` - Get all messages (admin only)
- `PUT /api/messages/:id/reply` - Reply to message (admin only)

### Admin
- `GET /api/admin/dashboard` - Dashboard stats (admin only)
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/activity-logs` - Get activity logs (admin only)
- `GET /api/admin/notifications` - Get notifications (admin only)

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface with gradient backgrounds
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile devices
- **Interactive Maps**: Location display using Leaflet/OpenStreetMap
- **Image Galleries**: Multiple vehicle images with thumbnail navigation
- **Real-time Updates**: Cart count updates, notification badges
- **Status Indicators**: Color-coded status badges for orders and vehicles
- **Filtering System**: Advanced filters for vehicle search
- **Role-based Navigation**: Different menus for admin and regular users

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Role-based access control (RBAC)
- SQL injection prevention (parameterized queries)
- CORS configuration

## 🚧 Guest Access

Guests (non-logged-in users) can:
- Browse all vehicles
- Use search and filters
- View vehicle details
- See dealership locations

Guests cannot:
- Add items to cart
- Purchase vehicles
- Send messages
- View orders

**Login Required**: When guests click "Add to Cart" or "Buy Now", they are automatically redirected to the login page.

## 📱 Key Workflows

### User Registration and Purchase Flow
1. Guest browses vehicles
2. Guest clicks "Add to Cart" → Redirected to login/register
3. User registers → Redirected back to vehicle
4. User adds vehicle to cart
5. User proceeds to checkout
6. Order is placed with "pending" status
7. Admin receives notification
8. Admin can approve/reject/complete order

### Admin Vehicle Management
1. Admin logs in → Redirected to dashboard
2. Admin views statistics and recent activity
3. Admin navigates to "Manage Vehicles"
4. Admin can create, edit, or delete vehicles
5. All actions are logged in activity logs

## 🧪 Testing

### Sample Data Included
- 6 sample vehicles (mix of cars and motorcycles)
- 2 user accounts (1 admin, 1 regular user)
- Sample activity logs
- Sample notifications

### Manual Testing Steps
1. Test guest access (browse without login)
2. Test registration and login
3. Test adding to cart (requires login)
4. Test checkout process
5. Test order management (admin)
6. Test vehicle CRUD operations (admin)

## 🛠️ Technologies Used

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **PostgreSQL**: Relational database
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **CORS**: Cross-origin resource sharing
- **Multer**: File uploads

### Frontend
- **React**: UI library
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **Leaflet**: Interactive maps
- **React Icons**: Icon library

## 📝 Notes

- Default images use placeholder URLs (via.placeholder.com)
- To use real images, upload files and update vehicle image paths
- Map requires latitude/longitude coordinates
- Notifications are created automatically for key events
- Activity logs track all important system actions

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Verify database exists
psql -U postgres -l
```

### Port Already in Use
```bash
# Change PORT in backend/.env
# Change proxy in frontend/package.json if needed
```

### CORS Errors
- Ensure backend is running on port 5000
- Check REACT_APP_API_URL in frontend/.env

## 📄 License

This project is created for educational purposes.

## 👨‍💻 Author

Created as a comprehensive full-stack vehicle dealership management system.

---

**Happy Coding! 🚗🏍️**
