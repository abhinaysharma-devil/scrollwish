import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence } from 'framer-motion';
import { CardContent, RecipientResponse } from '../types';
import { THEME_CONFIG } from '../constants';
import { Heart, Music, ArrowDown, Play, Pause, Gift, Calendar, Clock, MapPin, X, Fingerprint, FileText, CheckCircle2, UserCheck, MailOpen } from 'lucide-react';
import { Button } from './Button';
import bouquet from '../assets/bouquet.png';

interface CardViewerProps {
    content: CardContent;
    isPreview?: boolean;
    existingResponse?: RecipientResponse;
    onSaveResponse?: (data: any) => void;
    isOwner?: boolean;
}

export const CardViewer: React.FC<CardViewerProps> = ({ content, isPreview = false, existingResponse, onSaveResponse, isOwner = false }) => {
    const theme = THEME_CONFIG[content.theme];

    if (content.layout === 'timeline') {
        return <FriendshipTimelineViewer content={content} theme={theme} isPreview={isPreview} />;
    }

    if (content.layout === 'valentine') {
        return <ValentineViewer content={content} theme={theme} isPreview={isPreview} existingResponse={existingResponse} onSaveResponse={onSaveResponse} isOwner={isOwner} />;
    }

    return <DefaultViewer content={content} theme={theme} isPreview={isPreview} />;
};

// ----------------------------------------------------------------------
// LAYOUT 1: DEFAULT VERTICAL SCROLL
// ----------------------------------------------------------------------

