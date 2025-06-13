'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
  {
    title: "Write Your Story",
    description: "Create compelling content that resonates with your audience",
    icon: "✍️",
    bgPattern: "write"
  },
  {
    title: "Mint as NFT",
    description: "Transform your content into unique digital assets",
    icon: "🖼️",
    bgPattern: "mint"
  },
  {
    title: "Earn Rewards",
    description: "Get paid for your creativity and influence",
    icon: "💰",
    bgPattern: "earn"
  },
  {
    title: "Own Your Influence",
    description: "Take control of your content and its value",
    icon: "👑",
    bgPattern: "own"
  }
];

const backgroundPatterns = {
  write: (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-gradient-x" />
      <div className="absolute inset-0 opacity-30">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary rounded-full"
            initial={{ x: -100, y: Math.random() * 400 }}
            animate={{ x: 500, y: Math.random() * 400 }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    </div>
  ),
  mint: (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-blue-500/10 to-purple-500/10 animate-gradient-y" />
      <div className="absolute inset-0 opacity-30">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 border-2 border-primary rounded-full"
            initial={{ scale: 0, x: Math.random() * 400, y: Math.random() * 100 }}
            animate={{ scale: 1, x: Math.random() * 400, y: Math.random() * 100 + 200 }}
            transition={{
              duration: 2 + Math.random(),
              repeat: Infinity,
              delay: i * 0.3
            }}
          />
        ))}
      </div>
    </div>
  ),
  earn: (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-bl from-yellow-500/10 via-orange-500/10 to-red-500/10 animate-gradient-xy" />
      <div className="absolute inset-0 opacity-30">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 bg-primary/50 rounded-lg"
            initial={{ rotate: 0, x: Math.random() * 400, y: -50 }}
            animate={{ rotate: 360, x: Math.random() * 400, y: 450 }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.4
            }}
          />
        ))}
      </div>
    </div>
  ),
  own: (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-pink-500/10 animate-gradient-diagonal" />
      <div className="absolute inset-0 opacity-30">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-5 h-5 border-2 border-primary"
            initial={{ rotate: 0, x: -50, y: Math.random() * 400 }}
            animate={{ rotate: 360, x: 450, y: Math.random() * 400 }}
            transition={{
              duration: 5 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.5
            }}
          />
        ))}
      </div>
    </div>
  )
};

export function BannerSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-32 overflow-hidden rounded-xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {backgroundPatterns[slides[currentSlide].bgPattern]}
          <div className="relative text-center z-10">
            <div className="text-4xl mb-2">{slides[currentSlide].icon}</div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {slides[currentSlide].title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {slides[currentSlide].description}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 3, ease: "linear" }}
          key={currentSlide}
        />
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentSlide
                ? "bg-primary"
                : "bg-gray-300 dark:bg-gray-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
} 