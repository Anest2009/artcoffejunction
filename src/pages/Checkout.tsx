import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/Button';
import CheckoutPanel from '../components/CheckoutPanel';
import OrderComplete from '../components/OrderComplete';
import { CartItem } from '../types';

interface CheckoutProps {
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

const Checkout: React.FC<CheckoutProps> = ({ cartItems, setCartItems }) => {
  const navigate = useNavigate();
  const [isComplete, setIsComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [orderId, setOrderId] = useState<string | undefined>();
  
  const handleComplete = (newOrderId?: string) => {
    // Store the actual order ID from Supabase
    setOrderId(newOrderId);
    
    // Generate a random order number for display
    setOrderNumber(Math.floor(1000 + Math.random() * 9000).toString());
    setIsComplete(true);
  };
  
  const handleNewOrder = () => {
    setCartItems([]);
    navigate('/');
  };
  
  if (cartItems.length === 0 && !isComplete) {
    navigate('/menu');
    return null;
  }
  
  return (
    <div className="min-h-screen bg-cream-100 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {!isComplete ? (
          <>
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={() => navigate('/cart')}
                icon={<ArrowLeft size={18} />}
              >
                Back to Cart
              </Button>
            </div>
            
            <CheckoutPanel
              cartItems={cartItems}
              onComplete={handleComplete}
            />
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <OrderComplete
              orderNumber={orderNumber}
              orderId={orderId}
              onNewOrder={handleNewOrder}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Checkout;