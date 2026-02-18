
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardContent } from '../types';
import { Button } from './Button';
import { Play, Pause, Mic, Gift, ThumbsUp, ThumbsDown, Music, ArrowDown, Sparkles, Volume2, VolumeX, CheckCircle2, PartyPopper } from 'lucide-react';
import CARTOON_GIF from "../assets/bubu-dudu-sseeyall.gif"

interface BirthdayCakeViewerProps {
    content: CardContent;
    minHeightClass?: string;
    onSaveResponse?: (data: any) => void;
    existingResponse?: any;
    isOwner?: boolean;
    isPreview?: boolean;
}

// --- Sub-Components ---

const Confetti = () => (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
        {[...Array(50)].map((_, i) => (
            <motion.div
                key={i}
                initial={{ y: -20, x: Math.random() * 100 + "%", rotate: 0, opacity: 1 }}
                animate={{ y: "100vh", rotate: 720, opacity: 0 }}
                transition={{ duration: 3 + Math.random() * 2, ease: "linear", repeat: Infinity, delay: Math.random() * 2 }}
                className="absolute w-3 h-3 rounded-full"
                style={{
                    backgroundColor: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F1C', '#9D4EDD'][i % 5],
                    left: `${Math.random() * 100}%`
                }}
            />
        ))}
    </div>
);

const BlastEffect = () => (
    <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
        {/* Flash */}
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-white z-50"
        />

        {/* Central Explosion */}
        {[...Array(20)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                    backgroundColor: ['#FFD700', '#FF69B4', '#00BFFF', '#32CD32'][i % 4],
                }}
                initial={{ x: 0, y: 0, scale: 0 }}
                animate={{
                    x: (Math.random() - 0.5) * 500,
                    y: (Math.random() - 0.5) * 500,
                    scale: [0, 1.5, 0],
                    opacity: [1, 1, 0]
                }}
                transition={{ duration: 1, ease: "easeOut" }}
            />
        ))}
    </div>
);

const Candle = ({ blown }: { blown: boolean }) => (
    <div className="relative flex flex-col items-center mx-1.5 md:mx-3">
        {/* Flame */}
        <AnimatePresence>
            {!blown && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.1, 0.9, 1.05], rotate: [-2, 2, -2] }}
                    exit={{ scale: 0, opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, repeat: Infinity, repeatType: "reverse" }}
                    className="w-3 h-5 md:w-5 md:h-8 bg-gradient-to-t from-orange-500 via-yellow-300 to-white rounded-full blur-[2px] shadow-[0_0_20px_rgba(255,200,0,0.8)] absolute -top-5 md:-top-8 origin-bottom z-20"
                />
            )}
        </AnimatePresence>
        {/* Wick */}
        <div className="w-0.5 h-1.5 md:h-2 bg-black/40 mb-[-1px]"></div>
        {/* Wax Body */}
        <div className="w-3 md:w-5 h-8 md:h-16 bg-gradient-to-b from-rose-300 to-rose-500 rounded-sm border border-rose-400/30 shadow-inner">
            <div className="w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:10px_10px]"></div>
        </div>
    </div>
);

