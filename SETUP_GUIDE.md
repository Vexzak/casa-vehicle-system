# Casa Vehicle System - Complete Setup Guide

## Quick Start Guide

### Step 1: Install Prerequisites

Ensure you have the following installed:
- **Node.js** (v14+): Download from https://nodejs.org/
- **PostgreSQL** (v12+): Download from https://www.postgresql.org/download/
- **Git** (optional): For version control

### Step 2: Database Setup

#### Option A: Using psql Command Line

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE casa_vehicle_db;

# Exit psql
\q
```

#### Option B: Using pgAdmin

1. Open pgAdmin
2. Right-click on "Databases"
3. Select "Create" → "Database"
4. Name it: `casa_vehicle_db`
5. Click "Save"

### Step 3: Backend Configuration

```bash
# Navigate to backend directory
cd casa-vehicle-system/backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your database credentials
# For Windows: notepad .env
# For Mac/Linux: nano .env or vim .env
```

**Edit .env file:**
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=casa_vehicle_db
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD
JWT_SECRET=your_very_secure_secret_key_12345
NODE_ENV=development
```

### Step 4: Initialize Database

```bash
# Still in backend directory

# Initialize database tables
npm run init-db

# You should see:
# ✅ Users table created
# ✅ Vehicles table created
# ✅ Vehicle images table created
# ✅ Cart table created
# ✅ Orders table created
# ✅ Messages table created
# ✅ Activity logs table created
# ✅ Notifications table created

# Seed sample data
npm run seed

# You should see:
# ✅ Admin user created (email: admin@casa.com, password: admin123)
# ✅ Regular user created (email: user@casa.com, password: user123)
# ✅ Sample vehicles created
```

### Step 5: Start Backend Server

```bash
# Start the server
npm run dev

# You should see:
# 🚀 Server is running on port 5000
# 📡 API available at http://localhost:5000/api
# ✅ Connected to PostgreSQL database
```

**Leave this terminal running!**

### Step 6: Frontend Configuration

Open a **NEW terminal window** and run:

```bash
# Navigate to frontend directory
cd casa-vehicle-system/frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file (usually no changes needed)
# REACT_APP_API_URL=http://localhost:5000/api
```

### Step 7: Start Frontend Server

```bash
# Still in frontend directory

# Start React development server
npm start

# Browser should automatically open at http://localhost:3000
# If not, manually navigate to http://localhost:3000
```

## Verification Checklist

### ✅ Backend Running Successfully
- Terminal shows: "Server is running on port 5000"
- Terminal shows: "Connected to PostgreSQL database"
- Visit http://localhost:5000/api/health - Should show: `{"status":"OK"}`

### ✅ Frontend Running Successfully
- Terminal shows: "webpack compiled successfully"
- Browser opens at http://localhost:3000
- You can see the Casa Vehicles homepage with vehicle listings

### ✅ Database Populated
- You should see 6 sample vehicles on the homepage
- Vehicles include Tesla Model 3, BMW X5, Honda CBR1000RR, etc.

## Testing the Application

### 1. Test Guest Access (No Login Required)

- Browse vehicles on homepage
- Use search: Try searching "Tesla" or "BMW"
- Apply filters:
  - Type: Car
  - Brand: Select a brand
  - Year range: 2023-2024
  - Price range: 0-50000
- Click on a vehicle to view details
- See the map showing dealership location
- Try clicking "Add to Cart" → Should redirect to login

### 2. Test User Registration

- Click "Register" in the navbar
- Fill in the form:
  - Full Name: Test User
  - Email: test@test.com
  - Password: test123
  - Confirm Password: test123
- Click "Register"
- You should be redirected to login page
- Log in with your new credentials

### 3. Test User Features

**Login as Regular User:**
- Email: user@casa.com
- Password: user123

After login, test:
- Add vehicles to cart
- View cart (cart icon shows item count)
- Remove items from cart
- Proceed to checkout
- View "My Orders" page
- Check order status

### 4. Test Admin Features

**Login as Admin:**
- Email: admin@casa.com
- Password: admin123

After login, test:
- View Dashboard (see statistics)
- Manage Vehicles:
  - Click "Add Vehicle" button
  - Fill in vehicle details
  - Submit form
  - Edit existing vehicle
  - Delete a vehicle
