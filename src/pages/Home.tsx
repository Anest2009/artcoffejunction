import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '../components/Button';
import logo from '../assets/logo.jpeg';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen overflow-hidden"
    >
      {/* Background Image with Parallax Effect */}
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('/src/assets/lokali.jpeg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.8)',
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 z-10" />

      {/* Main Content */}
      <div className="relative z-20 min-h-screen flex items-center justify-center px-4 sm:px-6">
        <motion.div
          className="max-w-4xl w-full mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Logo */}
          <motion.div
            className="mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.4,
              ease: [0.4, 0, 0.2, 1]
            }}
            whileHover={{ scale: 1.05 }}
          >
            <img
              src={logo}
              alt="Art Coffee Logo"
              className="w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 object-contain drop-shadow-2xl mx-auto"
            />
          </motion.div>

          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {/* Title */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-none tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                Art Coffe
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-gray-200 max-w-xl mx-auto font-light leading-relaxed">
              Organic coffee & treats sourced from nature's finest ingredients
            </p>

            {/* Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-8 flex justify-center items-center"
            >
              <Button
                size="lg"
                onClick={() => navigate('/menu')}
                className="
                  group
                  relative
                  px-12 py-6
                  text-xl
                  bg-white/10 hover:bg-white/20
                  text-white font-medium
                  rounded-full
                  shadow-[0_0_15px_rgba(255,255,255,0.1)]
                  hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]
                  transition-all duration-300
                  backdrop-blur-md
                  border border-white/20
                  flex items-center gap-3
                "
              >
                Start Order
                <motion.span
                  className="inline-block"
                  initial={{ x: 0 }}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <ArrowRight className="w-6 h-6" />
                </motion.span>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};


export default Home;