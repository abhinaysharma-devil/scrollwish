
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Crown } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { CardTemplate } from '../types';
import { api } from '../services/api';
import { Button } from '../components/Button';
import { i } from 'framer-motion/client';

export const Explore: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const currentCategorySlug = searchParams.get('cat') || 'all';

    const [categories, setCategories] = useState(CATEGORIES);

    useEffect(() => {
        // In real app, fetch categories from API
        setCategories(CATEGORIES);

        // fetch categories from API if needed
        const fetchCategories = async () => {
            try {
                const data = await api.getCategories();
                setCategories(data);
            } catch (e) {
                console.error(e);
            }
        };
        fetchCategories();
    }, []);


    const [cards, setCards] = useState<CardTemplate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCards = async () => {
            setLoading(true);
            try {
                const data = await api.getTemplates(currentCategorySlug);
                const visibleCards = data.filter(item => item.isVisible === true);
                setCards(visibleCards);
            } catch (e) {
                console.error(e);
            }
            setLoading(false);
        };
        fetchCards();
    }, [currentCategorySlug]);

    const handleCategoryChange = (slug: string) => {
        if (slug === 'all') {
            setSearchParams({});
        } else {
            setSearchParams({ cat: slug });
        }
    };



    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header Area */}
            <div className="bg-white border-b border-gray-200 pt-8 pb-4 px-4 sticky top-16 z-30">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Explore Templates</h1>

                    {/* Filter Pills */}
                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                        <button
                            onClick={() => handleCategoryChange('all')}
                            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${currentCategorySlug === 'all'
                                    ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            All Cards
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryChange(cat.slug)}
                                className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${currentCategorySlug === cat.slug
                                        ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {cat.icon} {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="bg-white rounded-2xl aspect-[4/5] animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {cards.map(card => (
                            <motion.div
                                key={card.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100 relative"
                            >
                                <div className="aspect-[4/5] bg-gray-100 overflow-hidden relative">
                                    <img src={card.previewImage} alt={card.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
                                        <Button
                                            size="sm"
                                            onClick={() => navigate(`/editor/${card.id}`)}
                                            className="w-full"
                                        >
                                            Customize
                                        </Button>
                                    </div>
                                    {card.isPaid && (
                                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-yellow-600 p-1.5 rounded-full shadow-sm">
                                            <Crown size={16} fill="currentColor" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 truncate">{card.title}</h3>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-sm text-gray-500">{card.isPaid ? 'Premium' : 'Free'}</span>
                                        {card.isPaid && <span className="text-sm font-semibold text-rose-600">₹{card.price}</span>}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {!loading && cards.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-gray-900">No cards found</h3>
                        <p className="text-gray-500">Try selecting a different category.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
