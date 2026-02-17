
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Heart, Play, Music, Shield, Smartphone, Zap, CheckCircle2, Quote } from 'lucide-react';
import { Button } from '../components/Button';
import { api } from '../services/api';
import { CardTemplate, Category } from '../types';
import { SEO } from '../components/SEO';

const HERO_IMAGES = [
    "https://storage.googleapis.com/global-bucket-for-devils-projects/scrollwish/morgan-lane-18N4okmWccM-unsplash.jpg",
    "https://storage.googleapis.com/global-bucket-for-devils-projects/scrollwish/priscilla-du-preez-xSAiIM6Wa2c-unsplash%20(1).jpg",
    "https://storage.googleapis.com/global-bucket-for-devils-projects/scrollwish/ameer-basheer-XP7QZpvbnKY-unsplash%205555555555.jpg"
];

const FEATURES = [
    { icon: <Music size={24} />, title: "Custom Music", desc: "Add your favorite songs to set the perfect mood." },
    { icon: <Smartphone size={24} />, title: "Mobile Perfect", desc: "Designed to look stunning on every phone screen." },
    { icon: <Shield size={24} />, title: "Private & Secure", desc: "Password protection and fingerprint locks available." },
    { icon: <Zap size={24} />, title: "Instant Sharing", desc: "Share via WhatsApp or Instagram in seconds." },
];

