import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/Button';
import CartItem from '../components/CartItem';
import CustomizePanel from '../components/CustomizePanel';
import { CartItem as CartItemType, Product } from '../types';

interface CartProps {
  cartItems: CartItemType[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItemType[]>>;
}

const Cart: React.FC<CartProps> = ({ cartItems, setCartItems }) => {
  const navigate = useNavigate();
  const [editingItem, setEditingItem] = useState<CartItemType | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  
  const handleIncrement = (index: number) => {
    setCartItems(prev => prev.map((item, i) => 
      i === index 
        ? { ...item, quantity: item.quantity + 1 } 
        : item
    ));
  };
  
  const handleDecrement = (index: number) => {
    setCartItems(prev => prev.map((item, i) => 
      i === index && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 } 
        : item
    ));
  };
  
  const handleRemove = (index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleEdit = (item: CartItemType, index: number) => {
    setEditingItem(item);
    setEditingIndex(index);
  };
  
  const handleAddCustomized = (customizations: any) => {
    if (editingItem && editingIndex >= 0) {
      setCartItems(prev => prev.map((item, i) => 
        i === editingIndex
          ? { ...item, customizations }
          : item
      ));
      setEditingItem(null);
      setEditingIndex(-1);
    }
  };
  
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity, 
    0
  );
  
  const isEmpty = cartItems.length === 0;
  
  return (
    <div className="min-h-screen bg-cream-100 px-4 py-8">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/menu')}
            icon={<ArrowLeft size={18} />}
          >
            Continue Shopping
          </Button>
          
          <h1 className="text-2xl font-medium text-gray-800">Your Order</h1>
        </div>
        
        {isEmpty ? (
          <div className="card-neumorphic text-center py-12">
            <p className="text-gray-600 mb-6">Your cart is empty</p>
            <Button
              variant="primary"
              onClick={() => navigate('/menu')}
            >
              Browse Menu
            </Button>
          </div>
        ) : (
          <>
            <AnimatePresence>
              {cartItems.map((item, index) => (
                <CartItem
                  key={`${item.product.id}-${index}`}
                  item={item}
                  onIncrement={() => handleIncrement(index)}
                  onDecrement={() => handleDecrement(index)}
                  onRemove={() => handleRemove(index)}
                  onEdit={() => handleEdit(item, index)}
                />
              ))}
            </AnimatePresence>
            
            <div className="card-neumorphic mt-6 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Tax (8.75%)</span>
                <span>${(subtotal * 0.0875).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-medium">
                <span>Total</span>
                <span className="text-primary-600">
                  ${(subtotal + (subtotal * 0.0875)).toFixed(2)}
                </span>
              </div>
            </div>
            
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={() => navigate('/checkout')}
              className="mt-4"
            >
              Proceed to Checkout
            </Button>
          </>
        )}
        
        <AnimatePresence>
          {editingItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4"
              onClick={() => {
                setEditingItem(null);
                setEditingIndex(-1);
              }}
            >
              <div onClick={e => e.stopPropagation()}>
                <CustomizePanel
                  product={editingItem.product}
                  onAddToCart={handleAddCustomized}
                  onCancel={() => {
                    setEditingItem(null);
                    setEditingIndex(-1);
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Cart;