import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TabItem } from '../types';

interface NavTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const NavTabs: React.FC<NavTabsProps> = ({ tabs, activeTab, onTabChange }) => {
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Update indicator position when activeTab changes
  useEffect(() => {
    const updateIndicator = () => {
      const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
      if (activeIndex !== -1 && tabRefs.current[activeIndex]) {
        const tabElement = tabRefs.current[activeIndex]!;
        setIndicatorStyle({
          width: tabElement.offsetWidth,
          left: tabElement.offsetLeft
        });
      }
    };
    
    updateIndicator();
    // Add resize listener to handle layout changes
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeTab, tabs]);
  
  return (
    <div className="relative card-neumorphic rounded-full flex justify-center overflow-hidden mb-8">
      <div className="flex">
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            ref={el => (tabRefs.current[index] = el)}
            className={`tab-item ${activeTab === tab.id ? 'tab-active' : 'tab-inactive'}`}
            onClick={() => onTabChange(tab.id)}
          >
            <div className="flex items-center justify-center">
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
              {tab.label}
            </div>
          </div>
        ))}
      </div>
      
      {/* Animated underline indicator */}
      <motion.div
        className="absolute bottom-0 h-1 bg-primary-300 rounded-t-full"
        initial={false}
        animate={{
          width: indicatorStyle.width,
          left: indicatorStyle.left,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    </div>
  );
};

export default NavTabs;