const REVIEWS = [
    { name: "Rahul S.", text: "The Valentine card was a hit! She said yes immediately. The fingerprint lock feature is genius." },
    { name: "Priya M.", text: "Used the wedding invite for my sister. Everyone loved the animated timeline. So much better than a PDF." },
    { name: "Amit K.", text: "Simple to use and looks very professional. The gold theme is beautiful." }
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
            } catch (e) { console.error(e) }
        };
        fetchData();

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col min-h-screen font-sans">
            <SEO
                title="ScrollWish - Make Someone's Day Special"
                description="Create emotional, animated digital greeting cards for birthdays, weddings, and valentine's day. It's more than a card, it's a story."
            />
            {/* 1. HERO SECTION */}
            <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-rose-50 via-white to-white -z-10" />
                {/* Abstract shapes */}
                <div className="absolute top-20 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
                <div className="absolute top-40 -left-20 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-32 left-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-rose-100 text-rose-600 text-sm font-medium mb-8">
                            <Star size={14} fill="currentColor" /> #1 Digital Greeting Platform
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 font-serif leading-tight">
                            Create magical <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-purple-600">digital stories</span> <br />
                            for the people you love.
                        </h1>
                        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Forget static images. Send an emotional scrolling experience that tells a story.
                            Customize with photos, music, and beautiful animations.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/explore">
                                <Button size="lg" className="shadow-rose-300/50 text-lg px-8 py-4">
                                    Explore Cards <ArrowRight size={20} />
                                </Button>
                            </Link>
                            <Link to="/explore?cat=birthday">
                                <Button variant="secondary" size="lg" className="text-lg px-8 py-4 bg-white hover:bg-gray-50">Create Your Own</Button>
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

            {/* 2. FEATURES GRID */}
            <section className="py-16 bg-white border-y border-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {FEATURES.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-slate-50 transition-colors"
                            >
                                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. PROMO STRIP - VALENTINE */}
            <section className="py-20 bg-gradient-to-r from-rose-500 to-pink-600 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/hearts.png')]"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 text-center md:text-left">
                            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block backdrop-blur-sm">
                                Trending
                            </span>
                            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
                                Plan the Perfect Proposal
                            </h2>
                            <p className="text-rose-100 text-lg mb-8 max-w-xl leading-relaxed">
                                Make it unforgettable with our interactive Valentine's card. Features a fingerprint lock scanner, romantic music, and a "Yes/No" interaction that captures the moment.
                            </p>
                            <Link to="/editor/t7">
                                <Button className="text-white bg-rose hover:bg-rose-500 border-none px-8 py-4 text-lg shadow-xl shadow-rose-900/20">
                                    Create Proposal Card <Heart size={20} className="fill-current" />
                                </Button>
                            </Link>
                        </div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex-1 relative w-full max-w-md"
                        >
                            <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 rotate-3">
                                <img
                                    src="https://storage.googleapis.com/global-bucket-for-devils-projects/scrollwish/priscilla-du-preez-xSAiIM6Wa2c-unsplash%20(1).jpg"
                                    alt="Valentine Proposal"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                                    <div className="bg-white/90 backdrop-blur p-4 rounded-xl w-full">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center text-white">
                                                <Heart size={20} fill="currentColor" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Interactive</p>
                                                <p className="font-bold text-gray-800 text-sm">"Will you be mine?"</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 4. CATEGORIES */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900">Explore by Category</h2>
                        <p className="text-slate-500 mt-2">Find the perfect card for any occasion</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {categories.map((cat, idx) => (
                            <Link to={`/explore?cat=${cat.slug}`} key={cat.id || idx}>
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="bg-slate-50 hover:bg-rose-50 rounded-2xl p-6 text-center cursor-pointer transition-colors group border border-slate-100 hover:border-rose-100 h-full flex flex-col items-center justify-center"
                                >
                                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{cat.icon}</div>
                                    <h3 className="font-medium text-slate-700 group-hover:text-rose-600">{cat.name}</h3>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. PROMO STRIP - WEDDING */}
            <section className="py-20 bg-[#FDFBF7] border-y border-[#d4af37]/20 relative overflow-hidden">
                {/* Decorative Mandala */}
                <div className="absolute -left-20 -top-20 w-96 h-96 opacity-5 pointer-events-none">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Mandala_8.svg/1200px-Mandala_8.svg.png" className="w-full h-full animate-[spin_60s_linear_infinite]" alt="" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row-reverse items-center gap-12">
                        <div className="flex-1 text-center md:text-left">
                            <span className="text-[#d4af37] tracking-[0.2em] uppercase text-sm font-bold mb-2 block">
                                Wedding Season Special
                            </span>
                            <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">
                                Royal Digital E-Invites
                            </h2>
                            <p className="text-slate-600 text-lg mb-8 max-w-xl leading-relaxed">
                                Impress your guests with a scroll-based wedding invitation. Includes venue maps, photo galleries, countdown timers, and RSVP management.
                            </p>
                            <Link to="/explore?cat=wedding">
                                <Button className="bg-[#d4af37] hover:bg-[#c5a028] text-white border-none px-8 py-4 text-lg shadow-xl shadow-yellow-900/10">
                                    Browse Wedding Designs
                                </Button>
                            </Link>
                        </div>

                        <div className="flex-1 grid grid-cols-2 gap-4 w-full max-w-md">
                            <motion.div whileHover={{ y: -10 }} className="aspect-[3/4] rounded-xl overflow-hidden shadow-lg mt-8">
                                <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500&q=80" className="w-full h-full object-cover" alt="Wedding 1" />
                            </motion.div>
                            <motion.div whileHover={{ y: -10 }} className="aspect-[3/4] rounded-xl overflow-hidden shadow-lg">
                                <img src="https://images.unsplash.com/photo-1606800052052-a08af7148866?w=500&q=80" className="w-full h-full object-cover" alt="Wedding 2" />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. HOW IT WORKS */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
                        <p className="text-slate-500 mt-2">Three simple steps to create magic</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connector Line */}
                        <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-rose-100 -z-10"></div>

                        {[
                            { step: "01", title: "Choose a Template", desc: "Browse our collection of animated templates for any occasion." },
                            { step: "02", title: "Customize It", desc: "Add your photos, heartfelt messages, and pick a music track." },
                            { step: "03", title: "Share Link", desc: "Get a unique link to send via WhatsApp, Instagram or Email." }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-6 text-center">
                                <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg text-rose-500 font-bold text-2xl font-serif">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                                <p className="text-slate-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7. TRENDING CARDS */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900">Trending Designs</h2>
                            <p className="text-slate-500 mt-2">The most loved cards this week</p>
                        </div>
                        <Link to="/explore" className="text-rose-600 font-medium hover:text-rose-700 flex items-center gap-1">
                            View all <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {trendingTemplates.map((template) => (
                            <Link to={`/editor/${template.slug}`} key={template.id} className="group">
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
                                        <span className="text-rose-500 font-medium text-sm group-hover:underline flex items-center gap-1">
                                            Customize this card <ArrowRight size={14} />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* 8. TESTIMONIALS */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center text-slate-900 mb-16">What People Say</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {REVIEWS.map((review, idx) => (
                            <div key={idx} className="bg-slate-50 p-8 rounded-2xl relative">
                                <Quote className="absolute top-4 right-4 text-rose-200" size={40} />
                                <p className="text-slate-600 mb-6 italic relative z-10">"{review.text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-rose-200 rounded-full flex items-center justify-center font-bold text-rose-700">
                                        {review.name[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{review.name}</p>
                                        <div className="flex text-yellow-400 text-xs">
                                            {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 9. CTA */}
            <section className="py-20 bg-slate-900 text-white text-center">
                <div className="max-w-3xl mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to create something special?</h2>
                    <p className="text-slate-400 mb-8 text-lg">Start with a free template or choose a premium design. No credit card required to start designing.</p>
                    <Link to="/explore">
                        <Button size="lg" className="bg-rose-600 hover:bg-rose-700 border-none px-10 py-4 text-lg">
                            Start Creating Now
                        </Button>
                    </Link>
                </div>
            </section>

        </div>
    );
};
