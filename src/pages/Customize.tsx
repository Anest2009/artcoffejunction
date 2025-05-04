import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import CustomizePanel from '../components/CustomizePanel';
import { ArrowLeft } from 'lucide-react';
import { Product, CartItem } from '../types';

interface CustomizeProps {
  selectedProduct?: Product;
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  onBack: () => void;
}

const Customize: React.FC<CustomizeProps> = ({ 
  selectedProduct,
  setCartItems,
  onBack
}) => {
  const navigate = useNavigate();
  
  const handleAddToCart = (customizations: any) => {
    if (selectedProduct) {
      setCartItems(prev => [
        ...prev,
        { 
          product: selectedProduct, 
          quantity: 1,
          customizations
        }
      ]);
      navigate('/cart');
    }
  };
  
  if (!selectedProduct) {
    return <div>No product selected</div>;
  }
  
  return (
    <div className="min-h-screen bg-cream-100 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            icon={<ArrowLeft size={18} />}
          >
            Back to Menu
          </Button>
        </div>
        
        <CustomizePanel
          product={selectedProduct}
          onAddToCart={handleAddToCart}
          onCancel={onBack}
        />
      </div>
    </div>
  );
};

export default Customize;