- Manage Orders:
  - View all orders
  - Change order status (Pending → Approved → Completed)
- View Activity Logs
- Check Notifications

## Common Issues and Solutions

### Issue: Database Connection Failed

**Error:** `Error: connect ECONNREFUSED`

**Solution:**
1. Ensure PostgreSQL is running:
   - Windows: Check Services for "postgresql"
   - Mac: `brew services list`
   - Linux: `sudo service postgresql status`
2. Verify credentials in backend/.env
3. Check if database exists:
   ```bash
   psql -U postgres -l
   ```

### Issue: Port Already in Use

**Error:** `Port 5000 is already in use`

**Solution:**
1. Find and kill the process:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F

   # Mac/Linux
   lsof -i :5000
   kill -9 <PID>
   ```
2. Or change port in backend/.env

### Issue: Frontend Can't Connect to Backend

**Error:** Network errors or CORS issues

**Solution:**
1. Ensure backend is running on http://localhost:5000
2. Check frontend/.env:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```
3. Restart both servers

### Issue: Tables Not Created

**Error:** `relation "users" does not exist`

**Solution:**
```bash
cd backend
npm run init-db
```

### Issue: No Sample Data

**Solution:**
```bash
cd backend
npm run seed
```

## Environment Variables Reference

### Backend (.env)
```env
PORT=5000                    # Backend server port
DB_HOST=localhost            # PostgreSQL host
DB_PORT=5432                # PostgreSQL port
DB_NAME=casa_vehicle_db     # Database name
DB_USER=postgres            # Database user
DB_PASSWORD=yourpassword    # Database password
JWT_SECRET=secret_key       # JWT secret (change in production)
NODE_ENV=development        # Environment
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api  # Backend API URL
```

## Default Accounts

### Admin Account
- **Email:** admin@casa.com
- **Password:** admin123
- **Access:** Full system access, dashboard, vehicle management, order management

### User Account
- **Email:** user@casa.com
- **Password:** user123
- **Access:** Browse, cart, orders, messages

## Production Deployment Notes

### Backend Deployment
1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure production database
4. Set up SSL/TLS
5. Use environment-specific .env files
6. Enable rate limiting
7. Set up logging

### Frontend Deployment
1. Build production bundle:
   ```bash
   npm run build
   ```
2. Deploy build folder to hosting service
3. Update `REACT_APP_API_URL` to production API URL
4. Configure CORS on backend for production domain

## Next Steps

### Customization Ideas
1. **Add Payment Integration:** Stripe, PayPal
2. **Email Notifications:** SendGrid, Nodemailer
3. **Image Upload:** AWS S3, Cloudinary
4. **Advanced Search:** Elasticsearch
5. **Reviews & Ratings:** Allow users to rate vehicles
6. **Wishlist Feature:** Save favorite vehicles
7. **Compare Vehicles:** Side-by-side comparison
8. **Appointment Booking:** Schedule test drives

### Enhancement Suggestions
1. Add vehicle comparison feature
2. Implement real-time chat
3. Add admin analytics dashboard
4. Create mobile app version
5. Add multi-language support
6. Implement advanced reporting
7. Add inventory management
8. Create API documentation with Swagger

## Support

For issues or questions:
1. Check error messages in terminal
2. Review browser console (F12)
3. Verify all prerequisites are installed
4. Ensure both servers are running
5. Check database connection

## Files Overview

### Must Have Files
- ✅ Backend package.json
- ✅ Backend server.js
- ✅ Backend .env (from .env.example)
- ✅ Database initialization script
- ✅ Frontend package.json
- ✅ Frontend src/App.js
- ✅ Frontend .env (from .env.example)

### Auto-Generated (Don't Commit)
- node_modules/ (backend & frontend)
- build/ (frontend)
- .env files

## Success Indicators

You know everything is working when:
1. ✅ Backend terminal shows "Server is running"
2. ✅ Frontend opens in browser automatically
3. ✅ You can see 6 sample vehicles on homepage
4. ✅ You can log in with demo credentials
5. ✅ Cart functionality works
6. ✅ Admin can manage vehicles
7. ✅ No errors in browser console
8. ✅ No errors in backend terminal

---

**Congratulations! Your Casa Vehicle System is now running! 🎉**
