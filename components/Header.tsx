import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, User as UserIcon, Menu, FolderHeart, LogOut } from 'lucide-react';
import { Button } from './Button';
import { User } from '../types';

interface HeaderProps {
  onLoginClick: () => void;
  onLogoutClick: () => void;
  user: User | null;
}

export const Header: React.FC<HeaderProps> = ({ onLoginClick, onLogoutClick, user }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
              setIsUserMenuOpen(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-rose-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            {/* <div className="p-2 bg-rose-500 rounded-xl text-white group-hover:rotate-12 transition-transform"> */}
              {/* <Sparkles size={20} /> */}
            <img src="../assets/image.png" alt="ScrollWish Logo" className="h-8 w-11 rounded-full group-hover:scale-110 transition-transform duration-300" />

            {/* </div> */}
            <span className="font-bold text-2xl bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
              ScrollWish
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/explore" className="text-gray-600 hover:text-rose-500 transition-colors">Explore</Link>
            <Link to="/explore?cat=wedding" className="text-gray-600 hover:text-rose-500 transition-colors">Wedding</Link>
            <Link to="/explore?cat=birthday" className="text-gray-600 hover:text-rose-500 transition-colors">Birthday</Link>
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 text-rose-600 font-medium bg-rose-50 px-4 py-2 rounded-full hover:bg-rose-100 transition-colors"
                >
                    <UserIcon size={18} />
                    <span>{user.phone}</span>
                </button>
                
                {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-rose-100 py-2 animate-in fade-in slide-in-from-top-2">
                        <Link 
                            to="/my-cards" 
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                        >
                            <FolderHeart size={16} /> My Cards
                        </Link>
                        <div className="h-px bg-gray-100 my-1"></div>
                        <button 
                            onClick={() => {
                                onLogoutClick();
                                setIsUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-left"
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                )}
              </div>
            ) : (
              <Button onClick={onLoginClick} variant="primary" size="sm">Login</Button>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-rose-100 p-4 space-y-4 shadow-lg">
           <Link to="/explore" className="block text-gray-600 py-2">Explore Cards</Link>
           <Link to="/explore?cat=wedding" className="block text-gray-600 py-2">Wedding</Link>
           {user && <Link to="/my-cards" className="block text-gray-600 py-2">My Cards</Link>}
           <div className="pt-2 border-t border-gray-100">
             {user ? (
                <div className="space-y-3">
                    <span className="block text-rose-600 font-medium py-2 flex items-center gap-2">
                        <UserIcon size={16} /> {user.phone}
                    </span>
                    <Button 
                        onClick={onLogoutClick} 
                        variant="secondary" 
                        className="w-full justify-center text-red-600 border-red-200 hover:bg-red-50"
                    >
                        <LogOut size={16} /> Logout
                    </Button>
                </div>
             ) : (
                <Button onClick={onLoginClick} className="w-full">Login</Button>
             )}
           </div>
        </div>
      )}
    </nav>
  );
};