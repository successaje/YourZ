'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, Variants, useAnimation } from 'framer-motion';

const slides = [
  {
    title: "Write. Mint. Earn.",
    description: "Turn your posts into ownable NFTs",
    cta: "Start Writing",
    secondaryCta: "Explore Posts"
  },
  {
    title: "Own Your Influence",
    description: "Monetize your content with 10% royalties",
    cta: "Learn More",
    secondaryCta: "See Examples"
  },
  {
    title: "Build on Zora",
    description: "Join the future of creator economy",
    cta: "Get Started",
    secondaryCta: "Read Docs"
  }
];

const NFTCard = ({ delay = 0, position, rotation = 0 }: { delay?: number; position: { x: number; y: number }; rotation?: number }) => {
  const colors = [
    'from-blue-600/90 to-purple-600/90',
    'from-green-600/90 to-cyan-500/90',
    'from-rose-600/90 to-pink-500/90',
    'from-amber-600/90 to-orange-500/90',
    'from-violet-600/90 to-fuchsia-500/90',
    'from-emerald-600/90 to-teal-500/90'
  ];
  
  const color = colors[Math.floor(Math.random() * colors.length)];
  const rotationVariance = Math.random() * 10 - 5;
  
  return (
    <motion.div 
      className={`absolute w-20 h-28 rounded-lg p-2 shadow-2xl border border-white/10 backdrop-blur-sm ${color}`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        rotate: rotation + rotationVariance,
        boxShadow: '0 0 20px rgba(110, 68, 255, 0.3)'
      }}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        y: [0, -5, 0],
        scale: 1,
        rotate: [rotation, rotation + 2, rotation - 2, rotation]
      }}
      transition={{ 
        duration: 6 + Math.random() * 2, 
        delay: delay + Math.random() * 0.5,
        repeat: Infinity, 
        repeatType: 'reverse',
        ease: "easeInOut" 
      }}
      whileHover={{
        scale: 1.1,
        zIndex: 10,
        boxShadow: '0 0 30px rgba(110, 68, 255, 0.6)',
        transition: { duration: 0.2 }
      }}
    >
      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-amber-500 text-[10px] font-bold text-black px-1.5 py-0.5 rounded-full z-10">
        {Math.floor(Math.random() * 20 + 5)}%
      </div>
      <div className="h-2/3 bg-white/10 rounded mb-1.5"></div>
      <div className="h-1.5 bg-white/20 rounded-full mb-1"></div>
      <div className="h-1.5 bg-white/10 rounded-full w-3/4"></div>
    </motion.div>
  );
};

const NFTCluster = () => {
  const positions = [
    { x: 75, y: 10, rotation: -5 },
    { x: 85, y: 25, rotation: 5 },
    { x: 80, y: 45, rotation: -3 },
    { x: 70, y: 30, rotation: 2 },
    { x: 90, y: 15, rotation: -7 },
    { x: 65, y: 20, rotation: 3 }
  ];

  return (
    <div className="absolute inset-0 overflow-hidden">
      {positions.map((pos, i) => (
        <NFTCard 
          key={i} 
          position={{ x: pos.x, y: pos.y }}
          rotation={pos.rotation}
          delay={i * 0.1}
        />
      ))}
    </div>
  );
};

const AnimatedGradient = () => {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setPosition({ x, y });
    };
    
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div 
      className="absolute inset-0 overflow-hidden opacity-100"
      style={{
        background: `radial-gradient(
          circle at ${position.x}% ${position.y}%,
          rgba(110, 68, 255, 0.15) 0%,
          rgba(0, 0, 0, 0) 50%
        ),
        linear-gradient(135deg, #0A0B12 0%, #171A26 50%, #1E1B4B 100%)`
      }}
    >
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)',
        backgroundSize: '20px 20px'
      }} />
    </div>
  );
};

const SlideContent = ({ 
  title, 
  description, 
  cta,
  secondaryCta 
}: { 
  title: string; 
  description: string; 
  cta: string;
  secondaryCta: string;
}) => {
  const controls = useAnimation();
  const textControls = useAnimation();
  
  useEffect(() => {
    const sequence = async () => {
      await textControls.start({ 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.6 }
      });
      
      controls.start({
        color: ['#FFFFFF', '#6E44FF', '#FFFFFF'],
        transition: { 
          duration: 3,
          repeat: Infinity,
          repeatType: 'reverse'
        }
      });
    };
    
    sequence();
  }, [controls, textControls]);

  return (
    <div className="relative z-10 w-full h-full p-8 flex flex-col justify-between">
      <div className="relative h-full">
        <NFTCluster />
        <div className="relative z-10 max-w-md bg-gradient-to-r from-black/80 to-transparent p-6 rounded-xl backdrop-blur-sm">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={textControls}
          >
            {title}
          </motion.h2>
          <motion.p 
            className="text-gray-200 text-sm mb-3 font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={controls}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {description} <span className="inline-block">→</span>
          </motion.p>
          <div className="flex flex-wrap gap-4">
            <motion.button 
              className="bg-gradient-to-r from-[#6E44FF] to-[#8E54E9] text-white px-6 py-3 rounded-lg font-medium text-sm hover:shadow-[0_0_12px_rgba(110,68,255,0.5)] transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              {cta}
            </motion.button>
            <motion.button 
              className="bg-transparent border border-white/20 text-white px-6 py-3 rounded-lg font-medium text-sm hover:bg-white/5 transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              {secondaryCta}
            </motion.button>
            <motion.a
              href="/marketplace"
              className="inline-flex items-center bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-lg font-medium text-sm hover:shadow-[0_0_12px_rgba(16,185,129,0.4)] transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <span>Explore Our Marketplace</span>
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.a>
          </div>
        </div>
      </div>
    </div>
  );
};

export function BannerSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);

    return () => clearInterval(timer);
  }, []);

  const variants: Variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 }
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    })
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const direction = 1; // Always slide in the same direction for now

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/10 h-[320px]">
      <AnimatedGradient />
      
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentSlide}
          variants={{
            enter: { opacity: 0, x: 50 },
            center: { 
              opacity: 1, 
              x: 0,
              transition: { duration: 0.5 }
            },
            exit: { 
              opacity: 0, 
              x: -50,
              transition: { duration: 0.3 }
            }
          }}
          initial="enter"
          animate="center"
          exit="exit"
          className="relative h-full min-h-[300px]"
        >
          <div className="h-full">
            <SlideContent 
              title={slides[currentSlide].title}
              description={slides[currentSlide].description}
              cta={slides[currentSlide].cta}
              secondaryCta={slides[currentSlide].secondaryCta}
            />
          </div>
          
          {/* Navigation Dots */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2 z-20 px-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1.5 rounded-full transition-all ${
                  currentSlide === index 
                    ? 'w-8 bg-gradient-to-r from-[#6E44FF] to-[#8E54E9]' 
                    : 'w-3 bg-white/20 hover:bg-white/30'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          
          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-[#6E44FF] to-[#8E54E9]"
              key={currentSlide}
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 7, ease: 'linear' }}
              onAnimationComplete={() => {
                setCurrentSlide((prev) => (prev + 1) % slides.length);
              }}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 