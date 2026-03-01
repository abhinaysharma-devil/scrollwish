import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useSpring, AnimatePresence, useInView } from 'framer-motion';
import { CardContent } from '../types';
import { Heart, ArrowUp, Search, Mail, X, Star, Flame } from 'lucide-react';

interface MySunflowerViewerProps {
    content: CardContent;
    minHeightClass?: string;
    isPreview?: boolean;
}

// --- Sub-Components ---

const HeartPuzzle = ({ onComplete }: { onComplete: () => void }) => {
    const [isSolved, setIsSolved] = useState(false);
    const constraintsRef = useRef(null);

    return (
        <div className="relative w-full max-w-md h-96 flex flex-col items-center justify-center" ref={constraintsRef}>
            {/* Base Heart with Hole */}
            <div className="relative w-96 h-96">
                <img
                    src="https://firebasestorage.googleapis.com/v0/b/global-bucket-for-devils-projects/o/scrollwish%2F1772276110675_IMG_2983.png?alt=media&token=0ec8e2b1-b630-4c7a-a879-d282ae19852c"
                    alt="Heart Puzzle Base"
                    className="w-full h-full object-contain pointer-events-none select-none"
                />

                {/* Drop Zone Indicator (Optional, subtle hint) */}
                {!isSolved && (
                    <div className="absolute top-[30%] left-[55%] w-16 h-16 border-2 border-dashed border-rose-300/50 rounded-full animate-pulse pointer-events-none" />
                )}
            </div>

            {/* Draggable Piece */}
            {!isSolved && (
                <motion.div
                    drag
                    dragConstraints={constraintsRef}
                    dragElastic={0.2}
                    dragSnapToOrigin={true}
                    onDragEnd={(event, info) => {
                        // Check if dropped near the hole (approximate coordinates)
                        if (info.offset.y < -50 && Math.abs(info.offset.x) < 100) {
                            setIsSolved(true);
                            onComplete();
                        }
                    }}
                    className="absolute bottom-0 cursor-grab active:cursor-grabbing z-20"
                >
                    <div className="w-24 h-24 filter drop-shadow-lg">
                        <img
                            src="https://firebasestorage.googleapis.com/v0/b/global-bucket-for-devils-projects/o/scrollwish%2F1772276115686_IMG_2982.png?alt=media&token=049e63fd-de5b-4dcb-8f5d-7c03b3546898"
                            alt="Puzzle Piece"
                            className="w-[74%] h-[79%] object-contain pointer-events-none select-none"
                        />
                    </div>
                    <div className="text-xs text-rose-400 font-medium bg-white/80 rounded-full shadow-sm text-center">
                        Drag me to the heart!
                    </div>
                </motion.div>
            )}

            {/* Solved State - The Piece in Place */}
            {isSolved && (
                <motion.div
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-[38%] left-[46%] w-24 h-24 z-10"
                >
                    <img
                        src="https://firebasestorage.googleapis.com/v0/b/global-bucket-for-devils-projects/o/scrollwish%2F1772276115686_IMG_2982.png?alt=media&token=049e63fd-de5b-4dcb-8f5d-7c03b3546898"
                        alt="Puzzle Piece Solved"
                        className="w-[77%] h-[77%] object-contain"
                    />

                </motion.div>

            )}
        </div>
    );
};

const GoogleSearch = ({ recipientName }) => (
    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 md:pt-10 md:pb-12 md:pl-5 md:pr-5 border border-gray-100">
        <div className="flex justify-center mb-8">
            <img
                src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png"
                alt="Google"
                className="h-12 md:h-16 object-contain"
            />
        </div>
        <div className="relative mb-8 ">
            <div className="w-full h-12 md:h-14 rounded-full border border-gray-200 shadow-sm flex items-center px-6 hover:shadow-md transition-shadow">
                <Search className="text-gray-400 mr-4" />
                <span className="text-gray-800 font-medium typing-effect truncate">
                    Who is my love life?
                </span>
            </div>
        </div>
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center"
        >
            <p className="text-lg md:text-1xl text-left text-gray-600">
                So <span className="font-bold">{recipientName}</span> is the one you love, and {recipientName} is all you were looking for.
            </p>
        </motion.div>
    </div>
);

