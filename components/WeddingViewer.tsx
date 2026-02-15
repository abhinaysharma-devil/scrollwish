
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CardContent } from '../types';
import { MapPin, Heart, Calendar, Clock, Navigation, Sparkles } from 'lucide-react';
import { Button } from './Button';

interface WeddingViewerProps {
    content: CardContent;
    minHeightClass?: string;
}

// --- Decorative Components ---

const FallingPetals = () => {
    const petals = Array.from({ length: 15 });
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {petals.map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute text-rose-300/40"
                    initial={{ y: -20, x: Math.random() * 100 + "%", rotate: 0, opacity: 0 }}
                    animate={{ 
                        y: ["0vh", "100vh"], 
                        x: [0, (Math.random() - 0.5) * 50],
                        rotate: 360, 
                        opacity: [0, 1, 0] 
                    }}
                    transition={{ 
                        duration: 5 + Math.random() * 5, 
                        repeat: Infinity, 
                        delay: Math.random() * 5,
                        ease: "linear"
                    }}
                >
                    <span style={{ fontSize: Math.random() * 20 + 10 + "px" }}>🌸</span>
                </motion.div>
            ))}
        </div>
    );
};

const MandalaBg = () => (
    <motion.div 
        className="absolute top-[-20%] right-[-20%] w-[60%] opacity-10 pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
    >
        <img src="https://firebasestorage.googleapis.com/v0/b/global-bucket-for-devils-projects/o/scrollwish%2F1771177167584_IMG_2931.png?alt=media&token=3015a971-7259-4eee-9aca-bb925fe63a22" alt="Mandala" className="w-full h-full object-contain" />
    </motion.div>
);

const FloralCorner = ({ position }: { position: string }) => (
    <div className={`absolute ${position} w-32 md:w-48 opacity-80 pointer-events-none z-10`}>
        <img 
            src="https://www.pngall.com/wp-content/uploads/2016/07/Golden-Frame-Border-PNG-File.png" 
            className={`w-full h-full object-contain ${position.includes('bottom') ? 'rotate-180' : ''}`} 
            alt="Decoration"
        />
    </div>
);

// Countdown Hook
const useCountdown = (targetDate: string, targetTime: string) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        // Safe parsing for date string
        const target = new Date(`${targetDate}T${targetTime || '00:00'}:00`);
        
        const calculateTimeLeft = () => {
            const now = new Date();
            const difference = target.getTime() - now.getTime();

            if (difference > 0) {
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                };
            }
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate, targetTime]);

    return timeLeft;
};

