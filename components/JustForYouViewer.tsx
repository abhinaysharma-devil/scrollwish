import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { CardContent } from '../types';
import { Heart, Star, Moon, ArrowUp, RefreshCw, X } from 'lucide-react';
import BEE_GIF from '../assets/bee.gif';

interface JustForYouViewerProps {
    content: CardContent;
    minHeightClass?: string;
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
            className="absolute inset-0 bg-white/50 z-50"
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

const Butterfly = ({ delay, x, y }: { delay: number, x: string, y: string }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
        whileInView={{
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1, 1, 0.5],
            x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
            y: [0, -100, -200, -300]
        }}
        transition={{ duration: 4, delay: delay, times: [0, 0.2, 0.8, 1] }}
        className="absolute w-12 h-12 pointer-events-none z-20"
        style={{ left: x, top: y }}
    >
        <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            animate={{ scaleX: [1, 0.2, 1] }}
            transition={{ duration: 0.2, repeat: Infinity }}
        >
            <path d="M12 12C12 12 14 8 18 8C22 8 22 14 18 16C14 18 12 12 12 12Z" fill="#FF69B4" fillOpacity="0.8" />
            <path d="M12 12C12 12 10 8 6 8C2 8 2 14 6 16C10 18 12 12 12 12Z" fill="#FF69B4" fillOpacity="0.8" />
            <path d="M12 12C12 12 14 16 17 18C20 20 20 22 17 23C14 24 12 12 12 12Z" fill="#FF1493" fillOpacity="0.8" />
            <path d="M12 12C12 12 10 16 7 18C4 20 4 22 7 23C10 24 12 12 12 12Z" fill="#FF1493" fillOpacity="0.8" />
            <path d="M12 8V24" stroke="#8B4513" strokeWidth="1" strokeLinecap="round" />
        </motion.svg>
    </motion.div>
);

