import React from 'react';
import { motion } from 'framer-motion';
import { Product } from '../types';
import Button from './Button';
import { Plus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
  onCustomize?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart,
  onCustomize
}) => {
  // Show customization for all bar counter products
  const hasCustomization = product.category === 'bar' || product.category_id === 'bar';
  
  // Debug information
  console.log('Product:', product.name);
  console.log('Category:', product.category);
  console.log('Category ID:', product.category_id);
  console.log('Has Customization:', hasCustomization);
  
  return (
    <motion.div
      className="card-neumorphic overflow-hidden h-full flex flex-col"
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <div className="relative h-48 overflow-hidden rounded-xl">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-medium text-gray-800">{product.name}</h3>
          <span className="text-lg font-medium text-primary-600">${product.price.toFixed(2)}</span>
        </div>
        
        <p className="text-gray-600 mb-4 flex-grow">{product.description}</p>
        
        <div className="mt-auto flex gap-2">
          {hasCustomization ? (
            <>
              <Button 
                variant="secondary" 
                fullWidth 
                onClick={onCustomize}
              >
                Customize
              </Button>
              <Button
                variant="primary"
                onClick={onAddToCart}
                icon={<Plus size={18} />}
                className="px-3 min-w-[44px]"
              >
                <span className="sr-only">Add</span>
              </Button>
            </>
          ) : (
            <Button 
              variant="primary" 
              fullWidth 
              onClick={onAddToCart}
              icon={<Plus size={18} />}
            >
              Add to Cart
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;