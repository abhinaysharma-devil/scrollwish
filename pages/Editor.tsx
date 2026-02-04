import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Share2, Type, Image as ImageIcon, Palette, Lock, Eye, Video, Monitor, Smartphone } from 'lucide-react';
import { Button } from '../components/Button';
import { CardViewer } from '../components/CardViewer';
import { DEFAULT_CARD_CONTENT, SHAYARI_LIBRARY, THEME_CONFIG } from '../constants';
import { CardContent, User } from '../types';
import { mockCards, mockPayment } from '../services/mockService';
import { Loader } from '../components/Loader';

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface EditorProps {
    user: User | null;
    onLoginReq: () => void;
}

export const Editor: React.FC<EditorProps> = ({ user, onLoginReq }) => {
    const { templateId } = useParams();
    const navigate = useNavigate();
    const [content, setContent] = useState<CardContent>(DEFAULT_CARD_CONTENT);
    const [activeTab, setActiveTab] = useState<'text' | 'media' | 'theme'>('text');
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
    const [saving, setSaving] = useState(false);
    const [loadingTemplate, setLoadingTemplate] = useState(true);
    const [templateIsPaid, setTemplateIsPaid] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState<any>(null);

    useEffect(() => {
        const loadTemplate = async () => {
             if (templateId) {
                 const t = await mockCards.getCardById(templateId);
                 if (t) {
                     setTemplateIsPaid(t.isPaid);
                     setCurrentTemplate(t);
                     
                     const baseContent = { ...DEFAULT_CARD_CONTENT, theme: t.themeColor as any, layout: t.layout };

                     if (t.layout === 'timeline') {
                         setContent({
                             ...baseContent,
                             layout: 'timeline',
                             friendshipYears: { start: '2018', end: '2024' },
                             theme: 'friendship',
                             images: [
                                "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&q=80", 
                                "https://images.unsplash.com/photo-1534180477871-5d6cc81f3920?w=500&q=80", 
                                "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=500&q=80",
                                "https://images.unsplash.com/photo-1517022812141-23620dba5c23?w=500&q=80"
                             ]
                         });
                     } else if (t.layout === 'valentine') {
                         setContent({
                             ...baseContent,
                             layout: 'valentine',
                             theme: 'rose',
                             recipientName: 'Priya',
                             senderName: 'Pawan'
                         });
                     } else {
                         setContent(baseContent);
                     }
                 }
             }
             setLoadingTemplate(false);
        }
        loadTemplate();
    }, [templateId]);

    const handleSave = async () => {
        if (!user) {
            onLoginReq();
            return;
        }

        setSaving(true);
        try {
            // 1. Save Card as Pending
            const cardResponse = await mockCards.createCard(user.id, templateId!, content, templateIsPaid);
            const cardId = cardResponse.cardId;

            if (templateIsPaid) {
                // 2. Create Razorpay Order
                const orderData = await mockPayment.createOrder(currentTemplate?.price || 99);
                
                // 3. Open Razorpay Modal
                const keyId = "YOUR_RAZORPAY_KEY_ID_HERE"; // Replace with your actual Key ID

                if (keyId === "YOUR_RAZORPAY_KEY_ID_HERE") {
                    alert("Developer Info: Please replace 'YOUR_RAZORPAY_KEY_ID_HERE' in Editor.tsx with your actual Razorpay Key ID.");
                    // For demo purposes, we will mock success after delay
                    setTimeout(async () => {
                        await mockPayment.verifyPayment({ cardId, paymentId: 'mock_pay_123', orderId: orderData.id, signature: 'mock_sig' });
                        setSaving(false);
                        navigate(`/card/${cardResponse.shareHash}`);
                    }, 2000);
                    return;
                }

                // If using a Mock Order ID with a real Key, Razorpay will fail.
                // We strip the order_id if it looks like a mock to allow 'Test/Standard' checkout flow if user just wants to test key.
                const razorpayOptions: any = {
                    key: keyId,
                    amount: orderData.amount,
                    currency: orderData.currency,
                    name: "ScrollWish",
                    description: `Unlock ${currentTemplate?.title}`,
                    // Only pass order_id if it is NOT a mock one, OR if you have a real backend generating real orders.
                    // For this hybrid demo, we remove it if it starts with 'order_mock' so standard checkout works.
                    order_id: orderData.id.startsWith('order_mock') ? undefined : orderData.id, 
                    handler: async function (response: any) {
                        setSaving(true);
                        await mockPayment.verifyPayment({
                            cardId: cardId,
                            paymentId: response.razorpay_payment_id,
                            orderId: response.razorpay_order_id || orderData.id,
                            signature: response.razorpay_signature
                        });
                        setSaving(false);
                        navigate(`/card/${cardResponse.shareHash}`);
                    },
                    prefill: {
                        name: "ScrollWish User",
                        contact: user.phone
                    },
                    theme: {
                        color: "#e11d48"
                    }
                };

                if (window.Razorpay) {
                    const rzp = new window.Razorpay(razorpayOptions);
                    rzp.on('payment.failed', function (response: any){
                        alert(response.error.description);
                        setSaving(false);
                    });
                    rzp.open();
                } else {
                    alert("Razorpay SDK not loaded. Check internet connection.");
                    setSaving(false);
                }
            } else {
                // Free card, just navigate
                setSaving(false);
                navigate(`/card/${cardResponse.shareHash}`);
            }
        } catch (error) {
            console.error("Failed to save", error);
            setSaving(false);
            alert("Failed to save card. Please try again.");
        }
    };

    const isTimelineLayout = content.layout === 'timeline';
    const isValentineLayout = content.layout === 'valentine';

    if (loadingTemplate) {
        return <Loader text="Setting up your studio..." fullScreen />;
    }

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-gray-100">
            {/* Toolbar Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center z-20">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="font-semibold text-gray-800 hidden sm:inline">Customize Card</span>
                </div>
                <div className="flex gap-2">
                     <button 
                        className="md:hidden p-2 text-rose-600 bg-rose-50 rounded-lg"
                        onClick={() => setShowPreviewModal(true)}
                     >
                        <Eye size={20} />
                     </button>
                    <Button 
                        size="sm" 
                        onClick={handleSave} 
                        isLoading={saving}
                        className="bg-green-600 hover:bg-green-700 shadow-green-200"
                    >
                        {templateIsPaid ? `Pay ₹${currentTemplate?.price || 99} & Save` : 'Save & Share'}
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - Controls */}
                <div className="w-full md:w-[400px] bg-white border-r border-gray-200 flex flex-col z-10 overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200">
                        <button 
                            onClick={() => setActiveTab('text')}
                            className={`flex-1 py-4 text-sm font-medium flex justify-center gap-2 ${activeTab === 'text' ? 'text-rose-600 border-b-2 border-rose-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Type size={18} /> Text
                        </button>
                        <button 
                            onClick={() => setActiveTab('media')}
                            className={`flex-1 py-4 text-sm font-medium flex justify-center gap-2 ${activeTab === 'media' ? 'text-rose-600 border-b-2 border-rose-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <ImageIcon size={18} /> Media
                        </button>
                        <button 
                            onClick={() => setActiveTab('theme')}
                            className={`flex-1 py-4 text-sm font-medium flex justify-center gap-2 ${activeTab === 'theme' ? 'text-rose-600 border-b-2 border-rose-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Palette size={18} /> Theme
                        </button>
                    </div>

                    {/* Controls Scroll Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {activeTab === 'text' && (
                            <div className="space-y-6 animate-fadeIn">
                                {!isValentineLayout && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Card Title</label>
                                        <input 
                                            type="text" 
                                            value={content.title}
                                            onChange={(e) => setContent({...content, title: e.target.value})}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-200 outline-none" 
                                        />
                                    </div>
                                )}
                                {isTimelineLayout && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Year</label>
                                            <input 
                                                type="text" 
                                                value={content.friendshipYears?.start || '2020'}
                                                onChange={(e) => setContent({...content, friendshipYears: { ...(content.friendshipYears || { end: '2024' }), start: e.target.value }})}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-200 outline-none" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">End Year</label>
                                            <input 
                                                type="text" 
                                                value={content.friendshipYears?.end || '2024'}
                                                onChange={(e) => setContent({...content, friendshipYears: { ...(content.friendshipYears || { start: '2020' }), end: e.target.value }})}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-200 outline-none" 
                                            />
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {isValentineLayout ? 'Partner\'s Name (Recipient)' : 'Recipient Name'}
                                    </label>
                                    <input 
                                        type="text" 
                                        value={content.recipientName}
                                        onChange={(e) => setContent({...content, recipientName: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-200 outline-none" 
                                    />
                                </div>
                                {!isValentineLayout && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Main Message</label>
                                        <textarea 
                                            rows={4}
                                            value={content.message}
                                            onChange={(e) => setContent({...content, message: e.target.value})}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-200 outline-none" 
                                        />
                                    </div>
                                )}
                                {!isTimelineLayout && !isValentineLayout && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Shayari / Quote</label>
                                        <div className="space-y-2">
                                            {SHAYARI_LIBRARY.map((s, idx) => (
                                                <div 
                                                    key={idx}
                                                    onClick={() => setContent({...content, shayari: s})}
                                                    className={`p-3 rounded-lg border cursor-pointer text-sm transition-colors ${content.shayari === s ? 'border-rose-500 bg-rose-50' : 'border-gray-200 hover:border-rose-200'}`}
                                                >
                                                    {s}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                                    <input 
                                        type="text" 
                                        value={content.senderName}
                                        onChange={(e) => setContent({...content, senderName: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-200 outline-none" 
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'media' && (
                            <div className="space-y-6">
                                {isValentineLayout ? (
                                    <p className="text-gray-500 text-sm">Media upload is disabled for this specific template layout.</p>
                                ) : (
                                    <>
                                        <p className="text-sm text-gray-500">
                                            This is a demo. In a real app, file upload would be implemented here.
                                            For now, image URLs are randomized.
                                        </p>
                                        <Button 
                                            variant="outline" 
                                            className="w-full"
                                            onClick={() => {
                                                const newImg = `https://picsum.photos/id/${Math.floor(Math.random()*200)}/800/600`;
                                                setContent({...content, images: [...content.images, newImg]})
                                            }}
                                        >
                                            + Add Random Photo
                                        </Button>

                                        <div className="grid grid-cols-2 gap-2">
                                            {content.images.map((img, idx) => (
                                                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                                    <button 
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => {
                                                            const newImages = content.images.filter((_, i) => i !== idx);
                                                            setContent({...content, images: newImages});
                                                        }}
                                                    >
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        {isTimelineLayout && (
                                            <div className="pt-6 border-t border-gray-100">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Video URL (Optional)</label>
                                                <input 
                                                    type="text" 
                                                    value={content.videoUrl || ''}
                                                    placeholder="https://example.com/video.mp4"
                                                    onChange={(e) => setContent({...content, videoUrl: e.target.value})}
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-200 outline-none text-sm" 
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === 'theme' && (
                            <div className="space-y-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Color Theme</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {(Object.keys(THEME_CONFIG) as Array<keyof typeof THEME_CONFIG>).map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setContent({...content, theme: t})}
                                            className={`p-4 rounded-xl border text-left transition-all ${content.theme === t ? 'border-rose-500 ring-2 ring-rose-200' : 'border-gray-200'}`}
                                        >
                                            <div className={`w-full h-8 rounded-lg mb-2 ${THEME_CONFIG[t].bg}`}></div>
                                            <span className="capitalize font-medium text-gray-700">{t}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Area - Preview */}
                <div className="flex-1 bg-gray-100 hidden md:flex flex-col items-center justify-center p-8 relative transition-all duration-300">
                     
                     {/* Preview Toggle */}
                     <div className="absolute top-6 flex gap-2 bg-white/50 backdrop-blur-sm p-1.5 rounded-full border border-gray-200 z-50">
                        <button 
                            onClick={() => setPreviewMode('mobile')}
                            className={`p-2 rounded-full transition-all flex items-center gap-2 text-sm font-medium ${previewMode === 'mobile' ? 'bg-white shadow text-rose-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Smartphone size={18} /> Mobile
                        </button>
                        <button 
                            onClick={() => setPreviewMode('desktop')}
                            className={`p-2 rounded-full transition-all flex items-center gap-2 text-sm font-medium ${previewMode === 'desktop' ? 'bg-white shadow text-rose-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Monitor size={18} /> Desktop
                        </button>
                     </div>

                    {/* Conditional Preview Frame */}
                    {previewMode === 'mobile' ? (
                        <div className="w-[375px] h-[750px] bg-black rounded-[40px] shadow-2xl overflow-hidden border-[8px] border-black relative transition-all duration-500 ease-in-out">
                             <div className="w-full h-full bg-white overflow-hidden rounded-[32px]">
                                 <CardViewer content={content} isPreview />
                             </div>
                        </div>
                    ) : (
                        <div className="w-full h-full max-w-6xl aspect-video bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-300 flex flex-col transition-all duration-500 ease-in-out">
                            {/* Browser Header */}
                            <div className="h-8 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                <div className="ml-4 flex-1 bg-white h-5 rounded-md text-[10px] text-gray-400 flex items-center px-2">
                                    scrollwish.com/preview
                                </div>
                            </div>
                            <div className="flex-1 overflow-hidden relative">
                                <CardViewer content={content} isPreview />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Preview Modal */}
            {showPreviewModal && (
                <div className="fixed inset-0 z-50 bg-black flex flex-col">
                    <button 
                        onClick={() => setShowPreviewModal(false)}
                        className="absolute top-4 right-4 z-50 text-white bg-black/50 p-2 rounded-full"
                    >
                        <XIcon />
                    </button>
                    <div className="flex-1 overflow-hidden">
                        <CardViewer content={content} isPreview />
                    </div>
                </div>
            )}
        </div>
    );
};

const XIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);