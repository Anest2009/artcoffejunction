import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { Product, CustomizationOption } from '../types';

interface CustomizePanelProps {
  product: Product;
  onAddToCart: (customizations: any) => void;
  onCancel: () => void;
}

const CustomizePanel: React.FC<CustomizePanelProps> = ({ 
  product, 
  onAddToCart,
  onCancel
}) => {
  // State for selected customizations and total price adjustment
  const [selectedOptions, setSelectedOptions] = useState<Record<string, CustomizationOption>>({});
  const [totalPriceAdjustment, setTotalPriceAdjustment] = useState(0);
  const [finalPrice, setFinalPrice] = useState(product.price);
  
  // Group customization options by type
  const optionsByType: Record<string, CustomizationOption[]> = {};
  
  // Initialize groups of options
  useEffect(() => {
    if (product.customization_options && product.customization_options.length > 0) {
      // Group options by type
      const grouped: Record<string, CustomizationOption[]> = {};
      
      product.customization_options.forEach(option => {
        if (!grouped[option.option_type]) {
          grouped[option.option_type] = [];
        }
        grouped[option.option_type].push(option);
      });
      
      // Update the grouped options
      Object.assign(optionsByType, grouped);
    }
  }, [product]);
  
  // Update price when selections change
  useEffect(() => {
    let adjustment = 0;
    Object.values(selectedOptions).forEach(option => {
      adjustment += option.price_adjustment;
    });
    
    setTotalPriceAdjustment(adjustment);
    setFinalPrice(product.price + adjustment);
  }, [selectedOptions, product.price]);
  
  // Default options if no customizations are available from Supabase
  const defaultMilkOptions = [
    { value: 'whole', label: 'Whole' },
    { value: 'skim', label: 'Skim' },
    { value: 'oat', label: 'Oat' },
    { value: 'almond', label: 'Almond' },
    { value: 'none', label: 'None' }
  ];
  
  const defaultIceOptions = [
    { value: 'none', label: 'No Ice' },
    { value: 'light', label: 'Light' },
    { value: 'normal', label: 'Normal' },
    { value: 'extra', label: 'Extra' }
  ];
  
  const defaultTemperatureOptions = [
    { value: 'hot', label: 'Hot' },
    { value: 'warm', label: 'Warm' },
    { value: 'iced', label: 'Iced' }
  ];
  
  // Handle option selection
  const handleOptionSelect = (option: CustomizationOption) => {
    setSelectedOptions(prev => {
      const newSelections = {...prev};
      
      // If this option type allows only one selection (like milk type)
      if (option.option_type !== 'flavor') {
        // Remove any previous selection of this type
        Object.keys(prev).forEach(key => {
          if (prev[key].option_type === option.option_type) {
            delete newSelections[key];
          }
        });
      }
      
      // Toggle this option
      if (newSelections[option.id]) {
        delete newSelections[option.id];
      } else {
        newSelections[option.id] = option;
      }
      
      return newSelections;
    });
  };
  
  // Check if an option is selected
  const isOptionSelected = (option: CustomizationOption): boolean => {
    return !!selectedOptions[option.id];
  };
  
  const handleSubmit = () => {
    // Format selected options for cart
    const customizationData = {
      options: Object.values(selectedOptions),
      price_adjustment: totalPriceAdjustment
    };
    
    onAddToCart(customizationData);
  };
  
  return (
    <motion.div
      className="glass-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <div className="flex items-center mb-6">
        <div>
          <h2 className="text-2xl font-medium text-gray-800">Customize your {product.name}</h2>
          <p className="text-gray-600">Make it exactly how you like it</p>
        </div>
      </div>
      
      {/* Dynamic Customization Options */}
      {Object.entries(optionsByType).length > 0 ? (
        // Render customization options from Supabase
        Object.entries(optionsByType).map(([type, options]) => (
          <div key={type} className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </h3>
            <div className="flex flex-wrap gap-2">
              {options.map(option => (
                <Button
                  key={option.id}
                  variant={isOptionSelected(option) ? 'primary' : 'secondary'}
                  onClick={() => handleOptionSelect(option)}
                  size="sm"
                >
                  {option.name}
                  {option.price_adjustment > 0 && ` (+$${option.price_adjustment.toFixed(2)})`}
                </Button>
              ))}
            </div>
          </div>
        ))
      ) : (
        // Fallback to default options if no customizations from Supabase
        <>
          {/* Default Temperature Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Temperature</h3>
            <div className="flex gap-3">
              {defaultTemperatureOptions.map(option => (
                <Button
                  key={option.value}
                  variant={isOptionSelected({id: option.value, name: option.label, price_adjustment: 0, option_type: 'temperature'}) ? 'primary' : 'secondary'}
                  onClick={() => handleOptionSelect({id: option.value, name: option.label, price_adjustment: 0, option_type: 'temperature'})}
                  size="sm"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Default Milk Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Milk</h3>
            <div className="grid grid-cols-3 gap-2">
              {defaultMilkOptions.map(option => (
                <Button
                  key={option.value}
                  variant={isOptionSelected({id: option.value, name: option.label, price_adjustment: 0, option_type: 'milk'}) ? 'primary' : 'secondary'}
                  onClick={() => handleOptionSelect({id: option.value, name: option.label, price_adjustment: 0, option_type: 'milk'})}
                  size="sm"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Default Ice Options */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Ice Level</h3>
            <div className="flex flex-wrap gap-2">
              {defaultIceOptions.map(option => (
                <Button
                  key={option.value}
                  variant={isOptionSelected({id: option.value, name: option.label, price_adjustment: 0, option_type: 'ice'}) ? 'primary' : 'secondary'}
                  onClick={() => handleOptionSelect({id: option.value, name: option.label, price_adjustment: 0, option_type: 'ice'})}
                  size="sm"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </>
      )}
      
      {/* Buttons */}
      <div className="flex gap-4">
        <Button variant="secondary" onClick={onCancel} fullWidth>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} fullWidth>
          Add to Cart - ${finalPrice.toFixed(2)}
          {totalPriceAdjustment > 0 && ` (${totalPriceAdjustment > 0 ? '+' : ''}$${totalPriceAdjustment.toFixed(2)})`}
        </Button>
      </div>
    </motion.div>
  );
};

export default CustomizePanel;