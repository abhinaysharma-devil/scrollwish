import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { mockCards, mockPayment } from '../services/mockService';
import { User, RecipientResponse } from '../types';
import { Button } from '../components/Button';
import { Copy, ExternalLink, Check, CreditCard, MailOpen, UserCheck, Calendar, Clock, MapPin, X } from 'lucide-react';

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface MyCardsProps {
    user: User | null;
}

export const MyCards: React.FC<MyCardsProps> = ({ user }) => {
    const [cards, setCards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [payingId, setPayingId] = useState<string | null>(null);
    const [responseModalData, setResponseModalData] = useState<RecipientResponse | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetch = async () => {
            if (user) {
                const data = await mockCards.getUserCards(user.id);
                setCards(data);
            }
            setLoading(false);
        };
        fetch();
    }, [user]);

    const handleCopy = (hash: string) => {
        const url = `${window.location.origin}/#/card/${hash}`;
        navigator.clipboard.writeText(url);
        setCopiedId(hash);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handlePay = async (card: any) => {
        if (!user) return;
        setPayingId(card._id);
        
        try {
            const orderData = await mockPayment.createOrder(card.template.price || 99);
            const options = {
                key: "YOUR_RAZORPAY_KEY_ID_HERE",
                amount: orderData.amount,
                currency: orderData.currency,
                name: "ScrollWish",
                description: `Unlock ${card.template.title}`,
                order_id: orderData.id,
                handler: async function (response: any) {
                    await mockPayment.verifyPayment({
                        cardId: card._id,
                        paymentId: response.razorpay_payment_id,
                        orderId: response.razorpay_order_id,
                        signature: response.razorpay_signature
                    });
                    
                    // Update local state
                    setCards(cards.map(c => c._id === card._id ? { ...c, paymentStatus: 'paid', isLocked: false } : c));
                    setPayingId(null);
                    // Navigate to card to show success/content
                    navigate(`/card/${card.shareHash}`);
                },
                prefill: {
                    name: "ScrollWish User",
                    contact: user.phone
                },
                theme: { color: "#e11d48" }
            };

            if (window.Razorpay) {
                const rzp = new window.Razorpay(options);
                rzp.open();
                rzp.on('payment.failed', () => setPayingId(null));
            } else {
                alert("Razorpay SDK not loaded");
                setPayingId(null);
            }
        } catch (e) {
            console.error(e);
            alert("Payment failed to start");
            setPayingId(null);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Please login to view your cards</h2>
                <Link to="/"><Button>Go Home</Button></Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">My Cards</h1>

                {loading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : cards.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">You haven't created any cards yet</h2>
                        <Link to="/explore"><Button>Create your first card</Button></Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {cards.map((card) => (
                            <div key={card._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex gap-4">
                                <div className="w-24 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                                    <img 
                                        src={card.template?.previewImage || 'https://via.placeholder.com/150'} 
                                        alt="" 
                                        className={`w-full h-full object-cover ${card.paymentStatus !== 'paid' ? 'grayscale opacity-70' : ''}`}
                                    />
                                    {card.paymentStatus !== 'paid' && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                            <CreditCard className="text-white drop-shadow-md" size={24} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-gray-900 mb-1 truncate pr-2">{card.content.title || 'Untitled Card'}</h3>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${card.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {card.paymentStatus}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-2">
                                            To: {card.content.recipientName} • {new Date(card.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    
                                    <div className="flex gap-2 mt-4 flex-wrap">
                                        {card.paymentStatus === 'paid' ? (
                                            <>
                                                <button 
                                                    onClick={() => handleCopy(card.shareHash)}
                                                    className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-rose-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                                                >
                                                    {copiedId === card.shareHash ? <Check size={14} /> : <Copy size={14} />}
                                                    {copiedId === card.shareHash ? 'Copied' : 'Copy'}
                                                </button>
                                                <Link 
                                                    to={`/card/${card.shareHash}`}
                                                    className="flex items-center gap-1 text-sm font-medium text-rose-600 hover:text-rose-700 border border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                                                >
                                                    <ExternalLink size={14} /> View
                                                </Link>
                                                
                                                {card.recipientResponse && (
                                                    <Button 
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => setResponseModalData(card.recipientResponse)}
                                                        className="px-3 py-1.5 text-sm h-auto bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-100"
                                                    >
                                                       💌 View Reply
                                                    </Button>
                                                )}
                                            </>
                                        ) : (
                                            <Button 
                                                size="sm" 
                                                className="bg-green-600 hover:bg-green-700 w-full"
                                                onClick={() => handlePay(card)}
                                                isLoading={payingId === card._id}
                                            >
                                                Pay ₹{card.template?.price || 99} to Unlock
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* RESPONSE MODAL */}
            <AnimatePresence>
                {responseModalData && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setResponseModalData(null)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl overflow-hidden text-center"
                        >
                            <button onClick={() => setResponseModalData(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>

                            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
                                <UserCheck size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">It's a Date!</h2>
                            <p className="text-gray-500 text-sm mb-6">Here is the response from your valentine</p>
                            
                            <div className="bg-rose-50 p-6 rounded-xl border border-rose-100 my-6 text-left space-y-4">
                                <div className="flex items-center gap-3 border-b border-rose-100 pb-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${responseModalData.availableOn14 ? 'bg-green-500' : 'bg-rose-500'}`}>
                                        {responseModalData.availableOn14 ? '✓' : 'X'}
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Accepted for 14th?</p>
                                        <p className="font-medium text-gray-900">{responseModalData.availableOn14 ? 'Yes! 💖' : 'Proposed another date'}</p>
                                    </div>
                                </div>
                                
                                {responseModalData.customDate && (
                                     <div className="flex items-center gap-3">
                                        <Calendar size={18} className="text-rose-400" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Date</p>
                                            <p className="font-medium text-gray-900">{responseModalData.customDate}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-3">
                                    <Clock size={18} className="text-rose-400" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Time</p>
                                        <p className="font-medium text-gray-900">{responseModalData.time || 'Not specified'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin size={18} className="text-rose-400" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Venue</p>
                                        <p className="font-medium text-gray-900">{responseModalData.venue || 'Not specified'}</p>
                                    </div>
                                </div>
                            </div>

                            <Button onClick={() => setResponseModalData(null)} className="w-full">
                                Close
                            </Button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};