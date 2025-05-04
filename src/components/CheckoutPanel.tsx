import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { CartItem as CartItemType } from '../types';
import { CreditCard, Banknote, Smartphone, CoffeeIcon, Loader } from 'lucide-react';
import { placeOrder } from '../lib/supabase';

interface CheckoutPanelProps {
  cartItems: CartItemType[];
  onComplete: (orderId?: string) => void;
  tableNumber?: number;
}

const CheckoutPanel: React.FC<CheckoutPanelProps> = ({ 
  cartItems, 
  onComplete,
  tableNumber = 12
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity, 
    0
  );
  
  const tax = subtotal * 0.0875;
  const total = subtotal + tax;
  
  const paymentMethods = [
    { id: 'card', label: 'Credit Card', icon: <CreditCard size={20} /> },
    { id: 'cash', label: 'Cash', icon: <Banknote size={20} /> },
    { id: 'mobile', label: 'Mobile Payment', icon: <Smartphone size={20} /> }
  ];
  
  const handlePayment = async (methodId: string) => {
    try {
      setIsProcessing(true);
      setSelectedMethod(methodId);
      
      console.log('Placing order with items:', cartItems);
      
      // Place the order directly in Supabase
      console.log('Placing order in Supabase...');
      let orderId: string | undefined;
      
      try {
        const order = await placeOrder(
          `table-${tableNumber}`, // table ID
          cartItems.map(item => ({
            product: item.product,
            quantity: item.quantity,
            customizations: item.customizations || [],
            notes: item.notes
          })),
          total,
          methodId
        );
        
        // Store the order ID for later use
        orderId = order.id;
        
        console.log('Order successfully placed in Supabase:', order);
        
        // Show a success message to the user
        setTimeout(() => {
          alert(`Order #${order.id} placed successfully!`);
        }, 500);
      } catch (error) {
        console.error('Error placing order in Supabase:', error);
        alert('There was an error placing your order. Please try again.');
        setIsProcessing(false);
        return;
      }
      
      // Complete the checkout process and pass the order ID
      setTimeout(() => {
        setIsProcessing(false);
        onComplete(orderId); // Pass the order ID to the parent component
      }, 1500);
    } catch (error) {
      console.error('Error placing order:', error);
      setIsProcessing(false);
      alert('There was an error placing your order. Please try again.');
    }
  };
  
  return (
    <motion.div
      className="glass-panel mx-auto max-w-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <div className="flex items-center justify-center mb-6">
        <CoffeeIcon size={28} className="text-primary-500 mr-2" />
        <h2 className="text-2xl font-medium text-center text-gray-800">Complete Your Order</h2>
      </div>
      
      <div className="bg-cream-100 rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center text-gray-600 mb-2">
          <span>Table Number</span>
          <span className="font-medium text-primary-600">#{tableNumber}</span>
        </div>
        <div className="flex justify-between items-center text-gray-600 mb-2">
          <span>Items</span>
          <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
        </div>
        <div className="flex justify-between items-center text-gray-600 mb-2">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-gray-600 mb-4">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-lg font-medium">
          <span>Total</span>
          <span className="text-primary-600">${total.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Choose Payment Method</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {paymentMethods.map(method => (
            <Button
              key={method.id}
              variant="secondary"
              icon={isProcessing && selectedMethod === method.id ? <Loader className="animate-spin" size={20} /> : method.icon}
              onClick={() => handlePayment(method.id)}
              className="justify-center"
              fullWidth
              disabled={isProcessing}
            >
              {isProcessing && selectedMethod === method.id ? 'Processing...' : method.label}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-500 mb-4">
        By completing this order, you agree to our Terms of Service and Privacy Policy.
      </div>
    </motion.div>
  );
};

export default CheckoutPanel;