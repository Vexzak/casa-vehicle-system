import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import '../css/UserOrders.css';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/user');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      approved: 'blue',
      rejected: 'red',
      completed: 'green',
    };
    return colors[status] || 'gray';
  };

  if (loading) return <div className="loader"></div>;

  return (
    <div className="user-orders-page">
      <div className="container">
        <h1>My Orders</h1>

        {orders.length === 0 ? (
          <div className="no-orders">
            <p>You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <h3>Order #{order.id}</h3>
                  <span className={`status-badge ${order.status}`} style={{ background: getStatusColor(order.status) }}>
                    {order.status}
                  </span>
                </div>

                <div className="order-body">
                  {order.images && order.images.length > 0 && (
                    <img src={order.images[0].image_path} alt={order.vehicle_name} />
                  )}

                  <div className="order-details">
                    <h4>{order.vehicle_name}</h4>
                    <p>{order.brand} • {order.type}</p>
                    <p className="order-price">${parseFloat(order.total_price).toLocaleString()}</p>
                    <p className="order-date">
                      Ordered on: {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrders;
