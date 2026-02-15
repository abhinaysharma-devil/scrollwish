
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Heart, Play } from 'lucide-react';
import { Button } from '../components/Button';
import { api } from '../services/api';
import { CardTemplate, Category } from '../types';

const HERO_IMAGES = [
    "https://storage.googleapis.com/global-bucket-for-devils-projects/scrollwish/morgan-lane-18N4okmWccM-unsplash.jpg",
    "https://storage.googleapis.com/global-bucket-for-devils-projects/scrollwish/priscilla-du-preez-xSAiIM6Wa2c-unsplash%20(1).jpg",
    "https://storage.googleapis.com/global-bucket-for-devils-projects/scrollwish/ameer-basheer-XP7QZpvbnKY-unsplash%205555555555.jpg"
];

export const Home: React.FC = () => {
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [trendingTemplates, setTrendingTemplates] = useState<CardTemplate[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
      const interval = setInterval(() => {
          setActiveHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
      }, 3000);

      // Fetch dynamic data
      const fetchData = async () => {
          try {
            const t = await api.getTemplates('all');
            const c = await api.getCategories();
            setTrendingTemplates(t.slice(0, 3));
            setCategories(c);
          } catch(e) { console.error(e) }
      };
      fetchData();

      return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-50 to-white -z-10" />
        {/* Abstract shapes */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-40 -left-20 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-rose-100 text-rose-600 text-sm font-medium mb-8">
                    <Star size={14} fill="currentColor" /> #1 Digital Greeting Platform
                </span>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 font-serif">
                    Create magical <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-purple-600">digital cards</span> <br/>
                    for the people you love.
                </h1>
                <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Forget paper. Send an emotional scrolling experience that tells a story. 
                    Customize with photos, music, and beautiful animations.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/explore">
                        <Button size="lg" className="shadow-rose-300/50">
                            Explore Cards <ArrowRight size={20} />
                        </Button>
                    </Link>
                    <Link to="/explore?cat=birthday">
                        <Button variant="secondary" size="lg">Create Your Own</Button>
                    </Link>
                </div>
            </motion.div>

            {/* Hero Visual - Animated Slider */}
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="mt-20 relative mx-auto max-w-lg w-full"
            >
                <div className="aspect-[3/5] bg-white rounded-3xl shadow-2xl overflow-hidden border-[8px] border-white ring-1 ring-slate-900/5 relative">
                    <AnimatePresence mode='wait'>
                        <motion.img
                            key={activeHeroIndex}
                            src={HERO_IMAGES[activeHeroIndex]}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8 }}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </AnimatePresence>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8 text-white text-left">
                         <motion.div
                            key={`text-${activeHeroIndex}`}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                         >
                            <h3 className="text-3xl font-handwriting mb-2">Made with Love</h3>
                            <p className="opacity-90 text-sm">Create memories that last forever.</p>
                         </motion.div>
                    </div>

                    {/* Floating UI Elements for decoration */}
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur rounded-full p-2">
                        <Heart className="text-white fill-white" size={20} />
                    </div>
                </div>

                {/* Decorative Elements behind */}
                <div className="absolute top-10 -right-20 w-40 h-60 bg-rose-300 rounded-2xl rotate-12 -z-10 opacity-50 blur-sm"></div>
                <div className="absolute top-20 -left-20 w-40 h-60 bg-purple-300 rounded-2xl -rotate-12 -z-10 opacity-50 blur-sm"></div>
            </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-900">Cards for every moment</h2>
                <p className="text-slate-500 mt-2">Choose a category to get started</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {categories.map((cat, idx) => (
                    <Link to={`/explore?cat=${cat.slug}`} key={cat.id || idx}>
                        <motion.div 
                            whileHover={{ y: -5 }}
                            className="bg-slate-50 hover:bg-rose-50 rounded-2xl p-6 text-center cursor-pointer transition-colors group border border-slate-100 hover:border-rose-100"
                        >
                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{cat.icon}</div>
                            <h3 className="font-medium text-slate-700 group-hover:text-rose-600">{cat.name}</h3>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>
      </section>

      {/* Trending Cards Section */}
      <section className="py-20 bg-rose-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Trending Now</h2>
                    <p className="text-slate-500 mt-2">The most loved designs this week</p>
                </div>
                <Link to="/explore" className="text-rose-600 font-medium hover:text-rose-700 flex items-center gap-1">
                    View all <ArrowRight size={16} />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {trendingTemplates.map((template) => (
                     <Link to={`/editor/${template.id}`} key={template.id} className="group">
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
                            <div className="aspect-[4/5] overflow-hidden relative">
                                <img src={template.previewImage} alt={template.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                {template.isPaid && (
                                    <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                        <Star size={12} fill="currentColor" /> PREMIUM
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold text-lg text-slate-900 mb-1">{template.title}</h3>
                                <p className="text-sm text-slate-500 mb-4">{template.category?.name || 'Various'}</p>
                                <span className="text-rose-500 font-medium text-sm group-hover:underline">Customize this card &rarr;</span>
                            </div>
                        </div>
                     </Link>
                ))}
            </div>
          </div>
      </section>
    </div>
  );
};
