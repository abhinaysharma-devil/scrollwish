
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Share2, Type, Image as ImageIcon, Palette, Lock, Eye, Video, Monitor, Smartphone, Map, Calendar, Upload, Trash2, CheckSquare, Square, Mic, StopCircle, Play, Pause } from 'lucide-react';
import { Button } from '../components/Button';
import { CardViewer } from '../components/CardViewer';
import { DEFAULT_CARD_CONTENT, SHAYARI_LIBRARY, TEMPLATE_UPLOAD_PATH, THEME_CONFIG } from '../constants';
import { CardContent, User } from '../types';
import { api } from '../services/api';
import { convertHeicToJpeg, uploadFile } from '../services/firebase';
import { Loader } from '../components/Loader';
import { SEO } from '../components/SEO';

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface EditorProps {
    user: User | null;
    onLoginReq: () => void;
}

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export const Editor: React.FC<EditorProps> = ({ user, onLoginReq }) => {
    const { slug } = useParams();
    console.log("---------------", slug)
    const navigate = useNavigate();
    const [content, setContent] = useState<CardContent>(DEFAULT_CARD_CONTENT);
    const [activeTab, setActiveTab] = useState<'text' | 'media' | 'theme'>('text');
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
    const [saving, setSaving] = useState(false);
    const [loadingTemplate, setLoadingTemplate] = useState(true);
    const [templateIsPaid, setTemplateIsPaid] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState<any>(null);

    // Media Upload State
    const [uploading, setUploading] = useState(false);
    const [includeVideo, setIncludeVideo] = useState(false);

    // Audio Recorder State
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        const loadTemplate = async () => {
            if (slug) {
                try {
                    //  const t = await api.getTemplateById(templateId);
                    const t = await api.getTemplateBySlug(slug);
                    if (t) {
                        setTemplateIsPaid(t.isPaid);
                        setCurrentTemplate(t);

                        // Initialize Content
                        const baseContent: CardContent = {
                            ...t,
                            theme: t.themeColor as any,
                            layout: t.layout,
                            renderFunction: t.renderFunction // CRITICAL: Persist render function
                        };

                        if (t.layout === 'timeline') {
                            setContent({
                                ...baseContent,
                                recipientName: "Saloni",
                                senderName: "Abhinay",
                                message: "Jo kapde Mahkade use kehete itra, mai tera dost tu meri param mitra. Happy Friendship Day!",
                                friendshipYears: { start: '2022', end: '2026' },
                                theme: 'friendship',
                                images: [
                                    "https://firebasestorage.googleapis.com/v0/b/global-bucket-for-devils-projects/o/scrollwish%2Fcard-templates%2F8358985420%2F1771114509074_84d10e7c-cfd7-4491-a1c9-f83c9f53061c.jpg?alt=media&token=68650c1e-6b26-4de5-8f6f-cd60eced25ab",
                                    "https://firebasestorage.googleapis.com/v0/b/global-bucket-for-devils-projects/o/scrollwish%2Fcard-templates%2F8358985420%2F1771114511883_WhatsApp%20Image%202025-04-02%20at%2010.18.24%20PM.jpeg?alt=media&token=5db52c9b-03be-4970-a469-5002318bc0ba",
                                    "https://firebasestorage.googleapis.com/v0/b/global-bucket-for-devils-projects/o/scrollwish%2Fcard-templates%2F8358985420%2F1771114509074_84d10e7c-cfd7-4491-a1c9-f83c9f53061c.jpg?alt=media&token=68650c1e-6b26-4de5-8f6f-cd60eced25ab"
                                ]
                            });
                            setIncludeVideo(!!baseContent.videoUrl);
                        } else if (t.layout === 'valentine') {
                            setContent({
                                ...baseContent,
                                theme: 'rose',
                                recipientName: 'Priya',
                                senderName: 'Pawan'
                            });
                        } else if (t.layout === 'wedding') {
                            setContent({
                                ...baseContent,
                                theme: 'gold' as any,
                                recipientName: 'Modi', // Bride
                                senderName: 'Meloni', // Groom
                                weddingDate: '2026-12-25',
                                weddingTime: '18:00',
                                venueName: 'Parliament of India',
                                venueAddress: 'Delhi, India',
                                invitationNote: 'We invite you to share in our joy as we begin our new life together.',
                                images: [
                                    "https://firebasestorage.googleapis.com/v0/b/global-bucket-for-devils-projects/o/scrollwish%2F1771175510496_Screenshot%202026-02-15%20224120.png?alt=media&token=2aa96c29-417e-48fd-bbaa-2eea28437bc2",  // Default Bride
                                    "https://firebasestorage.googleapis.com/v0/b/global-bucket-for-devils-projects/o/scrollwish%2F1771175501040_Screenshot%202026-02-15%20224016.png?alt=media&token=b7194371-8f43-40db-91d9-3be9a4f71f4c", // Default Groom
                                ]
                            });
                        } else if (t.layout === "birthday_cake") {
                            setContent({
                                ...baseContent,
                                recipientName: "Saloni",
                                senderName: "Abhinay",
                                message : "This birthday, I wish you abundant happiness and love. May all your dreams turn into reality and may lady luck visit your home today. Happy birthday to one of the sweetest people I’ve ever known.",
                                images: [
                                    "https://firebasestorage.googleapis.com/v0/b/global-bucket-for-devils-projects/o/scrollwish%2Fcard-templates%2Fanonymous%2F1771436204303_lok.jpeg?alt=media&token=30c9c554-ff21-433d-ba9f-1f83eed239df"
                                ],
                                audioMessageUrl : "https://firebasestorage.googleapis.com/v0/b/global-bucket-for-devils-projects/o/scrollwish%2Flaadle.mp3?alt=media&token=5ab8749c-f567-4dfd-a3e8-baf8d4aa2274"
                            });

                        } else {
                            setContent(baseContent);
                        }
                    }
                } catch (e) {
                    console.error("Template load failed", e);
                }
            }
            setLoadingTemplate(false);
        }
        loadTemplate();
    }, [slug]);

    // Handle Image Uploads
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const files = Array.from(e.target.files) as File[];
        const newUrls: string[] = [];

        try {
            for (const file of files) {
                // Determine path based on user or anonymous
                let convertedFile = await convertHeicToJpeg(file);
                console.log('convertedFile', convertedFile)
                const userPhone = user?.phone || 'anonymous';
                const path = `${TEMPLATE_UPLOAD_PATH}/${userPhone}/${Date.now()}_${file.name}`;
                const url = await uploadFile(convertedFile, path);
                newUrls.push(url);
            }

            // Append new images to existing ones
            setContent(prev => ({
                ...prev,
                images: [...prev.images, ...newUrls]
            }));
        } catch (error) {
            console.error("Image upload failed", error);
            alert("Failed to upload image. Please check your Firebase configuration.");
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    // Handle Video Upload
    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const file = e.target.files[0];

        try {
            const userPhone = user?.phone || 'anonymous';
            const path = `${TEMPLATE_UPLOAD_PATH}/${userPhone}/${Date.now()}_${file.name}`;
            const url = await uploadFile(file, path);

            setContent(prev => ({
                ...prev,
                videoUrl: url
            }));
        } catch (error) {
            console.error("Video upload failed", error);
            alert("Failed to upload video. Please check your Firebase configuration.");
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    // --- Audio Recorder Logic ---
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const saveRecording = async () => {
        if (!audioBlob) return;
        setUploading(true);
        try {
            const file = new File([audioBlob], "voice_note.webm", { type: "audio/webm" });
            const userId = user?.id || 'anonymous';
            const path = `uploads/${userId}/audio/${Date.now()}_voice.webm`;
            const url = await uploadFile(file, path);

            setContent(prev => ({
                ...prev,
                audioMessageUrl: url
            }));
            setAudioBlob(null); // Clear buffer
        } catch (error) {
            console.error("Failed to upload recording", error);
            alert("Failed to save recording.");
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        setContent(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const toggleVideo = () => {
        setIncludeVideo(prev => {
            const newState = !prev;
            if (!newState) {
                // If turning off, clear video URL
                setContent(c => ({ ...c, videoUrl: undefined }));
            }
            return newState;
        });
    };

    const handleSave = async () => {
        if (!user) {
            onLoginReq();
            return;
        }

        setSaving(true);
        try {
            // 1. Save Card as Pending
            const cardResponse = await api.createCard(user.id, slug!, content, templateIsPaid);
            const cardId = cardResponse.cardId;

            if (templateIsPaid) {
                // Ensure Script loads
                const scriptLoaded = await loadRazorpayScript();
                if (!scriptLoaded) {
                    alert('Razorpay SDK failed to load. Please check your internet connection.');
                    setSaving(false);
                    return;
                }

                // 2. Create Mock Order
                const orderData = await api.createOrder(currentTemplate?.price || 99);

                // Use Environment Variable or fallback to the instruction string
                const keyId = (import.meta as any).env.VITE_RAZORPAY_KEY_ID || "YOUR_RAZORPAY_KEY_ID_HERE";

                // DEMO MODE
                if (keyId === "YOUR_RAZORPAY_KEY_ID_HERE") {
                    console.warn("Using Demo Payment Mode. Set VITE_RAZORPAY_KEY_ID in .env for real payments.");
                    setTimeout(async () => {
                        await api.verifyPayment({ cardId, paymentId: 'mock_pay_123', orderId: orderData.id, signature: 'mock_sig' });
                        setSaving(false);
                        navigate(`/card/${cardResponse.shareHash}`);
                    }, 2000);
                    return;
                }

                // REAL MODE
                const razorpayOptions: any = {
                    key: keyId,
                    amount: orderData.amount,
                    currency: orderData.currency,
                    name: "ScrollWish",
                    description: `Unlock ${currentTemplate?.title}`,
                    order_id: orderData.id.startsWith('order_mock') ? undefined : orderData.id,
                    handler: async function (response: any) {
                        setSaving(true);
                        await api.verifyPayment({
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
                    },
                    retry: {
                        enabled: false
                    }
                };

                const rzp = new window.Razorpay(razorpayOptions);
                rzp.on('payment.failed', function (response: any) {
                    console.error(response.error);
                    alert(`Payment Failed: ${response.error.description}`);
                    setSaving(false);
                });
                rzp.open();

            } else {
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
    const isWeddingLayout = content.layout === 'wedding';
    const isBirthdayCakeLayout = content.layout === 'birthday_cake';

    if (loadingTemplate) {
        return <Loader text="Setting up your studio..." fullScreen />;
    }

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-gray-100">
            <SEO title={`Customize ${currentTemplate?.title || 'Card'} - ScrollWish`} />

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
                                {!isValentineLayout && !isWeddingLayout && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Card Title</label>
                                        <input
                                            type="text"
                                            value={content.title}
                                            onChange={(e) => setContent({ ...content, title: e.target.value })}
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
                                                onChange={(e) => setContent({ ...content, friendshipYears: { ...(content.friendshipYears || { end: '2024' }), start: e.target.value } })}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-200 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">End Year</label>
                                            <input
                                                type="text"
                                                value={content.friendshipYears?.end || '2024'}
                                                onChange={(e) => setContent({ ...content, friendshipYears: { ...(content.friendshipYears || { start: '2020' }), end: e.target.value } })}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-200 outline-none"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Standard Inputs */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {isValentineLayout ? 'Partner\'s Name (Recipient)' : isWeddingLayout ? 'Bride Name' : 'Recipient Name'}
                                    </label>
                                    <input
                                        type="text"
                                        value={content.recipientName}
                                        onChange={(e) => setContent({ ...content, recipientName: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-200 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {isWeddingLayout ? 'Groom Name' : 'Your Name'}
                                    </label>
                                    <input
                                        type="text"
                                        value={content.senderName}
                                        onChange={(e) => setContent({ ...content, senderName: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-200 outline-none"
                                    />
                                </div>

                                {/* Wedding Specifics */}
                                {isWeddingLayout && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                                <input
                                                    type="date"
                                                    value={content.weddingDate}
                                                    onChange={(e) => setContent({ ...content, weddingDate: e.target.value })}
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-200 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                                                <input
                                                    type="time"
                                                    value={content.weddingTime}
                                                    onChange={(e) => setContent({ ...content, weddingTime: e.target.value })}
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-200 outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Venue Name</label>
                                            <input
                                                type="text"
                                                value={content.venueName}
                                                onChange={(e) => setContent({ ...content, venueName: e.target.value })}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-200 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Venue Address</label>
                                            <textarea
                                                rows={2}
                                                value={content.venueAddress}
                                                onChange={(e) => setContent({ ...content, venueAddress: e.target.value })}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-200 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Google Maps Link</label>
                                            <input
                                                type="text"
                                                value={content.venueMapUrl}
                                                onChange={(e) => setContent({ ...content, venueMapUrl: e.target.value })}
                                                placeholder="https://maps.google.com/..."
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-200 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Invitation Note</label>
                                            <textarea
                                                rows={3}
                                                value={content.invitationNote}
                                                onChange={(e) => setContent({ ...content, invitationNote: e.target.value })}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-200 outline-none"
                                            />
                                        </div>
                                    </>
                                )}

                                {!isValentineLayout && !isWeddingLayout && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Main Message</label>
                                        <textarea
                                            rows={4}
                                            value={content.message}
                                            onChange={(e) => setContent({ ...content, message: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-200 outline-none"
                                        />
                                    </div>
                                )}

                                {!isTimelineLayout && !isValentineLayout && !isWeddingLayout && !isBirthdayCakeLayout && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Shayari / Quote</label>
                                        <div className="space-y-2">
                                            {SHAYARI_LIBRARY.map((s, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => setContent({ ...content, shayari: s })}
                                                    className={`p-3 rounded-lg border cursor-pointer text-sm transition-colors ${content.shayari === s ? 'border-rose-500 bg-rose-50' : 'border-gray-200 hover:border-rose-200'}`}
                                                >
                                                    {s}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'media' && (
                            <div className="space-y-6">
                                {isValentineLayout ? (
                                    <p className="text-gray-500 text-sm">Media upload is disabled for this template layout. We use illustrated avatars.</p>
                                ) : isTimelineLayout ? (
                                    <div className="space-y-6">
                                        {/* IMAGE UPLOAD FOR TIMELINE */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Your Memories (Images)</label>
                                            <div className="flex flex-col gap-4">
                                                <div className="flex items-center gap-4 flex-wrap">
                                                    {content.images.map((img, idx) => (
                                                        <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden group border border-gray-200">
                                                            <img src={img} alt="Memory" className="w-full h-full object-cover" />
                                                            <button
                                                                onClick={() => removeImage(idx)}
                                                                className="absolute top-0 right-0 bg-red-500 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="relative">
                                                    <input
                                                        type="file"
                                                        multiple
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                        className="hidden"
                                                        id="image-upload"
                                                        disabled={uploading}
                                                    />
                                                    <label
                                                        htmlFor="image-upload"
                                                        className={`flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-rose-400 hover:bg-rose-50 transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        {uploading ? <Loader text="Uploading..." /> : <><Upload size={20} className="text-gray-400" /> <span className="text-gray-600 font-medium">Upload Photos</span></>}
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* VIDEO UPLOAD FOR TIMELINE */}
                                        <div className="pt-6 border-t border-gray-100">
                                            <div
                                                className="flex items-center gap-2 cursor-pointer mb-4"
                                                onClick={toggleVideo}
                                            >
                                                {includeVideo ? <CheckSquare className="text-rose-500" /> : <Square className="text-gray-400" />}
                                                <span className="text-gray-700 font-medium select-none">Include a Video Memory?</span>
                                            </div>

                                            {includeVideo && (
                                                <div className="animate-in fade-in slide-in-from-top-2">
                                                    {content.videoUrl ? (
                                                        <div className="relative rounded-xl overflow-hidden bg-black aspect-video mb-2">
                                                            <video src={content.videoUrl} controls className="w-full h-full object-contain" />
                                                            <button
                                                                onClick={() => setContent({ ...content, videoUrl: undefined })}
                                                                className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="relative">
                                                            <input
                                                                type="file"
                                                                accept="video/*"
                                                                onChange={handleVideoUpload}
                                                                className="hidden"
                                                                id="video-upload"
                                                                disabled={uploading}
                                                            />
                                                            <label
                                                                htmlFor="video-upload"
                                                                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            >
                                                                {uploading ? <Loader text="Uploading Video..." /> : (
                                                                    <>
                                                                        <Video size={32} className="text-purple-300 mb-2" />
                                                                        <span className="text-gray-600 text-sm">Click to upload video</span>
                                                                        <span className="text-xs text-gray-400 mt-1">MP4, WebM (Max 20MB rec.)</span>
                                                                    </>
                                                                )}
                                                            </label>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : isWeddingLayout ? (
                                    <>
                                        <div className="space-y-6">
                                            {/* Wedding Specific Image Logic (Groom/Bride) */}
                                            {/* ... existing wedding logic ... */}
                                            {/* Keep this brief for brevity as it's unchanged */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Groom's Photo</label>
                                                <div className="relative">
                                                    <input type="file" accept="image/*" className="hidden" id="groom-upload" onChange={async (e) => {
                                                        if (e.target.files?.[0]) {
                                                            setUploading(true);
                                                            try {
                                                                const url = await uploadFile(e.target.files[0], `${TEMPLATE_UPLOAD_PATH}${user?.phone || 'anonymous'}/groom/${Date.now()}`);
                                                                const imgs = [...content.images]; imgs[0] = url;
                                                                setContent({ ...content, images: imgs });
                                                            } catch (e) { alert("Upload failed"); }
                                                            setUploading(false);
                                                        }
                                                    }} />
                                                    <label htmlFor="groom-upload" className="block w-full border-dashed border-2 p-4 text-center rounded-lg cursor-pointer hover:bg-gray-50">
                                                        {uploading ? "Uploading..." : "Upload Groom Photo"}
                                                    </label>
                                                </div>
                                                {content.images?.[0] && (
                                                    <div className="mt-2 relative w-32 h-32 rounded-full overflow-hidden border-2 border-rose-200 mx-auto">
                                                        <img src={content.images[0]} alt="Groom" className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="border-t border-gray-100 pt-6">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Bride's Photo</label>
                                                <div className="relative">
                                                    <input type="file" accept="image/*" className="hidden" id="bride-upload" onChange={async (e) => {
                                                        if (e.target.files?.[0]) {
                                                            setUploading(true);
                                                            try {
                                                                const url = await uploadFile(e.target.files[0], `${TEMPLATE_UPLOAD_PATH}${user?.phone || 'anonymous'}/bride/${Date.now()}`);
                                                                const imgs = [...content.images]; imgs[1] = url;
                                                                setContent({ ...content, images: imgs });
                                                            } catch (e) { alert("Upload failed"); }
                                                            setUploading(false);
                                                        }
                                                    }} />
                                                    <label htmlFor="bride-upload" className="block w-full border-dashed border-2 p-4 text-center rounded-lg cursor-pointer hover:bg-gray-50">
                                                        {uploading ? "Uploading..." : "Upload Bride Photo"}
                                                    </label>
                                                </div>
                                                {content.images?.[1] && (
                                                    <div className="mt-2 relative w-32 h-32 rounded-full overflow-hidden border-2 border-rose-200 mx-auto">
                                                        <img src={content.images[1]} alt="Bride" className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : isBirthdayCakeLayout ? (
                                    <div className="space-y-6">
                                        <p className="text-sm text-gray-500 mb-4">
                                            Upload photo for the birthday celebration.
                                        </p>
                                        <div className="relative mb-4">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                id="generic-image-upload"
                                                disabled={uploading}
                                            />
                                            <label
                                                htmlFor="generic-image-upload"
                                                className="flex items-center justify-center gap-2 w-full p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                            >
                                                {uploading ? "Uploading..." : "+ Set Birthday Person Photo"}
                                            </label>
                                        </div>
                                        {content.images[0] && (
                                            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-rose-200 mx-auto mb-6">
                                                <img src={content.images[0]} alt="Person" className="w-full h-full object-cover" />
                                                <button
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100"
                                                    onClick={() => removeImage(0)}
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        )}

                                        <div className="border-t border-gray-200 pt-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Voice Message</label>

                                            {content.audioMessageUrl ? (
                                                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                                                    <Play size={18} className="text-green-600" />
                                                    <span className="text-sm text-green-700 flex-1 truncate">Message Recorded</span>
                                                    <button
                                                        onClick={() => setContent({ ...content, audioMessageUrl: undefined })}
                                                        className="text-red-500 p-1 hover:bg-red-50 rounded"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {/* Recording UI */}
                                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                                                        {!isRecording && !audioBlob && (
                                                            <button
                                                                onClick={startRecording}
                                                                className="flex flex-col items-center justify-center gap-2 w-20 h-20 rounded-full bg-red-100 text-red-600 mx-auto hover:bg-red-200 transition-colors"
                                                            >
                                                                <Mic size={24} />
                                                                <span className="text-xs font-bold">Record</span>
                                                            </button>
                                                        )}

                                                        {isRecording && (
                                                            <div className="flex flex-col items-center gap-3">
                                                                <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                                                                    <Mic size={32} className="text-white" />
                                                                </div>
                                                                <span className="text-red-500 font-medium text-sm animate-pulse">Recording...</span>
                                                                <Button size="sm" onClick={stopRecording} variant="outline" className="border-red-200 text-red-500">
                                                                    Stop
                                                                </Button>
                                                            </div>
                                                        )}

                                                        {audioBlob && !isRecording && (
                                                            <div className="space-y-3">
                                                                <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                                                                    <CheckSquare size={18} /> Recorded!
                                                                </div>
                                                                <audio controls src={URL.createObjectURL(audioBlob)} className="w-full h-8" />
                                                                <div className="flex gap-2 justify-center">
                                                                    <Button size="sm" variant="secondary" onClick={() => setAudioBlob(null)}>Discard</Button>
                                                                    <Button size="sm" onClick={saveRecording} isLoading={uploading}>Use Recording</Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Add photos to your card gallery.
                                        </p>
                                        <div className="relative mb-4">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                id="generic-image-upload"
                                                disabled={uploading}
                                            />
                                            <label
                                                htmlFor="generic-image-upload"
                                                className="flex items-center justify-center gap-2 w-full p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                            >
                                                {uploading ? "Uploading..." : "+ Add Photo"}
                                            </label>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            {content.images.map((img, idx) => (
                                                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                                    <button
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => removeImage(idx)}
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
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
                                            onClick={() => setContent({ ...content, theme: t })}
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