const MatchStick = ({ rotate, x, name, isLeft }: { rotate: number, x: number, name: string, isLeft: boolean }) => (
    <div className="relative flex flex-col items-center" style={{ transform: `rotate(${rotate}deg) translateX(${x}px)` }}>
        {/* Stick */}
        <div className="relative w-3 h-32 bg-[#E6C9A8] rounded-sm shadow-sm border border-amber-200/50">
            {/* Burnt Head */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-5 bg-[#8B4513] rounded-full shadow-inner" />

            {/* Name on Stick */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap text-[10px] font-mono font-bold text-amber-900 tracking-widest uppercase opacity-80">
                {name}
            </div>
        </div>

        {/* Arms */}
        <div className={`absolute top-12 w-8 h-0.5 bg-black rounded-full ${isLeft ? '-right-7 rotate-[30deg]' : '-left-8 rotate-[-20deg]'}`} />

        <div className={`absolute top-12 w-8 h-0.5 bg-black rounded-full ${isLeft ? 'right-3 -rotate-[20deg]' : 'top-9 left-2 rotate-[-40deg]'}`} />

        <div className={`absolute top-12 w-2 h-0.5 bg-black rounded-full ${isLeft ? 'right-10 top-14 -rotate-[-120deg]' : 'top-6 left-9 rotate-[-10deg]'}`} />

        {/* Legs */}
        {/* <div className="absolute -bottom-4 w-12 h-4">
            <div className={`absolute top-0 left-1/2 w-0.5 h-4 bg-black origin-top ${isLeft ? '-rotate-12' : 'rotate-12'}`} />
            <div className={`absolute top-0 left-1/2 w-0.5 h-6 bg-black origin-top ${isLeft ? 'rotate-12' : '-rotate-12'}`} />

            <div className={`absolute bottom-0 left-0 w-2 h-0.5 bg-black ${isLeft ? '-translate-x-2' : 'translate-x-2'}`} />
            <div className={`absolute bottom-0 right-0 w-2 h-0.5 bg-black ${isLeft ? '-translate-x-1' : 'translate-x-1'}`} />
        </div> */}


        <div className="absolute -bottom-4 w-12 h-4">
            <div className={`absolute top-0 left-5 w-0.5 h-3 bg-black origin-top ${isLeft ? 'rotate-12' : '-rotate-14'}`} />
        </div>

        <div className="absolute -bottom-3 w-12 h-4">
            <div className={`absolute bottom-0 right-0 w-2 h-0.5 bg-black ${isLeft ? '-translate-x-7' : '-translate-x-7'}`} />
        </div>

        <div className="absolute -bottom-4 w-14 h-4">
            <div className={`absolute top-0 left-1/2 w-0.5 h-3 bg-black origin-top ${isLeft ? '-rotate-12' : 'rotate-10'}`} />
        </div>

        <div className="absolute -bottom-3 w-12 h-4">
            <div className={`absolute bottom-0 right-0 w-2 h-0.5 bg-black ${isLeft ? '-translate-x-3' : '-translate-x-4'}`} />
        </div>

    </div>
);

const TicTacToe = () => {
    const [grid, setGrid] = useState<(string | null)[]>(Array(9).fill(null));
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [winner, setWinner] = useState<'player' | 'computer' | null>(null);
    const [showModal, setShowModal] = useState(false);

    const checkWinner = (currentGrid: (string | null)[]) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (let line of lines) {
            const [a, b, c] = line;
            if (currentGrid[a] && currentGrid[a] === currentGrid[b] && currentGrid[a] === currentGrid[c]) {
                return currentGrid[a] === '❤️' ? 'player' : 'computer';
            }
        }
        return null;
    };

    const handleCellClick = (index: number) => {
        if (grid[index] || !isPlayerTurn || winner) return;

        const newGrid = [...grid];
        newGrid[index] = '❤️';
        setGrid(newGrid);

        const win = checkWinner(newGrid);
        if (win) {
            setWinner(win);
            setShowModal(true);
        } else {
            setIsPlayerTurn(false);
        }
    };

    useEffect(() => {
        if (!isPlayerTurn && !winner) {
            const timer = setTimeout(() => {
                const emptyIndices = grid.map((val, idx) => val === null ? idx : null).filter(val => val !== null) as number[];

                if (emptyIndices.length > 0) {
                    // Simple AI: Try to win, then block, then random
                    let move = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];

                    // Check for winning move
                    for (let idx of emptyIndices) {
                        const testGrid = [...grid];
                        testGrid[idx] = 'X';
                        if (checkWinner(testGrid) === 'computer') {
                            move = idx;
                            break;
                        }
                    }

                    // Check for blocking move (if player is about to win)
                    if (move === emptyIndices[Math.floor(Math.random() * emptyIndices.length)]) { // If no winning move found yet
                        for (let idx of emptyIndices) {
                            const testGrid = [...grid];
                            testGrid[idx] = '❤️';
                            if (checkWinner(testGrid) === 'player') {
                                move = idx;
                                break;
                            }
                        }
                    }

                    const newGrid = [...grid];
                    newGrid[move] = 'X';
                    setGrid(newGrid);

                    const win = checkWinner(newGrid);
                    if (win) {
                        setWinner(win);
                        setShowModal(true);
                    } else {
                        setIsPlayerTurn(true);
                    }
                }
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [isPlayerTurn, grid, winner]);

    return (
        <div className="flex flex-col items-center relative">
            {winner && <Confetti />}
            {winner && <BlastEffect />}

            <h3 className="text-2xl md:text-3xl text-rose-600 mb-6 font-handwriting">
                Let's play the love game
            </h3>

            <div className="relative">
                <div className="grid grid-cols-3 gap-3 bg-white p-6 rounded-2xl shadow-xl border-2 border-rose-100">
                    {grid.map((cell, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: !cell && !winner ? 1.05 : 1 }}
                            whileTap={{ scale: !cell && !winner ? 0.95 : 1 }}
                            onClick={() => handleCellClick(i)}
                            className={`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center text-3xl md:text-4xl font-bold rounded-xl cursor-pointer transition-colors ${cell ? 'bg-rose-50' : 'bg-gray-100 hover:bg-rose-50'
                                }`}
                        >
                            {cell === '❤️' ? (
                                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-red-500">❤️</motion.span>
                            ) : cell === 'X' ? (
                                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-slate-400">X</motion.span>
                            ) : null}
                        </motion.div>
                    ))}
                </div>

                {/* Modal Overlay */}
                <AnimatePresence>
                    {showModal && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute inset-0 z-50 flex items-center justify-center"
                        >
                            <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border-2 border-rose-200 text-center max-w-[90%] mx-auto">
                                <h4 className="text-2xl font-handwriting text-rose-600 mb-2">
                                    {winner === 'player' ? "Congratulation you won my heart! 🎉" : "Congratulation I won your heart! 😉"}
                                </h4>
                                <p className="text-sm text-gray-500 mb-4">
                                    {winner === 'player' ? "My heart is yours forever." : "Your heart is mine now."}
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setGrid(Array(9).fill(null));
                                        setWinner(null);
                                        setIsPlayerTurn(true);
                                        setShowModal(false);
                                    }}
                                    className="px-4 py-2 bg-rose-500 text-white rounded-full text-sm font-medium shadow-md hover:bg-rose-600 transition-colors flex items-center gap-2 mx-auto"
                                >
                                    <RefreshCw size={14} /> Play Again
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// import { useEffect, useRef, useMemo } from "react";

const CompleteHeartAnimation = ({
    start = { x: 130, y: 160 },
    end = { x: 840, y: 170 }
}) => {

    const pathRef = useRef(null);
    const maskPathRef = useRef(null);
    const arrowRef = useRef(null);

    // 🔥 Dynamic path based on start & end
    const pathD = useMemo(() => {
        const midX = (start.x + end.x) / 2;
        const curveOffset = 120;

        return `
      M ${start.x} ${start.y}
      C ${start.x + 120} ${start.y - curveOffset},
        ${midX - 100} ${start.y - curveOffset},
        ${midX} ${(start.y + end.y) / 2}
      C ${midX + 100} ${end.y + curveOffset},
        ${end.x - 120} ${end.y},
        ${end.x} ${end.y}
    `;
    }, [start, end]);

    useEffect(() => {
        const path = pathRef.current;
        const maskPath = maskPathRef.current;
        const arrow = arrowRef.current;

        const length = path.getTotalLength();

        maskPath.setAttribute("d", path.getAttribute("d"));
        maskPath.style.strokeDasharray = length;
        maskPath.style.strokeDashoffset = length;

        const duration = 5000;
        let startTime = null;

        function animate(timestamp) {
            if (!startTime) startTime = timestamp;

            const progressTime = (timestamp - startTime) % duration;
            const percent = progressTime / duration;
            const drawLength = length * percent;

            // Reveal dotted line
            maskPath.style.strokeDashoffset = length - drawLength;

            // Move arrow
            const point = path.getPointAtLength(drawLength);
            const nextPoint = path.getPointAtLength(drawLength + 1);

            const angle =
                (Math.atan2(
                    nextPoint.y - point.y,
                    nextPoint.x - point.x
                ) *
                    180) /
                Math.PI;

            arrow.setAttribute(
                "transform",
                `translate(${point.x},${point.y}) rotate(${angle})`
            );

            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    }, [pathD]);

    return (
        <div className="flex items-center justify-center h-[300px]">
            <svg
                viewBox="0 0 900 300"
                className="w-[300px] h-[300px]"
            >
                <defs>
                    <mask id="revealMask">
                        <rect width="100%" height="100%" fill="black" />
                        <path
                            ref={maskPathRef}
                            fill="none"
                            stroke="white"
                            strokeWidth="6"
                        />
                    </mask>
                </defs>

                {/* Hearts */}
                <text x={start.x - 200} y={start.y + 50} className="text-[150px]">
                    💔
                </text>
                <text x={end.x - 0} y={end.y + 80} className="text-[150px]">
                    ❤️
                </text>

                {/* Invisible motion path */}
                <path
                    ref={pathRef}
                    d={pathD}
                    fill="none"
                    stroke="none"
                />

                {/* Dotted path (masked) */}
                <path
                    d={pathD}
                    fill="none"
                    stroke="black"
                    strokeWidth="3"
                    strokeDasharray="6 10"
                    strokeLinecap="round"
                    mask="url(#revealMask)"
                />

                {/* Arrow */}
                <polygon
                    ref={arrowRef}
                    points="0,-8 18,0 0,8"
                    className="fill-black"
                />
            </svg>
        </div>
    );
};

export default CompleteHeartAnimation;

export const JustForYouViewer: React.FC<JustForYouViewerProps> = ({
    content,
    minHeightClass = "min-h-[100dvh]",
    isPreview = false
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ container: containerRef });
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const heightClass = isPreview ? 'h-full' : 'h-[100dvh]';

    return (
        <div
            ref={containerRef}
            className={`w-full ${heightClass} overflow-y-scroll snap-y snap-mandatory scroll-smooth font-sans bg-rose-50 text-slate-800`}
        >
            {/* Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-rose-500 origin-left z-50"
                style={{ scaleX }}
            />

            {/* --- INTRO --- */}
            <section className={`w-full ${minHeightClass} snap-start flex flex-col items-center justify-center p-6 relative overflow-hidden text-center bg-gradient-to-b from-rose-50 to-white`}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="z-10"
                >
                    <h1 className="text-6xl md:text-7xl font-handwriting text-rose-500 mb-6 drop-shadow-sm">Just For You</h1>
                    <div className="flex items-center justify-center gap-4 text-3xl md:text-5xl font-serif text-slate-700">
                        <span className="font-handwriting">{content.senderName}</span>
                        <Heart className="text-red-500 fill-red-500 animate-pulse" />
                        <span className="font-handwriting">{content.recipientName}</span>
                    </div>
                </motion.div>

                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-10 text-rose-300"
                >
                    <ArrowUp className="rotate-180 m-auto" />
                    <span className="text-xs uppercase tracking-widest">Scroll Up</span>
                </motion.div>
            </section>

            {/* --- SLIDE 1: BUTTERFLIES --- */}
            <section className={`w-full ${minHeightClass} snap-start flex flex-col items-center justify-center p-6 relative overflow-hidden text-center bg-white`}>
                {/* Butterflies */}
                {[...Array(15)].map((_, i) => (
                    <Butterfly key={i} delay={i * 0.5} x={`${Math.random() * 90 + 5}%`} y={`${Math.random() * 90 + 5}%`} />
                ))}

                <img
                    src="https://firebasestorage.googleapis.com/v0/b/global-bucket-for-devils-projects/o/scrollwish%2F1771945119558_IMG_2960.png?alt=media&token=2f70933f-68a7-418a-8c09-161ef0b520e8"
                    alt="Party" className="h-24 md:h-56 object-contain mix-blend-multiply z-10 pb-10" />

                <h2 className="text-4xl md:text-5xl font-mono text-rose-500 max-w-2xl leading-relaxed z-10">
                    I’m Sticking with you forever and always
                </h2>
            </section>

            {/* --- SLIDE 2: MATCHSTICKS --- */}
            <section className={`w-full ${minHeightClass} snap-start flex flex-col items-center justify-center p-6 relative overflow-hidden text-center bg-[#fdfbf7]`}>
                {/* Dashed Border Effect */}
                <div className="absolute inset-8 border-2 border-dashed border-gray-300 rounded-3xl pointer-events-none" />

                <div className="relative h-64 w-64 mb-12 flex items-center justify-center">
                    <Heart className="absolute top-30 text-red-600 fill-red-600 w-12 h-12 z-10" />
                    <div className="flex items-end justify-center gap-8 translate-y-4">
                        <MatchStick rotate={-10} x={-20} name={content.senderName} isLeft={true} />
                        <MatchStick rotate={5} x={20} name={content.recipientName} isLeft={false} />
                    </div>
                    <div className="absolute top-16 text-xs text-gray-500 tracking-widest">
                        {content.weddingDate || "08.07.23"}
                    </div>
                </div>

                <h2 className="text-4xl md:text-6xl font-serif text-slate-700 z-10">
                    I’m glad we matched!
                </h2>
            </section>

            {/* --- SLIDE 3: BEE-LONG --- */}
            <section className={`w-full ${minHeightClass} snap-start flex flex-col items-center justify-center p-6 relative overflow-hidden text-center bg-yellow-50`}>

                <img src="https://firebasestorage.googleapis.com/v0/b/global-bucket-for-devils-projects/o/scrollwish%2Fbeeish-planb.gif?alt=media&token=dd172cac-004d-47d6-afcc-84011a9ba317" alt="Party" className="h-24 md:h-56 object-contain mix-blend-multiply z-10 pb-1 object-contain mix-blend-multiply mb-24 z-10" />

                <h2 className="text-4xl md:text-5xl font-mono  text-yellow-600">
                    We bee-Long Together
                </h2>
            </section>

            {/* --- SLIDE 4: TIC-TAC-TOE --- */}
            <section className={`w-full ${minHeightClass} snap-start flex flex-col items-center justify-center p-6 relative overflow-hidden text-center bg-rose-50`}>
                <TicTacToe />
            </section>

            {/* --- SLIDE 5: COMPLETE ME --- */}
            <section className={`w-full ${minHeightClass} snap-start flex flex-col items-center justify-center p-6 relative overflow-hidden text-center bg-white`}>
                <div className="flex items-center gap-6 mb-12">
                    {/* <div className="w-24 h-48 bg-rose-500 rounded-l-full opacity-80 shadow-lg" /> */}
                    {/* <div className="text-4xl text-rose-300">➡️</div> */}
                    {/* <Heart size={180} className="text-rose-500 fill-rose-500 animate-pulse drop-shadow-xl" /> */}

                    <CompleteHeartAnimation
                        start={{ x: 200, y: -200 }}
                        end={{ x: 720, y: 350 }}
                    />
                </div>

                <h2 className="text-4xl md:text-6xl font-handwriting text-rose-500">
                    You Complete Me
                </h2>
            </section>

            {/* --- SLIDE 6: GROW OLD --- */}
            <section className={`w-full ${minHeightClass} snap-start flex flex-col items-center justify-center p-6 relative overflow-hidden text-center bg-slate-50`}>
                {/* <div className="w-full max-w-md aspect-video bg-white rounded-xl mb-8 flex items-center justify-center border border-slate-200 shadow-sm">
                    <span className="text-slate-400 text-sm">Grow Old GIF Placeholder</span>
                </div> */}

                <img
                    src="https://firebasestorage.googleapis.com/v0/b/global-bucket-for-devils-projects/o/scrollwish%2F1771952685254_IMG_2964.png?alt=media&token=3dee9c7f-18e5-496e-8ce9-50454ee8b7ec"
                    alt="Party" className="h-24 md:h-80 object-contain mix-blend-multiply z-10 pb-5" />

                <h2 className="text-4xl md:text-5xl font-mono text-slate-600">
                    I want to grow OLD with you
                </h2>
            </section>

            {/* --- SLIDE 7: MOON --- */}
            <section className={`w-full ${minHeightClass} snap-start flex flex-col items-center justify-center p-6 relative overflow-hidden text-center bg-slate-900`}>
                {/* Stars */}
                {[...Array(50)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute bg-white rounded-full animate-pulse"
                        style={{
                            width: Math.random() * 3 + 'px',
                            height: Math.random() * 3 + 'px',
                            top: Math.random() * 100 + '%',
                            left: Math.random() * 100 + '%',
                            animationDelay: Math.random() * 2 + 's'
                        }}
                    />
                ))}

                <div className="relative mb-12">
                    {/* Removed the circle background as requested */}
                    <Moon className="text-yellow-100 w-32 h-32 fill-yellow-100 drop-shadow-[0_0_30px_rgba(255,255,200,0.5)]" />
                </div>

                <h2 className="text-3xl md:text-5xl font-serif text-white max-w-2xl leading-relaxed z-10">
                    This is the worlds moon but my moon is YOU
                </h2>
            </section>

            {/* --- OUTRO --- */}
            <section className={`w-full ${minHeightClass} snap-start flex flex-col items-center justify-center p-6 relative overflow-hidden text-center bg-gradient-to-t from-rose-100 to-white`}>
                <h2 className="text-5xl md:text-7xl font-handwriting text-rose-500 mb-6">With Love</h2>
                <p className="text-3xl md:text-5xl text-slate-700 font-handwriting">{content.senderName}</p>

                <div className="mt-12">
                    <button
                        onClick={() => {
                            const firstSection = document.body;
                            firstSection?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-8 py-3 bg-rose-500 hover:bg-rose-600 rounded-full text-white transition-colors shadow-lg hover:shadow-xl font-medium"
                    >
                        Replay
                    </button>
                </div>
            </section>
        </div>
    );
};