const MailModal = ({ message, onClose }: { message: string, onClose: () => void }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
        <motion.div
            initial={{ scale: 0.5, y: 100, rotateX: 90 }}
            animate={{ scale: 1, y: 0, rotateX: 0 }}
            exit={{ scale: 0.5, y: 100, opacity: 0 }}
            className="bg-[#fffef0] w-full max-w-lg p-8 rounded-xl shadow-2xl relative border-4 border-double border-amber-200"
        >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <X size={24} />
            </button>
            <div className="text-center">
                <Mail size={48} className="mx-auto text-amber-500 mb-4" />
                <h3 className="text-2xl font-handwriting text-amber-800 mb-6 border-b border-amber-200 pb-2">A Message For You</h3>
                <p className="text-lg font-serif text-slate-700 whitespace-pre-wrap leading-relaxed">
                    "{message}"
                </p>
            </div>
        </motion.div>
    </motion.div>
);

// const BombEffect = ({ onExplode }: { onExplode: () => void }) => {
//     const [isExploded, setIsExploded] = useState(false);
//     const [wickHeight, setWickHeight] = useState(100);

//     useEffect(() => {
//         if (isExploded) return;

//         const timer = setInterval(() => {
//             setWickHeight(prev => {
//                 const newValue = prev - 1;
//                 return newValue < 0 ? 0 : newValue;
//             });
//         }, 50);

//         return () => clearInterval(timer);
//     }, [isExploded]);

//     useEffect(() => {
//         if (wickHeight === 0 && !isExploded) {
//             setIsExploded(true);
//             onExplode();
//         }
//     }, [wickHeight, isExploded, onExplode]);

//     return (
//         <div className="relative flex flex-col items-center">
//             {!isExploded ? (
//                 <div className="relative">
//                     {/* Wick */}
//                     <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-1 h-16 bg-gray-400 origin-bottom">
//                         <motion.div
//                             className="w-full bg-transparent"
//                             style={{ height: `${100 - wickHeight}%` }}
//                         />
//                         <motion.div
//                             className="absolute w-4 h-4 bg-orange-500 rounded-full blur-sm animate-pulse"
//                             style={{ top: `${100 - wickHeight}%`, left: '-6px' }}
//                         >
//                             <Flame size={16} className="text-yellow-300 fill-yellow-300" />
//                         </motion.div>
//                     </div>
//                     {/* Bomb Body */}
//                     <div className="w-32 h-32 bg-black rounded-full shadow-xl flex items-center justify-center relative z-10">
//                         <div className="w-8 h-4 bg-gray-600 absolute -top-2 rounded-sm" />
//                         <span className="text-4xl">💣</span>
//                     </div>
//                     <p className="mt-8 text-red-500 font-mono font-bold animate-pulse">Wait for it...</p>
//                 </div>
//             ) : (
//                 <motion.div
//                     initial={{ scale: 0 }}
//                     animate={{ scale: [0, 2, 0], opacity: [1, 1, 0] }}
//                     className="absolute inset-0 flex items-center justify-center pointer-events-none"
//                 >
//                     <div className="text-9xl">💥</div>
//                 </motion.div>
//             )}
//         </div>
//     );
// };


const BombEffect = ({ onExplode }: { onExplode: () => void }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });

    useEffect(() => {
        if (isInView) {
            const timer = setTimeout(() => {
                onExplode();
            }, 2800);

            return () => clearInterval(timer);
        }
    }, [isInView, onExplode]);

    return (
        <div ref={ref} className="relative flex flex-col items-center">
            <img src="https://firebasestorage.googleapis.com/v0/b/global-bucket-for-devils-projects/o/scrollwish%2Fhearts-heart.gif?alt=media&token=30822bc0-77f1-4b1a-a05f-9afc9750607f" alt="bomb-blast" />
        </div>
    );
};

