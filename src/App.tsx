import React, { useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Pages
import Home from './pages/Home';
import Menu from './pages/Menu';
import Customize from './pages/Customize';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

// Types
import { CartItem } from './types';

function App() {
  const location = useLocation();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  return (
    <div className="App">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route 
            path="/menu" 
            element={
              <Menu 
                cartItems={cartItems} 
                setCartItems={setCartItems} 
              />
            } 
          />
          <Route 
            path="/customize" 
            element={
              <Customize 
                selectedProduct={selectedProduct} 
                setCartItems={setCartItems} 
                onBack={() => window.history.back()} 
              />
            } 
          />
          <Route 
            path="/cart" 
            element={
              <Cart 
                cartItems={cartItems} 
                setCartItems={setCartItems} 
              />
            } 
          />
          <Route 
            path="/checkout" 
            element={
              <Checkout 
                cartItems={cartItems} 
                setCartItems={setCartItems} 
              />
            } 
          />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;