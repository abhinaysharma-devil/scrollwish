import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CardViewer } from '../components/CardViewer';
import { CardContent, User, RecipientResponse } from '../types';
import { Button } from '../components/Button';
import { Sparkles, Lock, Gift, User as UserIcon } from 'lucide-react';
import { mockCards, mockPayment } from '../services/mockService';
import { Loader } from '../components/Loader';
import { SEO } from '../components/SEO';

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface SharePageProps {
    user: User | null;
    onLoginReq: () => void;
}

export const SharePage: React.FC<SharePageProps> = ({ user, onLoginReq }) => {
    const { hash } = useParams();
    const [content, setContent] = useState<CardContent | null>(null);
    const [existingResponse, setExistingResponse] = useState<RecipientResponse | undefined>(undefined);
    const [cardData, setCardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [paying, setPaying] = useState(false);

    useEffect(() => {
        const fetchCard = async () => {
            if (!hash) return;
            try {
                const data = await mockCards.getCardByHash(hash);
                setCardData(data);
                setExistingResponse(data.recipientResponse);
                if (!data.isLocked) {
                    setContent(data.content);
                }
            } catch (err) {
                setError("Card not found or expired.");
            } finally {
                setLoading(false);
            }
        };
        fetchCard();
    }, [hash]);

    const handleSaveResponse = async (response: any) => {
        if (hash) {
            try {
                await mockCards.saveResponse(hash, response);
                // Optimistically update local state to show saved view
                setExistingResponse(response);
            } catch (e) {
                console.error("Failed to save response", e);
                alert("Could not save your response. Please try again.");
            }
        }
    };

    const handleUnlockPayment = async () => {
        if (!user) {
            onLoginReq();
            return;
        }
        setPaying(true);
        try {
            // Create Order
            const orderData = await mockPayment.createOrder(cardData.template.price || 99);
            const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

            //   if (keyId === "YOUR_RAZORPAY_KEY_ID_HERE") {
            //       alert("Developer Info: Please set REACT_APP_RAZORPAY_KEY_ID in your .env file.");
            //       // Mock success for demo
            //       setTimeout(async () => {
            //           await mockPayment.verifyPayment({ cardId: cardData.cardId, paymentId: 'mock_pay_123', orderId: orderData.id, signature: 'mock_sig' });
            //           window.location.reload();
            //       }, 2000);
            //       return;
            //   }

            const razorpayOptions: any = {
                key: keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "ScrollWish",
                description: `Unlock ${cardData.template.title}`,
                order_id: orderData.id.startsWith('order_mock') ? undefined : orderData.id,
                handler: async function (response: any) {
                    // Verify
                    await mockPayment.verifyPayment({
                        cardId: cardData.cardId,
                        paymentId: response.razorpay_payment_id,
                        orderId: response.razorpay_order_id || orderData.id,
                        signature: response.razorpay_signature
                    });
                    // Refresh Page to see content
                    window.location.reload();
                },
                prefill: {
                    name: "ScrollWish User",
                    contact: user.phone
                },
                theme: { color: "#e11d48" }
            };

            if (window.Razorpay) {
                const rzp = new window.Razorpay(razorpayOptions);
                rzp.on('payment.failed', function (response: any) {
                    alert(response.error.description);
                    setPaying(false);
                });
                rzp.open();
            } else {
                alert("Razorpay SDK failed to load");
                setPaying(false);
            }
        } catch (e) {
            console.error(e);
            setPaying(false);
            alert("Payment initialization failed");
        }
    };

    // Determine SEO Metadata dynamically
    let seoTitle = "You have a new surprise! - ScrollWish";
    let seoDescription = "Someone sent you a magical digital greeting card. Tap to view the surprise.";
    let seoImage = "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80";

    if (cardData && cardData.content) {
        const sender = cardData.content.senderName || "A Friend";
        const recipient = cardData.content.recipientName || "You";
        seoTitle = `${sender} sent a card for ${recipient}! 🎁`;
        seoDescription = "Tap to open your personalized animated greeting card on ScrollWish.";
        if (cardData.content.images && cardData.content.images.length > 0) {
            seoImage = cardData.content.images[0];
        } else if (cardData.template && cardData.template.previewImage) {
            seoImage = cardData.template.previewImage;
        }
    }

    if (loading) {
        return (
            <div className="h-screen w-full bg-rose-50">
                <SEO title="Opening surprise..." />
                <Loader text="Opening your surprise..." />
            </div>
        )
    }

    if (error || !cardData) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-white p-4 text-center">
                <SEO title="Card Not Found" />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h1>
                <p className="text-gray-500 mb-4">{error || "Card not found"}</p>
                <Link to="/">
                    <Button>Go Home</Button>
                </Link>
            </div>
        );
    }

    const isOwner = user && cardData && user.id === cardData.ownerId;

    // LOCKED STATE UI
    if (cardData.isLocked) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-900 p-4 relative overflow-hidden">
                <SEO title="Locked Surprise - ScrollWish" />
                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl max-w-md w-full text-center border border-white/20 shadow-2xl z-10">
                    <div className="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-500/50">
                        <Lock className="text-white" size={32} />
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-2">Surprise Locked!</h1>

                    {isOwner ? (
                        <div className="space-y-6">
                            <p className="text-gray-300">
                                This premium card is waiting to be unlocked. Complete the payment to share the magic.
                            </p>
                            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                <p className="text-sm text-gray-400 mb-1">Total Amount</p>
                                <p className="text-2xl font-bold text-white">₹{cardData.template?.price || 99}</p>
                            </div>
                            <Button
                                className="w-full bg-green-500 hover:bg-green-600 border-none"
                                size="lg"
                                onClick={handleUnlockPayment}
                                isLoading={paying}
                            >
                                Pay to Unlock
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <p className="text-gray-300">
                                This surprise is currently being prepared by the sender.
                                Please check back in a while!
                            </p>
                            <div className="p-4 bg-white/5 rounded-xl">
                                <Gift className="mx-auto text-rose-400 mb-2" size={24} />
                                <p className="text-sm text-gray-400">It's going to be worth the wait!</p>
                            </div>
                            {!user && (
                                <button onClick={onLoginReq} className="text-rose-400 text-sm hover:underline flex items-center justify-center gap-1 w-full">
                                    <UserIcon size={14} /> Are you the sender? Login here
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <>
            <SEO
                title={seoTitle}
                description={seoDescription}
                image={seoImage}
            />
            <CardViewer
                content={content!}
                existingResponse={existingResponse}
                onSaveResponse={handleSaveResponse}
                isOwner={!!isOwner}
            />
            {/* Floating CTA for viewer to create their own */}
            {!isOwner && (
                <div className="fixed bottom-6 right-6 z-40">
                    <Link to="/">
                        <Button className="shadow-2xl animate-bounce">
                            <Sparkles size={16} /> Create Your Own
                        </Button>
                    </Link>
                </div>
            )}
        </>
    );
};