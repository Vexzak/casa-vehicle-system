import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Pages
import Home           from './pages/js/Home';
import VehicleDetails from './pages/js/VehicleDetails';
import Login          from './pages/js/Login';
import Register       from './pages/js/Register';
import Cart           from './pages/js/Cart';
import UserOrders     from './pages/js/UserOrders';
import Reservations   from './pages/js/Reservations';
import Wishlist       from './pages/js/Wishlist';
import AdminDashboard from './pages/js/AdminDashboard';
import AdminVehicles  from './pages/js/AdminVehicles';
import AdminOrders    from './pages/js/AdminOrders';

// ── NEW: Message pages ──────────────────────────────────────────────────────
import UserMessages   from './pages/js/UserMessages';
import AdminMessages  from './pages/js/AdminMessages';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <div className="loader" />;
  if (!user)   return <Navigate to="/login" />;
  if (adminOnly && !isAdmin()) return <Navigate to="/" />;

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <Routes>

            {/* Public */}
            <Route path="/"              element={<Home />} />
            <Route path="/vehicle/:id"   element={<VehicleDetails />} />
            <Route path="/login"         element={<Login />} />
            <Route path="/register"      element={<Register />} />

            {/* User */}
            <Route path="/cart"          element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/user/orders"   element={<ProtectedRoute><UserOrders /></ProtectedRoute>} />
            <Route path="/reservations"  element={<ProtectedRoute><Reservations /></ProtectedRoute>} />
            <Route path="/user/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />

            {/* ── User Messages (matches Navbar link: /user/messages) ── */}
            <Route
              path="/user/messages"
              element={
                <ProtectedRoute>
                  <UserMessages />
                </ProtectedRoute>
              }
            />

            {/* Admin */}
            <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/vehicles"  element={<ProtectedRoute adminOnly><AdminVehicles /></ProtectedRoute>} />
            <Route path="/admin/orders"    element={<ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>} />

            {/* ── Admin Messages (matches Navbar link: /admin/messages) ── */}
            <Route
              path="/admin/messages"
              element={
                <ProtectedRoute adminOnly>
                  <AdminMessages />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" />} />

          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;