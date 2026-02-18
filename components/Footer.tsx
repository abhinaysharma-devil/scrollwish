import React from 'react';
import { Heart, Instagram, Twitter, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-rose-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-bold text-2xl text-rose-600 mb-4">ScrollWish</h3>
            <p className="text-gray-500 max-w-sm">
              Creating magical moments through digital storytelling. 
              Move beyond paper cards and send an experience that lasts forever.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Explore</h4>
            <ul className="space-y-2 text-gray-500">
              <li><Link to="/explore?cat=birthday" className="hover:text-rose-500">Birthday Cards</Link></li>
              <li><Link to="/explore?cat=wedding" className="hover:text-rose-500">Wedding Invites</Link></li>
              <li><Link to="/explore?cat=love" className="hover:text-rose-500">Love Letters</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-500">
              <li><Link to="/privacy" className="hover:text-rose-500">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-rose-500">Terms of Service</Link></li>
              <li><Link to="/contact" className="hover:text-rose-500">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-100">
          <p className="text-gray-400 text-sm flex items-center gap-1">
            Made with <Heart size={14} className="text-rose-500 fill-rose-500" /> in 2026
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-rose-500"><Instagram size={20} /></a>
            <a href="#" className="text-gray-400 hover:text-rose-500"><Twitter size={20} /></a>
            <a href="#" className="text-gray-400 hover:text-rose-500"><Facebook size={20} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};