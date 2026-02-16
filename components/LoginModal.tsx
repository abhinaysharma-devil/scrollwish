import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from './Button';
import { mockAuth } from '../services/mockService';
import { User } from '../types';

import { getAdditionalUserInfo, signInWithPopup } from "firebase/auth";
import { auth, provider } from "../services/firebase";
import { api } from '@/services/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return setError('Please enter a valid phone number');
    setLoading(true);
    setError('');
    await mockAuth.sendOtp(phone);
    setLoading(false);
    setStep('otp');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const user = await mockAuth.verifyOtp(phone, otp);
    setLoading(false);
    if (user) {
      onLoginSuccess(user);
      onClose();
      setOtp('');
      setPhone('');
      setStep('phone');
    } else {
      setError('Invalid OTP.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // setLoading(true);
      setError("");

      const result = await signInWithPopup(auth, provider);

      const firebaseUser = result.user;

      console.log("Google User:", firebaseUser);

      await api.addUser({
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "User",
        phone: firebaseUser.phoneNumber || "",
        email: firebaseUser.email || "",
      });

      // Send user data back to parent
      onLoginSuccess({
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "User",
        phone: firebaseUser.phoneNumber || "",
        email: firebaseUser.email || "",
      });

      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl overflow-hidden"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
              <Smartphone size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {step === 'phone' ? 'Login or Signup' : 'Enter Verification Code'}
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              {step === 'phone'
                ? 'Enter your mobile number to get started'
                : `We sent a code to +91 ${phone}`
              }
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <Button
              type="button"
              className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              onClick={handleGoogleLogin}
            >
              Continue with Google
            </Button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-sm text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
          </div>


          <form onSubmit={step === 'phone' ? handleSendOtp : handleVerifyOtp} className="space-y-6">
            {step === 'phone' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                  autoFocus
                />
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="X X X X"
                  maxLength={4}
                  className="w-full px-4 py-3 text-center text-2xl tracking-widest rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                  autoFocus
                />
                <div className="text-center">
                  <button type="button" onClick={() => setStep('phone')} className="text-sm text-rose-500 hover:underline">
                    Change Number
                  </button>
                </div>
              </div>
            )}

            {error && <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">{error}</p>}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={loading}
            >
              {step === 'phone' ? (
                <>Send OTP <ArrowRight size={18} /></>
              ) : (
                <>Verify & Login <CheckCircle size={18} /></>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