export const WeddingViewer: React.FC<WeddingViewerProps> = ({ content, minHeightClass = "min-h-[100dvh]" }) => {
    
    const brideName = content.recipientName || "Bride";
    const groomName = content.senderName || "Groom";
    const date = content.weddingDate || "2024-12-31";
    const time = content.weddingTime || "07:00";
    const venue = content.venueName || "Grand Palace Hotel";
    const address = content.venueAddress || "123, Celebration Road, City";
    const mapUrl = content.venueMapUrl || "https://maps.google.com";
    const note = content.invitationNote || "You are always in our hearts, and we warmly invite you to celebrate with us.";

    // Image logic: Index 0 is Groom, Index 1 is Bride. Fallback to placeholders.
    const groomImg = content.images?.[0] || "https://firebasestorage.googleapis.com/v0/b/global-bucket-for-devils-projects/o/scrollwish%2F1771175501040_Screenshot%202026-02-15%20224016.png?alt=media&token=b7194371-8f43-40db-91d9-3be9a4f71f4c";
    const brideImg = content.images?.[1] || "https://firebasestorage.googleapis.com/v0/b/global-bucket-for-devils-projects/o/scrollwish%2F1771175510496_Screenshot%202026-02-15%20224120.png?alt=media&token=2aa96c29-417e-48fd-bbaa-2eea28437bc2";

    // SECTION 1: INTRO (GATHBANDHAN ANIMATION)
    const IntroSection = () => (
        <section className={`${minHeightClass} snap-start flex flex-col items-center justify-center p-4 md:p-8 bg-[#fff5e6] relative overflow-hidden`}>
            <FallingPetals />
            
            {/* Traditional Top Decoration (Toran) */}
             <div className="absolute top-0">
                 <img 
                    src="https://firebasestorage.googleapis.com/v0/b/global-bucket-for-devils-projects/o/scrollwish%2F1771176664614_diwali-flower-toran-decoration-vector-44163115-removebg-preview.png?alt=media&token=64a32950-fe91-4b1b-a259-f5224c117f89" 
                    className="w-full h-24 md:h-36 object-cover object-top drop-shadow-md" 
                    alt="Toran" 
                 />
            </div>

            <MandalaBg />
            
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="z-10 text-center mb-6 mt-16 md:mt-20 relative"
            >
                <div className="w-16 md:w-24 h-1 bg-[#d4af37] mx-auto mb-2 md:mb-4 rounded-full"></div>
                <h3 className="font-serif text-[#d4af37] text-xl md:text-3xl uppercase tracking-[0.2em] font-bold drop-shadow-sm">
                    Shubh Vivah
                </h3>
                 <p className="text-gray-500 text-xs md:text-sm mt-1 font-medium tracking-wide">WE INVITE YOU TO CELEBRATE</p>
            </motion.div>

            <div className="relative flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 w-full max-w-6xl z-10">
                
                {/* Groom Side */}
                <motion.div 
                    initial={{ x: -50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="flex flex-col items-center relative z-20 order-1"
                >
                    <div className="relative group">
                         <div className="absolute inset-0 bg-[#ff9933] rounded-full blur-md opacity-40 group-hover:opacity-60 transition-opacity"></div>
                         <div className="w-40 h-40 md:w-72 md:h-72 rounded-full border-[4px] md:border-[6px] border-[#ff9933] shadow-2xl overflow-hidden relative bg-white p-1">
                              <img src={groomImg} alt="Groom" className="w-full h-full object-cover rounded-full" />
                         </div>
                    </div>
                    <div className="mt-4 md:mt-6 bg-[#fff0e0] px-6 py-1.5 md:px-8 md:py-2 rounded-full border border-[#ff9933] shadow-md transform -rotate-1">
                        <h2 className="font-serif text-xl md:text-4xl text-[#8b4513] font-bold">{groomName}</h2>
                    </div>
                </motion.div>

                {/* Central Connection (Gathbandhan) */}
                <div className="relative h-24 md:h-32 w-full md:w-80 flex items-center justify-center order-2 md:order-2 my-1 md:my-0">
                    
                    {/* Left Sash (Groom - Cloth Texture) */}
                    <motion.div 
                        initial={{ scaleX: 0, opacity: 0 }}
                        whileInView={{ scaleX: 1, opacity: 1 }}
                        transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                        className="absolute left-0 top-1/2 h-16 md:h-20 w-[60%] bg-[url('https://www.transparenttextures.com/patterns/sativa.png')] bg-[#ff9933] origin-left z-0 hidden md:block shadow-lg"
                        style={{
                            transform: 'translateY(-50%)',
                            clipPath: 'polygon(0% 10%, 100% 35%, 100% 65%, 0% 90%)', // Tapered cloth look
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10"></div>
                    </motion.div>
                    
                    {/* Right Sash (Bride - Cloth Texture) */}
                    <motion.div 
                        initial={{ scaleX: 0, opacity: 0 }}
                        whileInView={{ scaleX: 1, opacity: 1 }}
                        transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                        className="absolute right-0 top-1/2 h-16 md:h-20 w-[60%] bg-[url('https://www.transparenttextures.com/patterns/sativa.png')] bg-[#e11d48] origin-right z-0 hidden md:block shadow-lg"
                        style={{
                            transform: 'translateY(-50%)',
                            clipPath: 'polygon(0% 35%, 100% 10%, 100% 90%, 0% 65%)', // Tapered cloth look
                        }}
                    >
                         <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/10"></div>
                    </motion.div>

                    {/* Mobile Vertical Line */}
                     <motion.div 
                         initial={{ height: 0 }}
                         whileInView={{ height: "100%" }}
                         transition={{ duration: 1, delay: 0.5 }}
                         className="absolute top-1/2 left-1/2 w-1 h-full bg-gradient-to-b from-[#ff9933] to-[#e11d48] -translate-x-1/2 -translate-y-1/2 md:hidden rounded-full opacity-60"
                    />

                    {/* The "Knot" Image + Weds Text */}
                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.8, delay: 1.8, type: "spring", bounce: 0.4 }}
                        className="relative z-10 flex flex-col items-center justify-center"
                    >
                        {/* Knot Image */}
                        <img 
                            src="https://firebasestorage.googleapis.com/v0/b/global-bucket-for-devils-projects/o/scrollwish%2F1771177389499_Screenshot_2026-02-15_231156-removebg-preview.png?alt=media&token=3ea533db-9580-448d-9c6a-1ce08d7cf79b" 
                            alt="Gathbandhan Knot" 
                            className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-xl filter contrast-125"
                        />
                        <div className="absolute top-[60%] bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md border border-[#d4af37]">
                             <span className="font-handwriting text-xl text-[#d4af37] font-bold leading-none">Weds</span>
                        </div>
                    </motion.div>
                </div>

                {/* Bride Side */}
                <motion.div 
                    initial={{ x: 50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="flex flex-col items-center relative z-20 order-3"
                >
                    <div className="relative group">
                        <div className="absolute inset-0 bg-[#e11d48] rounded-full blur-md opacity-40 group-hover:opacity-60 transition-opacity"></div>
                        <div className="w-40 h-40 md:w-72 md:h-72 rounded-full border-[4px] md:border-[6px] border-[#e11d48] shadow-2xl overflow-hidden relative bg-white p-1">
                             <img src={brideImg} alt="Bride" className="w-full h-full object-cover rounded-full" />
                        </div>
                    </div>
                     <div className="mt-4 md:mt-6 bg-[#fff0f3] px-6 py-1.5 md:px-8 md:py-2 rounded-full border border-[#e11d48] shadow-md transform rotate-1">
                        <h2 className="font-serif text-xl md:text-4xl text-[#8b4513] font-bold">{brideName}</h2>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Decor */}
            <div className="absolute bottom-6 md:bottom-10 animate-bounce text-[#d4af37]">
                <p className="text-[10px] md:text-xs uppercase tracking-widest mb-1 text-center">Scroll to Bless</p>
                <div className="w-px h-6 md:h-8 bg-[#d4af37] mx-auto"></div>
            </div>
        </section>
    );

    // SECTION 2: SAVE THE DATE
    const DateSection = () => {
        const timeLeft = useCountdown(date, time);

        return (
            <section className={`${minHeightClass} snap-start flex flex-col items-center justify-center p-8 bg-white relative overflow-hidden`}>
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-50"></div>
                
                <FloralCorner position="top-left" />
                <FloralCorner position="bottom-right" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-xl w-full text-center relative z-10 border-y-4 border-double border-[#d4af37] py-12 px-6 bg-[#fffef0]/90 shadow-xl"
                >
                    <h2 className="font-serif text-4xl md:text-5xl text-gray-800 mb-8 tracking-wide">Save The Date</h2>
                    
                    <div className="flex flex-col gap-8 text-gray-700">
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="flex flex-col items-center justify-center gap-2 p-6 bg-white border border-[#d4af37]/30 rounded-full w-64 h-64 mx-auto shadow-inner"
                        >
                            <Calendar className="text-[#d4af37] w-8 h-8 mb-2" />
                            <span className="text-sm uppercase tracking-widest text-gray-500">On</span>
                            <span className="font-serif text-3xl font-bold text-[#d4af37]">
                                {new Date(date).getDate()}
                            </span>
                            <span className="font-serif text-xl uppercase">
                                {new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                            <span className="text-sm text-gray-400">
                                {new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}
                            </span>
                        </motion.div>

                        <div className="flex items-center justify-center gap-3 text-xl bg-[#d4af37] text-white py-2 px-6 rounded-full mx-auto shadow-lg mb-4">
                            <Clock size={20} />
                            <span className="font-medium tracking-wide">{time} Onwards</span>
                        </div>

                        {/* Reverse Timer */}
                        <div className="grid grid-cols-4 gap-2 md:gap-4 text-center border-t border-gray-200 pt-6">
                            {[
                                { label: 'Days', value: timeLeft.days },
                                { label: 'Hours', value: timeLeft.hours },
                                { label: 'Mins', value: timeLeft.minutes },
                                { label: 'Secs', value: timeLeft.seconds }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white border border-[#d4af37]/20 p-2 rounded-lg shadow-sm">
                                    <span className="block text-xl md:text-2xl font-bold text-[#d4af37] font-serif">{item.value}</span>
                                    <span className="text-[10px] md:text-xs uppercase text-gray-500 tracking-wider">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </section>
        );
    };

    // SECTION 3: VENUE
    const VenueSection = () => (
        <section className={`${minHeightClass} snap-start flex flex-col items-center justify-center p-8 bg-slate-900 text-white relative overflow-hidden`}>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
            
            {/* Animated Golden Rings Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <div className="w-[500px] h-[500px] border border-[#d4af37] rounded-full animate-ping [animation-duration:3s]"></div>
                <div className="w-[400px] h-[400px] border border-[#d4af37] rounded-full animate-ping [animation-duration:3s] [animation-delay:1s] absolute"></div>
            </div>

            <motion.div 
                className="z-10 text-center max-w-2xl bg-black/40 backdrop-blur-sm p-10 rounded-3xl border border-[#d4af37]/50 shadow-[0_0_50px_rgba(212,175,55,0.2)]"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <div className="w-20 h-20 bg-[#d4af37] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#d4af37]/40">
                    <MapPin size={40} className="text-white" />
                </div>
                <h2 className="text-4xl font-serif mb-2 text-[#d4af37]">The Royal Venue</h2>
                <div className="w-24 h-1 bg-[#d4af37] mx-auto mb-6"></div>
                
                <h3 className="text-2xl font-bold mb-2 tracking-wide">{venue}</h3>
                <p className="text-gray-300 text-lg mb-8 leading-relaxed font-light">{address}</p>
                
                <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="inline-block group">
                    <Button className="bg-[#d4af37] hover:bg-[#c5a028] text-white border-none px-8 py-4 text-lg shadow-lg shadow-yellow-500/20 flex items-center gap-3 transition-transform group-hover:scale-105">
                        <Navigation size={20} className="animate-bounce" /> Navigate to Venue
                    </Button>
                </a>
            </motion.div>
        </section>
    );

    // SECTION 4: ENDING
    const EndingSection = () => (
        <section className={`${minHeightClass} snap-start flex flex-col items-center justify-center p-8 bg-[#fdf6e3] text-center relative`}>
            <FallingPetals />
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1 }}
                className="max-w-2xl z-10"
            >
                <div className="text-[#d4af37] mb-6 flex justify-center">
                    <Heart size={48} fill="currentColor" className="animate-pulse" />
                </div>
                
                <p className="font-handwriting text-4xl md:text-6xl text-gray-800 leading-relaxed mb-8 drop-shadow-sm">
                    "{note}"
                </p>
                
                <div className="w-full flex items-center justify-center gap-4 opacity-60">
                    <div className="h-px w-20 bg-[#d4af37]"></div>
                    <div className="w-3 h-3 rotate-45 bg-[#d4af37]"></div>
                    <div className="h-px w-20 bg-[#d4af37]"></div>
                </div>

                <div className="mt-12">
                    <p className="font-serif text-gray-500 uppercase tracking-[0.3em] text-sm mb-2">With Love & Gratitude</p>
                    <p className="font-bold text-2xl text-[#d4af37]">{groomName} & {brideName}</p>
                </div>
            </motion.div>
        </section>
    );

    return (
        <div className="relative w-full h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth bg-gray-50">
            <IntroSection />
            <DateSection />
            <VenueSection />
            <EndingSection />
        </div>
    );
};