export const BirthdayCakeViewer: React.FC<BirthdayCakeViewerProps> = ({
    content,
    minHeightClass = "min-h-[100dvh]",
    onSaveResponse,
    existingResponse,
    isOwner,
    isPreview = false
}) => {
    // Stage: 0=StartBtn, 1=Cake&Countdown, 2=Celebration
    const [stage, setStage] = useState<0 | 1 | 2>(0);
    const [countdown, setCountdown] = useState(5);
    const loopCountRef = useRef(0); // Tra

    // Audio
    const [isMuted, setIsMuted] = useState(false);
    const bgAudioRef = useRef<HTMLAudioElement | null>(null);
    const voiceAudioRef = useRef<HTMLAudioElement | null>(null);

    // Mic & Animation
    const micStreamRef = useRef<MediaStream | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Other State
    const [isPlayingVoice, setIsPlayingVoice] = useState(false);
    const [voiceProgress, setVoiceProgress] = useState(0);
    const [giftWants, setGiftWants] = useState('');
    const [giftDontWants, setGiftDontWants] = useState('');
    const [formSubmitted, setFormSubmitted] = useState(false);

    // --- CHANGE MUSIC HERE ---
    const BG_MUSIC = content.backgroundMusicUrl || "https://firebasestorage.googleapis.com/v0/b/global-bucket-for-devils-projects/o/scrollwish%2Fvideoplayback.m4a?alt=media&token=b5cdc46a-07fe-484b-8a2b-d6ff11bfbe51";
    const BLAST_SOUND = "https://firebasestorage.googleapis.com/v0/b/global-bucket-for-devils-projects/o/scrollwish%2Fblast-sound.mp3?alt=media&token=455e7bab-e5d9-4ffb-a864-946296ffab46"
    // Using a clear cake PNG
    const CAKE_IMAGE = "https://firebasestorage.googleapis.com/v0/b/global-bucket-for-devils-projects/o/scrollwish%2F1771403582834_pngwing.com-CXCXC.png?alt=media&token=47f290a5-918f-4078-b273-c6f399624a00";
    // const CARTOON_GIF = "https://media.giphy.com/media/l4FGlmpk9wyby1tdK/giphy.gif"; 

    useEffect(() => {
        // --- SETUP SEQUENTIAL AUDIO ---
        const introAudio = new Audio(BLAST_SOUND);
        const loopAudio = new Audio(BG_MUSIC);

        // Configure Loop Audio
        // loopAudio.loop = true;

        // Initial volumes
        introAudio.volume = 0.4;
        loopAudio.volume = 0.4;

        // Chain the sounds: When intro ends -> Play loop
        introAudio.addEventListener('ended', () => {
            // Copy state from intro to loop (in case user muted during intro)
            loopAudio.muted = introAudio.muted;
            loopAudio.volume = introAudio.volume;

            loopAudio.play().catch(e => console.log("Loop autoplay blocked", e));

            // CRITICAL: Update ref to point to the currently playing audio

            // Loop Logic: Play exactly 3 times
            loopAudio.addEventListener('ended', () => {
                loopCountRef.current += 1;
                if (loopCountRef.current < 3) {
                    loopAudio.currentTime = 0;
                    loopAudio.play().catch(e => console.log("Loop repeat blocked", e));
                }
            });
            bgAudioRef.current = loopAudio;
        });



        // Set the ref to the Intro initially, so handleStartClick/triggerCelebration plays the intro first
        bgAudioRef.current = introAudio;

        // --- VOICE NOTE SETUP ---
        if (content.audioMessageUrl) {

            voiceAudioRef.current = new Audio(content.audioMessageUrl);
            voiceAudioRef.current.addEventListener('timeupdate', () => {
                if (voiceAudioRef.current) {
                    setVoiceProgress((voiceAudioRef.current.currentTime / voiceAudioRef.current.duration) * 100);
                }
            });
            voiceAudioRef.current.addEventListener('ended', () => {
                setIsPlayingVoice(false);
                setVoiceProgress(0);
                // Return volume to normal on whichever track is active
                if (bgAudioRef.current) bgAudioRef.current.volume = 0.4;
            });
        }

        return () => {
            // Cleanup: Pause both potential tracks
            introAudio.pause();
            introAudio.src = "";
            loopAudio.pause();
            loopAudio.src = "";

            voiceAudioRef.current?.pause();
            stopMic();
        }
    }, [BG_MUSIC, BLAST_SOUND, content.audioMessageUrl]);



    const handleStartClick = () => {
        setStage(1);
        startMicDetection();

        // Start Countdown
        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    triggerCelebration(); // Auto trigger at 0 if not blown
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const triggerCelebration = () => {
        if (stage === 2) return;
        setStage(2);
        stopMic();
        bgAudioRef.current?.play().catch(e => console.log("Autoplay blocked", e));
    };

    const startMicDetection = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            micStreamRef.current = stream;
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyserRef.current = analyser;
            checkAudioLevel();
        } catch (e) {
            console.log("Mic access denied, waiting for countdown or tap");
        }
    };

    const stopMic = () => {
        if (micStreamRef.current) {
            micStreamRef.current.getTracks().forEach(track => track.stop());
            micStreamRef.current = null;
        }
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };

    const checkAudioLevel = () => {
        if (!analyserRef.current || stage === 2) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const average = sum / dataArray.length;

        if (average > 35) { // Sensitivity
            triggerCelebration();
        } else {
            animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
        }
    };

    const toggleVoiceNote = () => {
        if (!voiceAudioRef.current) return;
        if (isPlayingVoice) {
            voiceAudioRef.current.pause();
            if (bgAudioRef.current) bgAudioRef.current.volume = 0.4;
        } else {
            voiceAudioRef.current.play();
            if (bgAudioRef.current) bgAudioRef.current.volume = 0.1;
        }
        setIsPlayingVoice(!isPlayingVoice);
    };

    const handleFormSubmit = async () => {
        if (onSaveResponse) {
            await onSaveResponse({
                giftWants,
                giftDontWants,
                respondedAt: new Date().toISOString()
            });
        }
        setFormSubmitted(true);
    };

    const toggleMute = () => {
        if (bgAudioRef.current) {
            bgAudioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    // Determine background based on stage
    // Stage 1: Dark (Candle Blowing - needs contrast)
    // Stage 0 & 2: Bright (Start & Celebration)
    const containerClass = stage === 1
        ? "bg-slate-900 text-white transition-colors duration-1000"
        : "bg-[#FFF9F0] text-slate-800 transition-colors duration-1000";

    const heightClass = isPreview ? 'h-full' : 'h-[100dvh]';

    return (
        <div
            ref={containerRef}
            className={`w-full ${heightClass} overflow-y-scroll snap-y snap-mandatory scroll-smooth font-sans ${containerClass}`}
        >
            {/* Mute Button */}
            {stage === 2 && (
                <button
                    onClick={toggleMute}
                    className="fixed top-4 right-4 z-50 p-3 bg-white/80 backdrop-blur-md rounded-full shadow-md hover:bg-white text-slate-800 transition-colors"
                >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
            )}

            {/* --- HERO SECTION (INTERACTIVE) --- */}
            <section className={`w-full ${minHeightClass} snap-start flex flex-col items-center justify-center p-6 relative overflow-hidden text-center`}>

                {/* Background Stars (Visible in Stage 1 only) */}
                {stage === 1 && (
                    <div className="absolute inset-0 pointer-events-none">
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute bg-white rounded-full opacity-50"
                                initial={{ opacity: 0.2, scale: 0.5 }}
                                animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.5, 1, 0.5] }}
                                transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
                                style={{
                                    width: Math.random() * 3 + 'px',
                                    height: Math.random() * 3 + 'px',
                                    top: Math.random() * 100 + '%',
                                    left: Math.random() * 100 + '%'
                                }}
                            />
                        ))}
                    </div>
                )}

                <AnimatePresence mode='wait'>

                    {/* STAGE 0: START BUTTON (BRIGHT MODE) */}
                    {stage === 0 && (
                        <motion.div
                            key="start"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center z-10"
                        >
                            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                                {/* 1. Top Left - Fireworks */}
                                <img
                                    src="https://firebasestorage.googleapis.com/v0/b/global-bucket-for-devils-projects/o/scrollwish%2F1771409014793_fireworks.png?alt=media&token=5cd00c88-050f-45bb-89f8-9ccd4dafc1eb"
                                    className="absolute top-[5%] left-[5%] w-12 opacity-20"
                                    alt="decor"
                                />
                                {/* 2. Top Right - Popper */}
                                <img
                                    src="https://cdn-icons-png.flaticon.com/512/4213/4213958.png"
                                    className="absolute top-[10%] right-[10%] w-10 opacity-20 rotate-12"
                                    alt="decor"
                                />
                                {/* 3. Upper Middle Left - Gift */}
                                <img
                                    src="https://cdn-icons-png.flaticon.com/512/4530/4530462.png"
                                    className="absolute top-[25%] left-[15%] w-8 opacity-20 -rotate-12"
                                    alt="decor"
                                />
                                {/* 4. Upper Middle Right - Ribbon */}
                                <img
                                    src="https://firebasestorage.googleapis.com/v0/b/global-bucket-for-devils-projects/o/scrollwish%2F1771409018466_celebration%20(1).png?alt=media&token=e628a2f8-4ebc-4a16-8f1d-70f303568e4f"
                                    className="absolute top-[20%] right-[20%] w-12 opacity-20 rotate-45"
                                    alt="decor"
                                />
                                {/* 5. Center Left - Confetti */}
                                <img
                                    src="https://firebasestorage.googleapis.com/v0/b/global-bucket-for-devils-projects/o/scrollwish%2F1771408806350_celebration.png?alt=media&token=c23589ae-e4b3-4bf3-8abd-8f707c245271"
                                    className="absolute top-[50%] left-[-5%] w-14 opacity-20"
                                    alt="decor"
                                />
                                {/* 6. Center Right - Fireworks */}
                                <img
                                    src="https://firebasestorage.googleapis.com/v0/b/global-bucket-for-devils-projects/o/scrollwish%2F1771409014793_fireworks.png?alt=media&token=5cd00c88-050f-45bb-89f8-9ccd4dafc1eb"
                                    className="absolute top-[50%] right-[5%] w-12 opacity-20"
                                    alt="decor"
                                />
                                {/* 7. Lower Left - Popper Flipped */}
                                <img
                                    src="https://cdn-icons-png.flaticon.com/512/4213/4213958.png"
                                    className="absolute top-[70%] left-[10%] w-10 opacity-20 -rotate-45 scale-x-[-1]"
                                    alt="decor"
                                />
                                {/* 8. Lower Right - Gift */}
                                <img
                                    src="https://cdn-icons-png.flaticon.com/512/4530/4530462.png"
                                    className="absolute top-[75%] right-[15%] w-9 opacity-20 rotate-12"
                                    alt="decor"
                                />
                                {/* 9. Bottom Center - Ribbon */}
                                <img
                                    src="https://firebasestorage.googleapis.com/v0/b/global-bucket-for-devils-projects/o/scrollwish%2F1771409018466_celebration%20(1).png?alt=media&token=e628a2f8-4ebc-4a16-8f1d-70f303568e4f"
                                    className="absolute bottom-[5%] left-[40%] w-12 opacity-20 rotate-90"
                                    alt="decor"
                                />
                            </div>

                            <div className="relative">
                                {/* Logo removed, only Gift icon */}
                                <Gift size={80} className="text-rose-500 animate-bounce drop-shadow-xl w-16 h-16 md:w-20 md:h-20" />
                            </div>

                            <div className="relative z-10">
                                <h1 className="text-3xl md:text-5xl font-handwriting text-slate-800 mb-2 tracking-wide drop-shadow-sm px-4">
                                    There is a surprise for you!
                                </h1>
                                <p className="text-gray-500 text-sm md:text-base">Click below & turn up volume 🔊</p>
                            </div>

                            <Button
                                onClick={handleStartClick}
                                size="lg"
                                className="bg-rose-500 hover:bg-rose-600 text-white shadow-xl shadow-rose-200 px-8 py-3 md:px-10 md:py-4 text-base md:text-lg rounded-full"
                            >
                                Click Here <Play size={20} className="ml-2 fill-current" />
                            </Button>
                        </motion.div>
                    )}

                    {/* STAGE 1: CAKE & COUNTDOWN (DARK MODE) */}
                    {stage === 1 && (
                        <motion.div
                            key="countdown"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 1.5 }}
                            className="z-10 w-full flex flex-col items-center justify-center gap-6 md:gap-8"
                        >
                            <div className="text-center space-y-2">
                                <h2 className="text-3xl md:text-5xl font-bold text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)] font-serif">
                                    {countdown}
                                </h2>
                                <p className="text-gray-300 uppercase tracking-widest text-xs md:text-sm">Blow out the candles!</p>
                            </div>

                            <div className="pt-8" >
                                <div className="relative cursor-pointer flex flex-col items-center" onClick={triggerCelebration}>
                                    {/* Candles - Positioned to look attached to cake */}
                                    <div className="absolute -top-[8%] flex items-end justify-center z-20">
                                        <Candle blown={false} />
                                        <Candle blown={false} />
                                        <Candle blown={false} />
                                    </div>
                                    {/* Cake Image - Responsive */}
                                    <img
                                        src={CAKE_IMAGE}
                                        alt="Cake"
                                        className="w-[60vw] max-w-[280px] md:max-w-[360px] h-auto object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                                    />
                                </div>
                            </div>


                            <div className="flex items-center gap-2 text-rose-300 text-xs md:text-sm bg-white/10 px-4 py-2 md:px-6 md:py-2 rounded-full backdrop-blur-md border border-white/10">
                                <Mic size={16} className="animate-pulse" />
                                Blow air into mic or tap the cake
                            </div>
                        </motion.div>
                    )}

                    {/* STAGE 2: CELEBRATION (BRIGHT MODE) */}
                    {stage === 2 && (
                        <motion.div
                            key="celebration"
                            className="z-10 w-full flex flex-col items-center justify-center gap-4 md:gap-6 px-4"
                        >
                            <BlastEffect />
                            <Confetti />

                            <div className="text-center space-y-1 md:space-y-2">
                                <motion.h1
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: 'spring', bounce: 0.5, duration: 1 }}
                                    className="text-5xl md:text-7xl font-handwriting text-rose-500 drop-shadow-sm"
                                >
                                    Happy Birthday
                                </motion.h1>
                                <motion.h2
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-2xl md:text-5xl font-serif font-bold text-slate-800"
                                >
                                    {content.recipientName}
                                </motion.h2>
                            </div>

                            {/* Round Photo - Responsive */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.8, type: "spring" }}
                                className="w-[40vw] h-[40vw] max-w-[180px] max-h-[180px] rounded-full border-[6px] md:border-8 border-white shadow-2xl overflow-hidden bg-gray-100 relative z-20 mx-auto"
                            >
                                <img src={content.images[0] || "https://api.dicebear.com/7.x/avataaars/svg?seed=bday"} className="w-full h-full object-cover" alt="Birthday Person" />
                            </motion.div>

                            {/* Cartoon Musicians */}
                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 1.2 }}
                            >
                                <img src={CARTOON_GIF} alt="Party" className="h-24 md:h-40 object-contain mix-blend-multiply" />

                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 2 }}
                                className="animate-bounce text-purple-500 mt-2 md:mt-4"
                            >
                                <p className="text-[10px] md:text-xs uppercase tracking-widest mb-1">Scroll Down</p>
                                <ArrowDown className="mx-auto" />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {/* --- MESSAGE SECTION --- */}
            <section className={`w-full ${minHeightClass} snap-start flex flex-col items-center justify-center p-8 bg-white relative`}>
                <div className="max-w-2xl text-center relative z-10 w-full">
                    <Sparkles className="absolute -top-10 -left-10 text-yellow-300 w-16 h-16 opacity-50 animate-pulse" />
                    <Sparkles className="absolute -bottom-10 -right-10 text-rose-300 w-16 h-16 opacity-50 animate-pulse" />

                    <h3 className="font-handwriting text-4xl text-rose-500 mb-8">From {content.senderName}</h3>
                    <div className="relative p-8 md:p-10 bg-gradient-to-br from-rose-50 to-purple-50 rounded-[2rem] md:rounded-[3rem] border border-rose-100 shadow-lg">
                        <p className="font-serif text-lg md:text-2xl text-slate-700 leading-relaxed whitespace-pre-wrap italic break-words">
                            "{content.message}"
                        </p>
                    </div>
                </div>
            </section>

            {/* --- VOICE NOTE --- */}
            {content.audioMessageUrl && (
                <section className={`w-full ${minHeightClass} snap-start flex flex-col items-center justify-center p-8 bg-gradient-to-b from-purple-50 to-white`}>
                    <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl max-w-md w-full text-center border border-purple-100">
                        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-600 shadow-inner">
                            <Music size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Voice Message</h3>
                        <p className="text-gray-500 mb-8">Recorded with love 🎤</p>

                        <div className="relative h-3 bg-gray-100 rounded-full mb-10 overflow-hidden">
                            <motion.div
                                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-purple-500 to-pink-500"
                                style={{ width: `${voiceProgress}%` }}
                            />
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={toggleVoiceNote}
                                className="w-24 h-24 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-full flex items-center justify-center shadow-lg hover:scale-105 hover:shadow-purple-500/30 transition-all text-white"
                            >
                                {isPlayingVoice ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* --- WISHLIST --- */}
            <section className={`w-full ${minHeightClass} snap-start flex flex-col items-center justify-center p-8 bg-[#FFF9F0]`}>
                <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-[2rem] shadow-xl border border-orange-100">
                    {!isOwner && existingResponse ? (
                        <div className="text-center py-8">
                            <CheckCircle2 size={64} className="mx-auto text-green-500 mb-6" />
                            <h3 className="text-2xl font-bold text-slate-800">Wishes Sent!</h3>
                            <p className="text-gray-500 mt-2">{content.senderName} has received your list.</p>
                        </div>
                    ) : formSubmitted ? (
                        <div className="text-center py-8">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                <PartyPopper size={64} className="mx-auto text-rose-500 mb-6" />
                            </motion.div>
                            <h3 className="text-2xl font-bold text-slate-800">Sent!</h3>
                            <p className="text-gray-500 mt-2">Fingers crossed for great gifts! 🎁</p>
                        </div>
                    ) : (
                        <>
                            <h3 className="text-3xl font-handwriting text-slate-800 mb-8 text-center text-rose-500">Make a Wish ✨</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                        <ThumbsUp size={18} className="text-green-500" /> What do you want?
                                    </label>
                                    <textarea
                                        className="w-full p-4 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all bg-gray-50 text-base"
                                        rows={3}
                                        placeholder="Books, Gadgets, Experiences..."
                                        value={giftWants}
                                        onChange={(e) => setGiftWants(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                        <ThumbsDown size={18} className="text-red-500" /> What to avoid?
                                    </label>
                                    <textarea
                                        className="w-full p-4 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all bg-gray-50 text-base"
                                        rows={2}
                                        placeholder="Socks, Mugs..."
                                        value={giftDontWants}
                                        onChange={(e) => setGiftDontWants(e.target.value)}
                                    />
                                </div>
                                <Button onClick={handleFormSubmit} className="w-full py-4 text-lg shadow-lg bg-slate-800 hover:bg-slate-900 text-white">Send Wishlist</Button>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* --- OUTRO --- */}
            <section className={`w-full ${minHeightClass} snap-start flex flex-col items-center justify-center p-8 bg-slate-900 text-white text-center`}>
                <Sparkles size={64} className="text-yellow-400 mb-8 animate-pulse" />
                <h2 className="text-5xl md:text-6xl font-handwriting mb-6">Have a Blast!</h2>
                <p className="text-gray-400 mb-10 text-lg">Celebrating you today and always.</p>
                <div className="flex gap-4">
                    <Button variant="secondary" onClick={() => {
                        const firstSection = document.body;
                        firstSection?.scrollIntoView({ behavior: 'smooth' });
                    }}>
                        Replay Card
                    </Button>
                </div>
            </section>
        </div>
    );
};
