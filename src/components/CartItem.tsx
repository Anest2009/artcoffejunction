import React from 'react';
import { motion } from 'framer-motion';
import { CartItem as CartItemType } from '../types';
import { Minus, Plus, Edit, Trash2 } from 'lucide-react';

interface CartItemProps {
  item: CartItemType;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
  onEdit?: () => void;
}

const CartItem: React.FC<CartItemProps> = ({ 
  item, 
  onIncrement, 
  onDecrement, 
  onRemove,
  onEdit
}) => {
  const { product, quantity, customizations } = item;
  const hasCustomizations = product.category === 'bar' && customizations;
  
  const getCustomizationSummary = () => {
    if (!customizations) return null;
    
    const parts = [];
    
    if (customizations.milk && customizations.milk !== 'none') {
      parts.push(`${customizations.milk} milk`);
    }
    
    if (customizations.temperature) {
      parts.push(customizations.temperature);
    }
    
    if (customizations.sugar > 0) {
      parts.push(`${customizations.sugar} sugar`);
    }
    
    if (customizations.ice && customizations.ice !== 'none') {
      parts.push(`${customizations.ice} ice`);
    }
    
    if (customizations.flavor && customizations.flavor.length > 0) {
      parts.push(`${customizations.flavor.join(', ')}`);
    }
    
    return parts.join(' • ');
  };
  
  return (
    <motion.div 
      className="card-neumorphic mb-4 overflow-hidden"
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="flex gap-4">
        <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-grow">
          <div className="flex justify-between">
            <h3 className="font-medium text-gray-800">{product.name}</h3>
            <span className="font-medium text-primary-600">
              ${(product.price * quantity).toFixed(2)}
            </span>
          </div>
          
          {hasCustomizations && (
            <p className="text-sm text-gray-600 mt-1">
              {getCustomizationSummary()}
            </p>
          )}
          
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center">
              <button 
                onClick={onDecrement}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-cream-100 text-primary-600 hover:bg-cream-200"
                disabled={quantity <= 1}
              >
                <Minus size={16} />
              </button>
              <span className="mx-3 min-w-[20px] text-center">{quantity}</span>
              <button 
                onClick={onIncrement}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-cream-100 text-primary-600 hover:bg-cream-200"
              >
                <Plus size={16} />
              </button>
            </div>
            
            <div className="flex gap-2">
              {hasCustomizations && (
                <button 
                  onClick={onEdit}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-cream-100 text-primary-600 hover:bg-cream-200"
                >
                  <Edit size={16} />
                </button>
              )}
              <button 
                onClick={onRemove}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-cream-100 text-red-500 hover:bg-red-100"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CartItem;