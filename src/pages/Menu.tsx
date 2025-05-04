import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CoffeeIcon, CakeIcon, Package2Icon, ShoppingCart } from 'lucide-react';
import NavTabs from '../components/NavTabs';
import ProductCard from '../components/ProductCard';
import Button from '../components/Button';
import { getCategories, getProductsByCategory } from '../lib/supabase';
import { Product, TabItem, CartItem } from '../types';
import CustomizePanel from '../components/CustomizePanel';

interface MenuProps {
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

const Menu: React.FC<MenuProps> = ({ cartItems, setCartItems }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        
        if (categoriesData.length > 0) {
          setActiveTab(categoriesData[0].id);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again.');
      }
    };
    
    fetchCategories();
  }, []);
  
  // Fetch products when active tab changes
  useEffect(() => {
    const fetchProducts = async () => {
      if (!activeTab) return;
      
      setLoading(true);
      try {
        const productsData = await getProductsByCategory(activeTab);
        
        // Find the current category name
        const currentCategory = categories.find(cat => cat.id === activeTab);
        const categoryName = currentCategory ? currentCategory.name.toLowerCase() : '';
        
        console.log('Current category:', categoryName);
        
        // Transform Supabase data to match our Product interface
        const formattedProducts: Product[] = productsData.map(item => {
          // Determine if this is a bar product based on the current category
          const isBarProduct = categoryName === 'bar';
          
          return {
            id: item.id,
            name: item.name,
            description: item.description || '',
            price: parseFloat(item.price),
            image: item.image_url || 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg', // Default image
            category: isBarProduct ? 'bar' : categoryName, // Use 'bar' explicitly for bar products
            category_id: item.category_id,
            customization_options: item.customization_options
          };
        });
        
        setProducts(formattedProducts);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [activeTab]);
  
  // Create tabs from categories
  const tabs: TabItem[] = categories.map(category => {
    // Map category names to icons
    let icon;
    switch(category.name.toLowerCase()) {
      case 'bar':
        icon = <CoffeeIcon size={18} />;
        break;
      case 'pastry':
        icon = <CakeIcon size={18} />;
        break;
      case 'ground coffee':
        icon = <Package2Icon size={18} />;
        break;
      default:
        icon = <CoffeeIcon size={18} />;
    }
    
    return {
      id: category.id,
      label: category.name,
      icon
    };
  });
  
  // No need to filter products as we're fetching by category
  
  const handleAddToCart = (product: Product) => {
    // Check if this is a bar product
    const isBarProduct = product.category === 'bar' || product.category_id === 'bar';
    
    if (isBarProduct) {
      // If it's a bar product, show the customization panel
      setSelectedProduct(product);
      setIsCustomizing(true);
    } else {
      // Otherwise, add directly to cart
      setCartItems(prev => [
        ...prev,
        { product, quantity: 1 }
      ]);
    }
  };
  
  const handleCustomize = (product: Product) => {
    // Always allow customization for bar items
    if (product.category_id === 'bar' || product.category === 'bar') {
      setSelectedProduct(product);
      setIsCustomizing(true);
    } else {
      // For non-bar items, add directly to cart without customization
      setCartItems(prev => [
        ...prev,
        { product, quantity: 1 }
      ]);
    }
  };
  
  const handleAddCustomized = (customizations: any) => {
    if (selectedProduct) {
      setCartItems(prev => [
        ...prev,
        { 
          product: selectedProduct, 
          quantity: 1,
          customizations
        }
      ]);
      setIsCustomizing(false);
      setSelectedProduct(null);
    }
  };
  
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  return (
    <div className="min-h-screen bg-cream-100 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-medium text-gray-800">Menu</h1>
          
          <Button
            variant={totalItems > 0 ? 'primary' : 'secondary'}
            onClick={() => navigate('/cart')}
            icon={<ShoppingCart size={20} />}
            disabled={totalItems === 0}
          >
            Cart {totalItems > 0 && <span className="ml-1">({totalItems})</span>}
          </Button>
        </div>
        
        <NavTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {loading ? (
              <div className="col-span-full flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-600"></div>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-12 text-red-600">
                {error}
                <button 
                  onClick={() => window.location.reload()} 
                  className="block mx-auto mt-4 px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700"
                >
                  Retry
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-600">
                No products available in this category.
              </div>
            ) : (
              products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => handleAddToCart(product)}
                  onCustomize={() => handleCustomize(product)}
                />
              ))
            )}
          </motion.div>
        </AnimatePresence>
        
        <AnimatePresence>
          {isCustomizing && selectedProduct && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4"
              onClick={() => setIsCustomizing(false)}
            >
              <div onClick={e => e.stopPropagation()}>
                <CustomizePanel
                  product={selectedProduct}
                  onAddToCart={handleAddCustomized}
                  onCancel={() => setIsCustomizing(false)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Menu;