const DefaultViewer = ({ content, theme, isPreview }: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const heightClass = isPreview ? 'h-full' : 'h-[100dvh]';
    const minHeightClass = isPreview ? 'min-h-full' : 'min-h-[100dvh]';

    // Helper to scroll
    const scrollToSection = (index: number) => {
        if (containerRef.current) {
            const height = containerRef.current.clientHeight;
            containerRef.current.scrollTo({
                top: index * height,
                behavior: 'smooth'
            });
        }
    };

    // Track scroll for active dot
    const handleScroll = () => {
        if (containerRef.current) {
            const { scrollTop, clientHeight } = containerRef.current;
            const index = Math.round(scrollTop / clientHeight);
            setActiveIndex(index);
        }
    };

    // Section 1: Hero
    const HeroSection = () => (
        <section className={`h-full ${minHeightClass} snap-start flex flex-col items-center justify-center p-8 text-center relative overflow-hidden ${theme.bg}`}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="z-10"
            >
                <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold tracking-wider mb-4 ${theme.secondary} ${theme.text} uppercase`}>
                    A Special Wish
                </span>
                <h1 className={`font-handwriting text-6xl md:text-8xl mb-6 ${theme.text} drop-shadow-sm`}>
                    {content.title}
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 font-light">For the wonderful</p>
                <h2 className={`font-serif text-4xl md:text-5xl mt-2 font-bold ${theme.text}`}>
                    {content.recipientName}
                </h2>
            </motion.div>

            {/* Floating Background Elements */}
            <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute top-20 left-10 text-rose-300 opacity-50"
            >
                <Heart size={48} fill="currentColor" />
            </motion.div>
            <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-32 right-10 text-purple-300 opacity-50"
            >
                <Heart size={32} fill="currentColor" />
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
                className="absolute bottom-10 animate-bounce text-gray-400 cursor-pointer"
                onClick={() => scrollToSection(1)}
            >
                <div className="flex flex-col items-center gap-2">
                    <span className="text-xs uppercase tracking-widest">Scroll Down</span>
                    <ArrowDown size={20} />
                </div>
            </motion.div>
        </section>
    );

    // Section 2: Message
    const MessageSection = () => (
        <section className={`h-full ${minHeightClass} snap-start flex items-center justify-center p-6 md:p-12 bg-white relative`}>
            <div className="max-w-2xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative p-8 md:p-12 rounded-3xl bg-slate-50 shadow-xl border border-slate-100"
                >
                    <div className="absolute -top-6 -left-6 text-6xl text-rose-200 font-serif">"</div>
                    <p className="text-lg md:text-xl leading-relaxed text-gray-700 font-sans whitespace-pre-wrap">
                        {content.message}
                    </p>
                    <div className="absolute -bottom-10 -right-6 text-6xl text-rose-200 font-serif rotate-180">"</div>
                </motion.div>
            </div>
        </section>
    );

    // Section 3: Shayari / Quote
    const QuoteSection = () => (
        <section className={`h-full ${minHeightClass} snap-start flex items-center justify-center p-8 ${theme.bg}`}>
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-3xl text-center"
            >
                <h3 className="font-handwriting text-5xl md:text-7xl leading-snug text-gray-800 mb-8">
                    {content.shayari}
                </h3>
                <div className="w-24 h-1 bg-gray-800 mx-auto opacity-20 rounded-full"></div>
            </motion.div>
        </section>
    );

    // Section 4: Gallery
    const GallerySection = () => (
        <section className={`h-full ${minHeightClass} snap-start flex flex-col justify-center p-4 md:p-12 bg-gray-900 text-white`}>
            <h3 className="text-center text-2xl md:text-3xl font-serif mb-12 text-rose-200">Memories with You</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 max-w-6xl mx-auto w-full">
                {content.images?.map((img: string, idx: number) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className="relative aspect-[3/4] md:aspect-square overflow-hidden rounded-2xl group"
                    >
                        <img src={img} alt="Memory" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </motion.div>
                ))}
            </div>
        </section>
    );

    // Section 5: Footer/Signoff
    const SignOffSection = () => (
        <section className={`h-full ${minHeightClass} snap-start flex flex-col items-center justify-center p-8 text-center bg-white`}>
            <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 mb-8"
            >
                <Heart size={40} fill="currentColor" />
            </motion.div>
            <h2 className="text-3xl font-light text-gray-500 mb-4">With lots of love,</h2>
            <h1 className="font-handwriting text-6xl text-rose-600">{content.senderName}</h1>

            {isPreview && (
                <div className="mt-12 p-4 bg-gray-50 rounded-lg text-xs text-gray-400">
                    Preview Mode • ScrollWish
                </div>
            )}
        </section>
    );

    // Dynamic Sections List
    const sections = [
        { id: 'hero', Component: HeroSection },
        { id: 'message', Component: MessageSection },
        ...(content.shayari ? [{ id: 'quote', Component: QuoteSection }] : []),
        ...(content.images && content.images.length > 0 ? [{ id: 'gallery', Component: GallerySection }] : []),
        { id: 'signoff', Component: SignOffSection }
    ];

    return (
        <div className="relative w-full h-full group">
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className={`${heightClass} w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth`}
                style={{ scrollBehavior: 'smooth' }}
            >
                {sections.map(({ id, Component }) => (
                    <Component key={id} />
                ))}
            </div>

            {/* Scroll Navigation Dots */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 z-50">
                {sections.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={(e) => { e.stopPropagation(); scrollToSection(idx); }}
                        className={`w-3 h-3 rounded-full transition-all duration-300 border border-white/50 backdrop-blur-sm ${activeIndex === idx
                                ? 'bg-rose-500 scale-125 shadow-lg shadow-rose-500/40'
                                : 'bg-black/20 hover:bg-black/40'
                            }`}
                        aria-label={`Go to section ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// LAYOUT 2: FRIENDSHIP TIMELINE
// ----------------------------------------------------------------------

const FriendshipTimelineViewer = ({ content, theme, isPreview }: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const bgPattern = theme.pattern || '';
    const heightClass = isPreview ? 'h-full' : 'h-[100dvh]';
    const minHeightClass = isPreview ? 'min-h-full' : 'min-h-[100dvh]';

    content =
    {
        title: "Happy Birthday!",
        recipientName: "Saloni",
        message: "Wishing you a day filled with happiness and a year filled with joy. Happy Birthday!",
        shayari: "May your day be filled with the same joy you bring to others.",
        images: [
            "https://www.dropbox.com/scl/fi/0z97zb0sqtbq2giyb8ld5/IMG_20230715_111111.jpg?rlkey=abj1b3aiai5y6orzmb0y60dt7&st=04mgf80y&raw=1",
            "https://www.dropbox.com/scl/fi/ohhvz0kbpoukzyibtp1dl/IMG_20230715_123319.jpg?rlkey=1c877r6fzy4aqcs8rhdhst9dp&st=xg1vsc92&raw=1"
        ],
        senderName: "Abhinay",
        theme: 'rose',
        layout: 'default'
    }

    // Section 1: Timeline Hero
    const TimelineHero = () => {
        const startYear = content.friendshipYears?.start || '2022';
        const endYear = content.friendshipYears?.end || '2026';

        // Animated Counter Logic
        const nodeRef = useRef<HTMLSpanElement>(null);
        const isInView = useInView(nodeRef);

        useEffect(() => {
            if (isInView && nodeRef.current) {
                const node = nodeRef.current;
                const controls = { value: parseInt(startYear) };

                const interval = setInterval(() => {
                    if (controls.value < parseInt(endYear)) {
                        controls.value += 1;
                        node.textContent = controls.value.toString();
                    } else {
                        clearInterval(interval);
                    }
                }, 200); // Speed of counter

                return () => clearInterval(interval);
            }
        }, [isInView, startYear, endYear]);

        return (
            <section className={`h-full ${minHeightClass} snap-start flex flex-col items-center justify-center p-8 text-center relative overflow-hidden ${theme.bg}`}>
                {/* WhatsApp Style Doodle Background */}
                <div className={`absolute inset-0 ${bgPattern} bg-repeat opacity-10 pointer-events-none`}></div>

                <motion.div className="z-10 bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-teal-100 max-w-lg w-full">
                    <span className="block text-teal-600 font-bold tracking-widest uppercase mb-2">Friendship Since</span>
                    <div className="flex items-center justify-center gap-4 text-5xl md:text-7xl font-bold text-teal-800 font-sans">
                        <span className="opacity-50 scale-75">{startYear}</span>
                        <ArrowDown className="rotate-[-90deg] text-teal-400" size={32} />
                        <span ref={nodeRef}>{startYear}</span>
                    </div>
                    <div className="mt-8">
                        <h1 className="text-3xl md:text-4xl font-handwriting text-teal-700">
                            {content.recipientName} & {content.senderName}
                        </h1>
                    </div>
                </motion.div>
            </section>
        );
    }

    // Section 2: Cylindrical Scroll
    const CylindricalSection = () => {
        const sectionRef = useRef<HTMLDivElement>(null);
        const { scrollYProgress } = useScroll({
            target: sectionRef,
            offset: ["start end", "end start"]
        });

        // Use scroll to rotate 
        const rotateY = useTransform(scrollYProgress, [0, 1], [45, -45]);
        const scale = useTransform(scrollYProgress, [0.3, 0.5, 0.7], [0.8, 1, 0.8]);

        // Default images if none provided
        const displayImages = (content.images && content.images.length >= 3)
            ? content.images.slice(0, 3)
            : [
                "https://www.dropbox.com/scl/fi/0z97zb0sqtbq2giyb8ld5/IMG_20230715_111111.jpg?rlkey=abj1b3aiai5y6orzmb0y60dt7&st=04mgf80y&raw=1",
                "https://www.dropbox.com/scl/fi/ohhvz0kbpoukzyibtp1dl/IMG_20230715_123319.jpg?rlkey=1c877r6fzy4aqcs8rhdhst9dp&st=xg1vsc92&raw=1",
            ];

        // Adjusted height for cylinder section in preview
        const sectionHeight = isPreview ? 'h-[150%]' : 'h-[150vh]';

        return (
            <section ref={sectionRef} className={`${sectionHeight} bg-teal-900 relative flex items-center justify-center perspective-[1000px] overflow-hidden snap-start`}>
                <div className="sticky top-0 h-screen flex flex-col items-center justify-center w-full">
                    <h2 className="text-white text-3xl font-serif mb-12 z-20">Unforgettable Moments</h2>

                    <motion.div
                        style={{ rotateY, transformStyle: "preserve-3d" }}
                        className="relative w-64 h-80 md:w-80 md:h-96"
                    >
                        {/* Center Image */}
                        <motion.div
                            style={{ z: 100, scale }}
                            className="absolute inset-0 rounded-2xl overflow-hidden border-4 border-white shadow-2xl bg-gray-800"
                        >
                            <img src={displayImages[0]} alt="Center" className="w-full h-full object-cover" />
                        </motion.div>

                        {/* Left Image (Rotated) */}
                        <motion.div
                            className="absolute inset-0 rounded-2xl overflow-hidden border-4 border-white/50 shadow-xl bg-gray-800 opacity-60"
                            style={{
                                rotateY: -45,
                                translateX: -200,
                                translateZ: -100,
                            }}
                        >
                            <img src={displayImages[1]} alt="Left" className="w-full h-full object-cover" />
                        </motion.div>

                        {/* Right Image (Rotated) */}
                        <motion.div
                            className="absolute inset-0 rounded-2xl overflow-hidden border-4 border-white/50 shadow-xl bg-gray-800 opacity-60"
                            style={{
                                rotateY: 45,
                                translateX: 200,
                                translateZ: -100,
                            }}
                        >
                            <img src={displayImages[2]} alt="Right" className="w-full h-full object-cover" />
                        </motion.div>
                    </motion.div>

                    <p className="text-teal-200 mt-12 animate-pulse">Scroll to explore</p>
                </div>
            </section>
        );
    }

    // Section 3: Long Message with Chat Background
    const LongMessageSection = () => {
        return (
            <section className={`min-h-[100dvh] ${isPreview ? 'min-h-full' : ''} snap-start flex items-center justify-center p-6 ${theme.bg} relative`}>
                <div className={`absolute inset-0 ${bgPattern} bg-repeat opacity-10 pointer-events-none`}></div>

                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-2xl w-full bg-[#DCF8C6] p-6 md:p-10 rounded-tr-3xl rounded-tl-3xl rounded-bl-3xl shadow-lg relative mx-4"
                >
                    <div className="absolute top-0 right-0 -mr-2 -mt-2">
                        <span className="relative flex h-6 w-6">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-6 w-6 bg-teal-500"></span>
                        </span>
                    </div>

                    <h3 className="font-bold text-teal-900 mb-4 text-xl">A note for you...</h3>
                    <p className="text-teal-900 text-lg leading-relaxed font-sans whitespace-pre-wrap">
                        {content.message || "Hey! Just wanted to remind you how awesome our friendship has been. From the late night talks to the random trips, every moment is precious."}
                    </p>
                    <div className="mt-4 flex justify-end">
                        <span className="text-xs text-teal-700 font-mono">Read just now</span>
                    </div>
                </motion.div>
            </section>
        )
    }

    // Section 4: Video Section
    const VideoSection = () => {
        const videoRef = useRef<HTMLVideoElement>(null);
        const [isPlaying, setIsPlaying] = useState(false);
        const isInView = useInView(videoRef, { amount: 0.6 });

        useEffect(() => {
            if (isInView && videoRef.current) {
                videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
            } else if (videoRef.current) {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        }, [isInView]);

        const videoSrc = content.videoUrl || "https://assets.mixkit.co/videos/preview/mixkit-friends-running-happily-on-the-beach-at-sunset-12963-large.mp4";

        return (
            <section className={`${minHeightClass} snap-start bg-black flex items-center justify-center relative`}>
                <video
                    ref={videoRef}
                    src={videoSrc}
                    className="w-full h-full object-cover opacity-80"
                    loop
                    muted
                    playsInline
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {!isPlaying && (
                        <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                            <Play size={40} className="text-white ml-2" fill="currentColor" />
                        </div>
                    )}
                </div>
                <div className="absolute bottom-10 left-10 z-10">
                    <h3 className="text-white font-bold text-2xl drop-shadow-lg">Captured Moments</h3>
                    <p className="text-gray-200">Watch our story unfold</p>
                </div>
            </section>
        );
    }

    // Section 5: Gallery Grid + Signoff
    const FinalGallerySection = () => {
        // Use images 3 onwards if available, else placeholders
        const moreImages = (content.images && content.images.length > 3)
            ? content.images.slice(3)
            : [
                "https://www.dropbox.com/scl/fi/0z97zb0sqtbq2giyb8ld5/IMG_20230715_111111.jpg?rlkey=abj1b3aiai5y6orzmb0y60dt7&st=04mgf80y&raw=1",
                "https://www.dropbox.com/scl/fi/ohhvz0kbpoukzyibtp1dl/IMG_20230715_123319.jpg?rlkey=1c877r6fzy4aqcs8rhdhst9dp&st=xg1vsc92&raw=1"
            ];

        return (
            <section className={`min-h-[100dvh] ${isPreview ? 'min-h-full' : ''} snap-start flex flex-col items-center justify-center p-8 ${theme.bg} relative`}>
                <div className={`absolute inset-0 ${bgPattern} bg-repeat opacity-10 pointer-events-none`}></div>

                <div className="grid grid-cols-2 gap-4 w-full max-w-4xl mb-12">
                    {moreImages.map((img, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0.8, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.2 }}
                            className={`rounded-2xl overflow-hidden shadow-lg ${i % 2 === 0 ? 'rotate-[-3deg] mt-8' : 'rotate-[3deg]'}`}
                        >
                            <img src={img} alt="" className="w-full h-full object-cover aspect-square" />
                        </motion.div>
                    ))}
                </div>

                <div className="text-center z-10 bg-white/90 p-8 rounded-full shadow-xl">
                    <p className="text-gray-500 mb-2">Forever & Always</p>
                    <h2 className="text-3xl font-handwriting text-teal-600">{content.senderName}</h2>
                </div>
            </section>
        );
    }

    return (
        <div
            ref={containerRef}
            className={`${heightClass} w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth`}
            style={{ scrollBehavior: 'smooth' }}
        >
            <TimelineHero />
            <CylindricalSection />
            <LongMessageSection />
            <VideoSection />
            <FinalGallerySection />
        </div>
    );
};


// ----------------------------------------------------------------------
// LAYOUT 3: VALENTINE INTERACTIVE (UPDATED)
// ----------------------------------------------------------------------

const ValentineViewer = ({ content, theme, isPreview, existingResponse, onSaveResponse, isOwner }: any) => {
    // If owner, always start at proposal so they see the card they made.
    // If recipient (not owner) and responded, show saved state.
    const initialStep = 'proposal';

    const [step, setStep] = useState<'proposal' | 'celebration' | 'fingerprint' | 'agreement' | 'bouquet' | 'form' | 'saved'>(initialStep);
    const [noBtnPos, setNoBtnPos] = useState({ x: 0, y: 0 });
    const [availableOn14, setAvailableOn14] = useState<'yes' | 'no' | null>(null);
    const [formData, setFormData] = useState({
        time: '',
        venue: '',
        customDate: ''
    });

    // Fingerprint Logic
    const [pressProgress, setPressProgress] = useState(0);
    const pressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

    const handlePressStart = () => {
        if (pressTimer.current) clearInterval(pressTimer.current);
        const startTime = Date.now();
        const duration = 1000; // 2 seconds

        pressTimer.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min((elapsed / duration) * 100, 100);
            setPressProgress(progress);

            if (progress >= 100) {
                if (pressTimer.current) clearInterval(pressTimer.current);
                setTimeout(() => setStep('agreement'), 500);
            }
        }, 50);
    };

    const handlePressEnd = () => {
        if (pressTimer.current) clearInterval(pressTimer.current);
        if (pressProgress < 100) {
            setPressProgress(0); // Reset if not complete
        }
    };

    const heightClass = isPreview ? 'h-full' : 'h-[100dvh]';

    const handleNoHover = () => {
        const randomX = (Math.random() - 0.5) * 300;
        const randomY = (Math.random() - 0.5) * 300;
        setNoBtnPos({ x: randomX, y: randomY });
    };

    const handleYesClick = () => {
        setStep('celebration');
    };

    const handleFormSave = () => {
        if (onSaveResponse) {
            onSaveResponse({
                availableOn14: availableOn14 === 'yes',
                time: formData.time,
                venue: formData.venue,
                customDate: availableOn14 === 'no' ? formData.customDate : '14th Feb'
            });
        }
        setStep('saved');
    };

    const Confetti = () => (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {[...Array(50)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ y: window.innerHeight, x: Math.random() * window.innerWidth, opacity: 1 }}
                    animate={{ y: -100, x: Math.random() * window.innerWidth, opacity: 0, rotate: 360 }}
                    transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }}
                    className="absolute w-3 h-3 rounded-full"
                    style={{ backgroundColor: ['#FF6B6B', '#FFD93D', '#6BCB77'][i % 3] }}
                />
            ))}
        </div>
    );

    const BackgroundDecor = () => (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-1/2 -right-20 w-80 h-80 bg-pink-200/30 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-red-100/30 rounded-full blur-3xl animate-pulse delay-2000" />
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute text-rose-300/40"
                    initial={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
                    animate={{ y: [0, -30, 0], opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 2 }}
                >
                    <Heart size={16 + Math.random() * 20} fill="currentColor" />
                </motion.div>
            ))}
        </div>
    );

    return (
        <div className={`${heightClass} w-full overflow-hidden bg-rose-50 relative flex items-center justify-center font-sans`}>
            <BackgroundDecor />

            {/* 1. PROPOSAL */}
            {step === 'proposal' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center p-8 max-w-lg w-full relative z-10"
                >
                    <div className="mb-8">
                        <Heart className="w-20 h-20 text-rose-500 mx-auto animate-pulse fill-rose-500" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-handwriting text-rose-600 mb-8 leading-normal">
                        Hey {content.recipientName},<br />
                        Will you be my Valentine?
                    </h1>

                    <div className="flex items-center justify-center gap-8 relative h-24">
                        <Button onClick={handleYesClick} size="lg" className="px-10 text-xl z-20 shadow-rose-200 shadow-xl hover:scale-110 transition-transform">
                            YES! 💖
                        </Button>
                        <motion.button
                            animate={{ x: noBtnPos.x, y: noBtnPos.y }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            onMouseEnter={handleNoHover}
                            onTouchStart={handleNoHover}
                            className="bg-gray-200 text-gray-500 px-8 py-3 rounded-full font-medium hover:bg-gray-300 absolute z-30 cursor-not-allowed"
                            style={{ position: 'relative' }}
                        >
                            No 😢
                        </motion.button>
                    </div>
                </motion.div>
            )}

            {/* 2. CELEBRATION */}
            {step === 'celebration' && (
                <>
                    <Confetti />
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center p-8 bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl max-w-lg mx-4 z-20 border-2 border-rose-100"
                    >
                        <h2 className="text-2xl font-bold text-rose-600 mb-4">Congratulations! 🎉</h2>
                        <p className="text-gray-700 text-lg mb-6">
                            You said YES! Now we need to make it official before you get your gift.
                        </p>
                        <Button onClick={() => setStep('fingerprint')} className="w-full animate-bounce">
                            Next Step <Fingerprint size={18} />
                        </Button>
                    </motion.div>
                </>
            )}

            {/* 3. FINGERPRINT SCAN */}
            {step === 'fingerprint' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center z-20 flex flex-col items-center justify-center"
                >
                    <h2 className="text-2xl font-bold text-gray-800 mb-8">Authentication Required</h2>
                    <p className="text-gray-500 mb-8 max-w-xs">Long press the sensor below to accept the terms of this relationship.</p>

                    <div className="relative group cursor-pointer select-none -webkit-tap-highlight-color-transparent">
                        {/* Glowing Ring */}
                        <svg width="120" height="120" viewBox="0 0 120 120" className="rotate-[-90deg]">
                            <circle cx="60" cy="60" r="54" stroke="#e5e7eb" strokeWidth="4" fill="transparent" />
                            <motion.circle
                                cx="60" cy="60" r="54"
                                stroke="#f43f5e"
                                strokeWidth="4"
                                fill="transparent"
                                strokeDasharray="339.292"
                                strokeDashoffset={339.292 - (339.292 * pressProgress) / 100}
                                strokeLinecap="round"
                            />
                        </svg>

                        {/* Fingerprint Icon */}
                        <div
                            className="absolute inset-0 flex items-center justify-center"
                            onMouseDown={handlePressStart}
                            onMouseUp={handlePressEnd}
                            onMouseLeave={handlePressEnd}
                            onTouchStart={handlePressStart}
                            onTouchEnd={handlePressEnd}
                        >
                            <Fingerprint
                                size={64}
                                className={`transition-colors duration-300 ${pressProgress > 0 ? 'text-rose-500' : 'text-gray-400'}`}
                            />
                        </div>
                    </div>

                    <p className="mt-8 text-sm font-mono text-rose-400">
                        {pressProgress > 0 ? `Scanning... ${Math.round(pressProgress)}%` : 'Hold to Scan'}
                    </p>
                </motion.div>
            )}

            {/* 4. LEGAL AGREEMENT */}
            {step === 'agreement' && (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative max-w-md w-full mx-4 bg-[#fdfbf7] p-8 rounded-sm shadow-2xl z-20 border border-stone-200"
                    style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper.png")' }}
                >
                    <div className="border-4 border-double border-stone-300 p-4 h-full flex flex-col items-center">
                        <FileText size={32} className="text-stone-400 mb-4" />
                        <h2 className="font-serif text-2xl font-bold text-stone-800 mb-6 uppercase border-b-2 border-stone-300 pb-2">
                            Official Agreement
                        </h2>

                        <div className="text-justify font-serif text-stone-700 text-sm leading-relaxed space-y-4 mb-8">
                            <p>
                                <span className="font-bold text-xl block mb-2 text-center font-handwriting">Dearest {content.recipientName},</span>
                            </p>
                            <p>
                                By placing your thumbprint, you acknowledge that you are now legally and emotionally the <span className="font-bold text-rose-600">Valentine</span> of <span className="font-bold">{content.senderName}</span>.
                            </p>
                            <p>
                                You hereby agree to be committed, loved, and cherished for the whole life. This contract is binding by the laws of love and is non-refundable.
                            </p>
                            <p>
                                Terms include: Unlimited hugs, date nights, and handling {content.senderName}'s bad jokes forever.
                            </p>
                        </div>

                        <div className="w-full flex justify-between items-end mt-4 border-t border-stone-300 pt-4">
                            <div className="text-center">
                                <div className="h-12 flex items-center justify-center">
                                    <span className="font-handwriting text-xl text-stone-600 transform -rotate-12">{content.recipientName}</span>
                                </div>
                                <span className="text-[10px] uppercase text-stone-400 tracking-widest border-t border-stone-300 px-2">Signed</span>
                            </div>
                            <div className="relative">
                                {/* Thumbprint Image */}
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Fingerprint_arch.svg/1200px-Fingerprint_arch.svg.png"
                                    alt="Print"
                                    className="w-16 h-16 opacity-20 filter sepia"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-14 h-14 border-2 border-red-700 rounded-full opacity-60 flex items-center justify-center transform rotate-[-15deg]">
                                        <span className="text-[8px] font-bold text-red-700 uppercase text-center leading-none">Official<br />Love<br />Seal</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={() => setStep('bouquet')}
                            className="mt-8 w-full bg-stone-800 hover:bg-stone-900 text-stone-100"
                        >
                            Accept & Continue
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* 5. BOUQUET */}
            {step === 'bouquet' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center relative cursor-pointer group z-20"
                    onClick={() => setStep('form')}
                >
                    <div className="relative">
                        {/* High quality realistic bouquet PNG */}
                        <img
                            src={bouquet}
                            alt="Bouquet"
                            className="w-80 h-auto drop-shadow-2xl mx-auto hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <span className="bg-white/90 text-rose-600 px-6 py-2 rounded-full font-bold shadow-lg transform scale-110">
                                Click to Plan Date!
                            </span>
                        </div>
                    </div>
                    <p className="mt-8 text-rose-500 font-handwriting text-4xl animate-pulse drop-shadow-sm">
                        A bouquet for you...
                    </p>
                </motion.div>
            )}

            {/* 6. DATE FORM */}
            {step === 'form' && (
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    className="absolute inset-0 bg-white z-50 overflow-y-auto"
                >
                    <div className="max-w-md mx-auto p-6 min-h-full flex flex-col justify-center">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-rose-600 flex items-center gap-2">
                                <Calendar className="text-rose-500" /> Plan Our Date
                            </h2>
                            <button onClick={() => setStep('bouquet')} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
                                <label className="block text-lg font-medium text-rose-900 mb-4">
                                    Are you available on 14th Feb?
                                </label>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setAvailableOn14('yes')}
                                        className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${availableOn14 === 'yes' ? 'border-rose-500 bg-rose-500 text-white' : 'border-rose-200 text-rose-600 hover:bg-rose-50'}`}
                                    >
                                        Yes! 🌹
                                    </button>
                                    <button
                                        onClick={() => setAvailableOn14('no')}
                                        className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${availableOn14 === 'no' ? 'border-rose-500 bg-rose-500 text-white' : 'border-rose-200 text-rose-600 hover:bg-rose-50'}`}
                                    >
                                        No 🥺
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence>
                                {availableOn14 === 'yes' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="space-y-4 overflow-hidden"
                                    >
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">What time works best?</label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-3 text-gray-400" size={18} />
                                                <input
                                                    type="time"
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-200 outline-none transition-shadow"
                                                    value={formData.time}
                                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Any specific venue in mind?</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                                                <input
                                                    type="text"
                                                    placeholder="e.g., That Italian place, or 'Surprise me!'"
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-200 outline-none transition-shadow"
                                                    value={formData.venue}
                                                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {availableOn14 === 'no' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="space-y-4 overflow-hidden"
                                    >
                                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 mb-4">
                                            <p className="text-yellow-800 text-sm">That's okay! Let me know when you are free.</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Which date works for you?</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                                                <input
                                                    type="date"
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-200 outline-none transition-shadow"
                                                    value={formData.customDate}
                                                    onChange={(e) => setFormData({ ...formData, customDate: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">What time?</label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-3 text-gray-400" size={18} />
                                                <input
                                                    type="time"
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-200 outline-none transition-shadow"
                                                    value={formData.time}
                                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Where should we go?</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                                                <input
                                                    type="text"
                                                    placeholder="Your favorite place..."
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-200 outline-none transition-shadow"
                                                    value={formData.venue}
                                                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {availableOn14 && (
                                <Button onClick={handleFormSave} size="lg" className="w-full mt-6 shadow-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700">
                                    Send to {content.senderName} 💌
                                </Button>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* 7. SAVED (RECIPIENT CONFIRMATION VIEW) */}
            {step === 'saved' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center p-8 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl max-w-lg mx-4 z-20"
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="text-green-500 fill-green-500" size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Response Sent!</h2>
                    <p className="text-gray-500 mb-6">
                        {content.senderName} has been notified. Get ready for a magical date! ✨
                    </p>

                    {/* Show confirmation details to Recipient */}
                    {!isOwner && existingResponse && (
                        <div className="bg-rose-50 p-4 rounded-xl text-left text-sm mb-6 text-gray-600">
                            <p><strong>Date:</strong> {existingResponse.availableOn14 ? '14th Feb' : existingResponse.customDate}</p>
                            <p><strong>Time:</strong> {existingResponse.time || 'Not set'}</p>
                            <p><strong>Venue:</strong> {existingResponse.venue || 'Not set'}</p>
                        </div>
                    )}

                    <Button variant="outline" onClick={() => setStep('proposal')}>
                        Replay Card
                    </Button>
                </motion.div>
            )}
        </div>
    );
};