import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { Check, ArrowLeft, Bell } from 'lucide-react';
import ConfettiExplosion from '../utils/ConfettiExplosion';
import OrderStatusTracker from './OrderStatusTracker';
import './OrderNotification.css';

interface OrderCompleteProps {
  orderNumber: string;
  orderId?: string;
  onNewOrder: () => void;
}

const OrderComplete: React.FC<OrderCompleteProps> = ({ 
  orderNumber,
  orderId,
  onNewOrder
}) => {
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [orderStatus, setOrderStatus] = React.useState<string>('pending');
  const [notification, setNotification] = React.useState<{show: boolean, message: string}>({show: false, message: ''});
  
  // Request notification permission when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);
  
  // Subscribe to order status updates
  useEffect(() => {
    // Delay confetti slightly for better effect
    const timer = setTimeout(() => {
      setShowConfetti(true);
    }, 300);
    
    // Only subscribe to updates if we have an order ID
    if (orderId) {
      // Import the subscribeToOrderStatus function dynamically to avoid circular dependencies
      import('../lib/supabase').then(({ subscribeToOrderStatus, getOrderStatus }) => {
        // First get the current status
        getOrderStatus(orderId).then(status => {
          if (status) {
            setOrderStatus(status);
          }
        }).catch(error => {
          console.error('Error getting initial order status:', error);
        });
        
        // Subscribe to status updates
        const subscription = subscribeToOrderStatus(orderId, (payload) => {
          console.log('Order status update received:', payload);
          
          // Update the order status
          if (payload.new && payload.new.status) {
            const newStatus = payload.new.status;
            setOrderStatus(newStatus);
            
            // Show a notification
            const statusMessages: Record<string, string> = {
              'pending': 'Your order has been received',
              'in-progress': 'Your order is being prepared',
              'completed': 'Your order is ready for pickup!',
              'cancelled': 'Your order has been cancelled'
            };
            
            if (statusMessages[newStatus]) {
              // Show in-app notification
              setNotification({
                show: true,
                message: statusMessages[newStatus]
              });
              
              // Hide notification after 5 seconds
              setTimeout(() => {
                setNotification({show: false, message: ''});
              }, 5000);
            }
          }
        });
        
        // Clean up subscription when component unmounts
        return () => {
          subscription.unsubscribe();
        };
      });
    }
    
    return () => clearTimeout(timer);
  }, [orderId]);
  
  // Request notification permission when the user first views the order complete page
  useEffect(() => {
    // Request notification permission if not already granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted') {
      // Show a message encouraging the user to enable notifications
      console.log('Requesting notification permission for order updates');
      Notification.requestPermission();
    }
  }, []);
  
  // Status descriptions
  const statusDescriptions: Record<string, string> = {
    'pending': 'Your order has been received and is waiting to be prepared.',
    'in-progress': 'Our staff is now preparing your order. It won\'t be long!',
    'completed': 'Your order is ready! Please come to the counter to pick it up.',
    'cancelled': 'Your order has been cancelled. Please contact staff for assistance.'
  };

  return (
    <motion.div
      className="glass-panel text-center mx-auto max-w-md"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", duration: 0.5 }}
    >
      {showConfetti && <ConfettiExplosion />}
      
      {/* Notification toast */}
      {notification.show && (
        <motion.div 
          className="fixed top-4 right-4 left-4 bg-primary-600 text-white p-4 rounded-lg shadow-lg z-50 flex items-center justify-between"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
        >
          <div className="flex items-center">
            <div className="mr-3 bg-white rounded-full p-1">
              <Check className="text-primary-600" size={16} />
            </div>
            <span>{notification.message}</span>
          </div>
        </motion.div>
      )}
      
      <div className="flex justify-center mb-6">
        <motion.div
          className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center"
          animate={{ 
            scale: [1, 1.1, 1],
            backgroundColor: ['#dbe5cd', '#a3b18a', '#dbe5cd'] 
          }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        >
          <Check className="text-primary-600" size={40} />
        </motion.div>
      </div>
      
      <h2 className="text-2xl font-medium text-gray-800 mb-2">Order Complete!</h2>
      <p className="text-gray-600 mb-4">
        Thank you for your order. Your beverages and treats are being prepared with care.
      </p>
      
      <div className="bg-cream-100 rounded-xl p-4 mb-6">
        <div className="text-sm text-gray-600 mb-1">Your order number</div>
        <div className="text-3xl font-bold text-primary-600 tracking-wider mb-1">
          #{orderNumber}
        </div>
        <div className="text-sm text-gray-600">
          Please listen for your number to be called
        </div>
      </div>
      
      {/* Order status section */}
      <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-600">Order Status</div>
          <div className={`status-badge ${orderStatus}`}>
            {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
          </div>
        </div>
        
        {/* Status tracker */}
        <OrderStatusTracker currentStatus={orderStatus} />
        
        <p className="text-sm text-gray-600 mt-3">
          {statusDescriptions[orderStatus] || 'Your order status will update here.'}
        </p>
        
        {/* Notification preferences */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="text-xs text-gray-500">Status updates</div>
          <div className="flex items-center">
            <Bell size={14} className="text-primary-500 mr-1" />
            <span className="text-xs text-primary-600">Notifications enabled</span>
          </div>
        </div>
      </div>
      
      <Button 
        variant="primary" 
        onClick={onNewOrder} 
        icon={<ArrowLeft size={18} />}
        fullWidth
      >
        Start New Order
      </Button>
    </motion.div>
  );
};

export default OrderComplete;