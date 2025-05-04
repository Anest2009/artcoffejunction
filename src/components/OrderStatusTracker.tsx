import React from 'react';
import { Check, Clock, Coffee, X } from 'lucide-react';
import './OrderNotification.css';

interface OrderStatusTrackerProps {
  currentStatus: string;
}

const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({ currentStatus }) => {
  // Define the order statuses and their sequence
  const statuses = [
    { id: 'pending', label: 'Received', icon: <Clock size={14} /> },
    { id: 'in-progress', label: 'Preparing', icon: <Coffee size={14} /> },
    { id: 'completed', label: 'Ready', icon: <Check size={14} /> }
  ];

  // Determine which steps are active or completed based on current status
  const getStepStatus = (stepId: string) => {
    if (currentStatus === 'cancelled') {
      return 'cancelled';
    }
    
    const statusIndex = statuses.findIndex(s => s.id === currentStatus);
    const stepIndex = statuses.findIndex(s => s.id === stepId);
    
    if (stepIndex < statusIndex) {
      return 'completed';
    } else if (stepIndex === statusIndex) {
      return 'active';
    } else {
      return 'inactive';
    }
  };

  return (
    <div className="order-status-tracker">
      {statuses.map((status) => (
        <div key={status.id} className="status-step">
          <div className={`status-dot ${getStepStatus(status.id)}`}>
            {getStepStatus(status.id) === 'completed' && (
              <span className="status-icon-inner">✓</span>
            )}
          </div>
          <div className={`status-label ${getStepStatus(status.id) === 'active' ? 'active' : ''}`}>
            {status.label}
          </div>
        </div>
      ))}
      
      {/* Show cancelled status if applicable */}
      {currentStatus === 'cancelled' && (
        <div className="status-cancelled">
          <div className="status-icon cancelled">
            <X size={14} />
          </div>
          <div className="status-label active">Cancelled</div>
        </div>
      )}
    </div>
  );
};

export default OrderStatusTracker;
