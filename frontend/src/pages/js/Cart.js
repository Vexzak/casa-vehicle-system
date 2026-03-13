import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { FaTrash, FaShoppingCart } from 'react-icons/fa';
import '../css/Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      setCartItems(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (cartId) => {
    try {
      await api.delete(`/cart/${cartId}`);
      setCartItems(cartItems.filter(item => item.cart_id !== cartId));
      setAlert({ type: 'success', message: 'Item removed from cart' });
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to remove item' });
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setAlert({ type: 'error', message: 'Your cart is empty' });
      return;
    }

    try {
      const vehicleIds = cartItems.map(item => item.id);
      await api.post('/orders', { vehicle_ids: vehicleIds });
      setAlert({ type: 'success', message: 'Order placed successfully!' });
      setTimeout(() => navigate('/user/orders'), 2000);
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to place order' });
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + parseFloat(item.price), 0);
  };

  if (loading) {
    return <div className="loader"></div>;
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1><FaShoppingCart /> Shopping Cart</h1>

        {alert && (
          <div className={`alert alert-${alert.type}`}>
            {alert.message}
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <FaShoppingCart className="empty-cart-icon" />
            <h2>Your cart is empty</h2>
            <p>Browse our vehicles and add some to your cart!</p>
            <Link to="/" className="btn btn-primary">
              Browse Vehicles
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.cart_id} className="cart-item">
                  <div className="cart-item-image">
                    {item.images && item.images.length > 0 ? (
                      <img src={item.images[0].image_path} alt={item.name} />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                  </div>

                  <div className="cart-item-details">
                    <h3>{item.name}</h3>
                    <p className="cart-item-meta">
                      {item.brand} • {item.year} • {item.type}
                    </p>
                  </div>

                  <div className="cart-item-price">
                    ${parseFloat(item.price).toLocaleString()}
                  </div>

                  <button
                    onClick={() => handleRemove(item.cart_id)}
                    className="btn btn-danger"
                  >
                    <FaTrash /> Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-card">
                <h3>Order Summary</h3>

                <div className="summary-row">
                  <span>Items ({cartItems.length})</span>
                  <span>${calculateTotal().toLocaleString()}</span>
                </div>

                <div className="summary-total">
                  <strong>Total</strong>
                  <strong>${calculateTotal().toLocaleString()}</strong>
                </div>

                <button onClick={handleCheckout} className="btn btn-primary full-width">
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