export const MySunflowerEditor: React.FC<{
    content: CardContent;
    setContent: (content: CardContent) => void;
    uploading: boolean;
    handleImageReplace: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
    activeTab: 'text' | 'media';
}> = ({ content, setContent, uploading, handleImageReplace, activeTab }) => {
    if (activeTab === 'text') {
        return (
            <>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mail Message (Hidden)</label>
                    <textarea
                        rows={4}
                        value={content.message}
                        onChange={(e) => setContent({ ...content, message: e.target.value })}
                        placeholder="Message inside the mail..."
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-200 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bomb Message (Explosion)</label>
                    <textarea
                        rows={2}
                        value={content.shayari}
                        onChange={(e) => setContent({ ...content, shayari: e.target.value })}
                        placeholder="Message after bomb blast..."
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-200 outline-none"
                    />
                </div>
            </>
        );
    }

    if (activeTab === 'media') {
        return (
            <div className="space-y-6">
                <p className="text-sm text-gray-500 mb-4">Upload photos for your Sunflower story.</p>

                {/* Slot 1: Couple 1 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Couple Photo 1 (Slide 4)</label>
                    <div className="relative">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageReplace(e, 0)}
                            className="hidden"
                            id="sunflower-img-0"
                            disabled={uploading}
                        />
                        <label htmlFor="sunflower-img-0" className="block w-full border-dashed border-2 p-4 text-center rounded-lg cursor-pointer hover:bg-gray-50">
                            {uploading ? "Uploading..." : "Upload Photo 1"}
                        </label>
                    </div>
                    {content.images[0] && (
                        <div className="mt-2 relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 mx-auto">
                            <img src={content.images[0]} alt="Couple 1" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>

                {/* Slot 2: Couple 2 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Couple Photo 2 (Slide 7)</label>
                    <div className="relative">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageReplace(e, 1)}
                            className="hidden"
                            id="sunflower-img-1"
                            disabled={uploading}
                        />
                        <label htmlFor="sunflower-img-1" className="block w-full border-dashed border-2 p-4 text-center rounded-lg cursor-pointer hover:bg-gray-50">
                            {uploading ? "Uploading..." : "Upload Photo 2"}
                        </label>
                    </div>
                    {content.images[1] && (
                        <div className="mt-2 relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 mx-auto">
                            <img src={content.images[1]} alt="Couple 2" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>

                {/* Slot 3: Stars */}
                {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stars Image (Slide 8)</label>
                    <div className="relative">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageReplace(e, 2)}
                            className="hidden"
                            id="sunflower-img-2"
                            disabled={uploading}
                        />
                        <label htmlFor="sunflower-img-2" className="block w-full border-dashed border-2 p-4 text-center rounded-lg cursor-pointer hover:bg-gray-50">
                            {uploading ? "Uploading..." : "Upload Stars Photo"}
                        </label>
                    </div>
                    {content.images[2] && (
                        <div className="mt-2 relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 mx-auto">
                            <img src={content.images[2]} alt="Stars" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div> */}
            </div>
        );
    }

    return null;
};

export const MySunflowerViewer: React.FC<MySunflowerViewerProps> = ({
    content,
    minHeightClass = "min-h-[100dvh]",
    isPreview = false
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ container: containerRef });
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
    const [showMail, setShowMail] = useState(false);
    const [showBombMessage, setShowBombMessage] = useState(false);
    const [showPuzzleModal, setShowPuzzleModal] = useState(false);
    const [heartPuzzleCompleted, setHeartPuzzleCompleted] = useState(false);

    const heightClass = isPreview ? 'h-full' : 'h-[100dvh]';

    return (
        <div
            ref={containerRef}
            className={`w-full ${heightClass} overflow-y-scroll snap-y snap-mandatory scroll-smooth font-sans bg-[#fffef0] text-slate-800`}
        >
            {/* Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-yellow-500 origin-left z-50"
                style={{ scaleX }}
            />

            {/* --- SLIDE 1: SUNFLOWER INTRO --- */}
            <section className={`w-full ${minHeightClass} snap-start flex flex-col items-center justify-center p-6 relative overflow-hidden text-center bg-gradient-to-b from-yellow-50 to-white`}>
                <motion.h1
                    initial={{ y: -50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    className="text-6xl md:text-8xl font-handwriting text-yellow-600 mb-8 drop-shadow-sm"
                >
                    My Sunflower
                </motion.h1>
                {/* <Sunflower /> */}
                <img src="https://firebasestorage.googleapis.com/v0/b/global-bucket-for-devils-projects/o/scrollwish%2F1772275854473_4-2-sunflowers-high-quality-png%20(1).png?alt=media&token=aa32e6c0-8af3-4603-8450-af979a3bc191" alt="" />
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-10 text-yellow-400"
                >
                    <ArrowUp className="rotate-180" />
                    <span className="text-xs uppercase tracking-widest">Scroll Up</span>
                </motion.div>
            </section>

            {/* --- SLIDE 2: HEART PUZZLE --- */}
            <section className={`w-full ${minHeightClass} snap-start flex flex-col items-center justify-center p-6 bg-white relative`}>
                <HeartPuzzle onComplete={() => {
                    setHeartPuzzleCompleted(true);
                    setShowPuzzleModal(true)
                }} />
                {heartPuzzleCompleted && (<h2 className="text-2xl md:text-3xl font-fredoka text-rose-400 mb-12">You Complete Me</h2>)}

                <AnimatePresence>
                    {showPuzzleModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                            onClick={() => setShowPuzzleModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.8, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.8, y: 20 }}
                                className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border-4 border-rose-200 relative overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Confetti Background */}
                                <div className="absolute inset-0 pointer-events-none opacity-20">
                                    {[...Array(20)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="absolute w-2 h-2 rounded-full bg-rose-400"
                                            style={{
                                                top: Math.random() * 100 + '%',
                                                left: Math.random() * 100 + '%',
                                            }}
                                        />
                                    ))}
                                </div>

                                <Heart size={64} className="text-rose-500 fill-rose-500 mx-auto mb-4 animate-bounce" />
                                <h3 className="text-3xl font-dancing text-rose-600 mb-2">You Complete Me!</h3>
                                <p className="text-gray-600 font-fredoka mb-6">
                                    Just like this puzzle, my life isn't complete without you.
                                </p>

                                <button
                                    onClick={() => setShowPuzzleModal(false)}
                                    className="px-6 py-2 bg-rose-500 text-white rounded-full font-medium hover:bg-rose-600 transition-colors shadow-lg hover:shadow-xl"
                                >
                                    Close
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {/* --- SLIDE 3: GOOGLE --- */}
            <section className={`w-full ${minHeightClass} snap-start flex flex-col items-center justify-center p-6 bg-gray-50`}>
                <GoogleSearch recipientName={content.recipientName} />
            </section>

            {/* --- SLIDE 4: COUPLE IMAGE 1 --- */}
            <section className={`w-full ${minHeightClass} snap-start flex flex-col items-center justify-center p-6 bg-white`}>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    className="p-4 bg-white shadow-2xl rotate-2 max-w-md w-full"
                >
                    <div className="aspect-[3/4] w-full bg-gray-100 overflow-hidden">
                        <img
                            src={content.images[0] || "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80"}
                            alt="Us"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="pt-4 text-center font-handwriting text-2xl text-gray-600">
                        Just Us
                    </div>
                </motion.div>
            </section>

            {/* --- SLIDE 5: MAIL --- */}
            <section className={`w-full ${minHeightClass} snap-start flex flex-col items-center justify-center p-6 bg-amber-50 relative`}>
                <h2 className="text-3xl font-fredoka text-amber-600 mb-8">You've got mail!</h2>
                <motion.button
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowMail(true)}
                    className="relative"
                >
                    <Mail size={120} className="text-amber-500 drop-shadow-xl" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-bounce" />
                </motion.button>
                <p className="mt-4 text-amber-400 font-handwriting text-xl">Tap to open</p>

                <AnimatePresence>
                    {showMail && (
                        <MailModal
                            message={content.message}
                            onClose={() => setShowMail(false)}
                        />
                    )}
                </AnimatePresence>
            </section>

            {/* --- SLIDE 6: VOLCANO --- */}
            <section className={`w-full ${minHeightClass} snap-start flex flex-col items-center justify-center p-6 bg-orange-50`}>
                <div className="relative w-64 h-64 mb-8">
                    <img
                        src="https://firebasestorage.googleapis.com/v0/b/global-bucket-for-devils-projects/o/scrollwish%2Fvolcano-joypixels.gif?alt=media&token=c84887c3-bca3-446b-83c0-16b2715821ea"
                        alt="Volcano"
                        className="w-full h-full object-contain"
                    />
                    <motion.div
                        initial={{ y: 0, opacity: 0 }}
                        whileInView={{ y: -50, opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute -top-10 left-1/2 -translate-x-1/2 text-4xl"
                    >
                        ❤️
                    </motion.div>
                </div>
                <h2 className="text-4xl md:text-5xl font-fredoka text-orange-600 drop-shadow-md">
                    I Lava You!
                </h2>
            </section>

            {/* --- SLIDE 7: COUPLE IMAGE 2 + BUTTERFLIES --- */}
            <section className={`w-full ${minHeightClass} snap-start flex flex-row items-center p-6 bg-white relative overflow-hidden`}>
                {/* Butterflies Decoration */}
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            x: [0, 100, 0],
                            y: [0, -50, 0],
                            rotate: [0, 10, -10, 0]
                        }}
                        transition={{ duration: 5 + i, repeat: Infinity }}
                        className="absolute text-2xl pointer-events-none"
                        style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
                    >
                        🦋
                    </motion.div>
                ))}

                <div className="w-1/2 flex justify-center z-10">
                    <motion.div
                        initial={{ x: -100, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        className="w-40 h-40 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-rose-200 shadow-xl"
                    >
                        <img
                            src={content.images[1] || "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=800&q=80"}
                            alt="Love"
                            className="w-full h-full object-cover"
                        />
                    </motion.div>
                </div>
                <div className="w-1/2 z-10">
                    <h2 className="text-4xl md:text-5xl font-handwriting text-rose-500 ml-8 mb-4">
                        I Love You
                    </h2>
                </div>
            </section>

            {/* --- SLIDE 8: STARS --- */}
            <section className={`w-full ${minHeightClass} snap-start flex flex-col items-center justify-center p-6 bg-slate-900 text-white relative`}>
                {[...Array(30)].map((_, i) => (
                    <Star
                        key={i}
                        size={Math.random() * 20 + 10}
                        className="absolute text-yellow-200 animate-pulse"
                        style={{ top: `${Math.random() * 60}%`, left: `${Math.random() * 100}%` }}
                    />
                ))}

                {/* <div className="w-full max-w-md aspect-square bg-slate-800/50 rounded-2xl mb-8 flex items-center justify-center border border-slate-700 overflow-hidden relative z-10"> */}
                <img src="https://firebasestorage.googleapis.com/v0/b/global-bucket-for-devils-projects/o/scrollwish%2F1772384577463_panda-stealing-stars.png?alt=media&token=dc39ae01-0c1b-4009-ae2b-e5fa56ac584d"
                    alt="Panada Stealing heart"
                    className="w-100 h-96 object-cover top-1/2 -translate-y-20" />

                {/* </div> */}

                <h2 className="text-3xl md:text-5xl text-yellow-100 text-center max-w-xl z-10">
                    For you I'll steal all the stars
                </h2>
            </section>

            {/* --- SLIDE 9: BOMB --- */}
            <section className={`w-full ${minHeightClass} snap-start flex flex-col items-center justify-center p-6 bg-gray-100 relative`}>
                <BombEffect onExplode={() => setShowBombMessage(true)} />

                <AnimatePresence>
                    {showBombMessage && (
                        <motion.div
                            initial={{ scale: 0, rotate: 180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
                        >
                            <div className="bg-white p-10 rounded-3xl text-center max-w-lg w-full relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-orange-100 opacity-50" />
                                <div className="relative z-10">
                                    <h2 className="text-4xl font-fredoka text-red-600 mb-6">BOOM! 💥</h2>
                                    <p className="text-2xl font-serif text-slate-800">
                                        {content.shayari || "You are the bomb!"}
                                    </p>
                                    <button
                                        onClick={() => setShowBombMessage(false)}
                                        className="mt-8 px-6 py-2 bg-slate-800 text-white rounded-full hover:bg-slate-900"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </div>
    );
};
