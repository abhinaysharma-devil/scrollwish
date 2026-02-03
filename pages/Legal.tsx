import React from 'react';
import { useLocation } from 'react-router-dom';

export const Legal: React.FC = () => {
  const location = useLocation();
  const type = location.pathname.split('/')[1];

  let title = "";
  let content = null;

  if (type === 'terms') {
      title = "Terms of Service";
      content = (
          <div className="prose max-w-none">
              <p>Welcome to ScrollWish. By using our website, you agree to these terms.</p>
              <h3>1. Usage</h3>
              <p>You may create and share cards for personal use. Commercial resale is prohibited without permission.</p>
              <h3>2. Payments</h3>
              <p>Premium templates require a one-time payment. Refunds are processed only within 24 hours of purchase if the service was not delivered.</p>
          </div>
      );
  } else if (type === 'privacy') {
      title = "Privacy Policy";
      content = (
        <div className="prose max-w-none">
            <p>Your privacy matters to us.</p>
            <h3>Data Collection</h3>
            <p>We collect your phone number for login and card creation. Card content (images, text) is stored securely to display your card.</p>
            <h3>Sharing</h3>
            <p>We do not sell your data to third parties.</p>
        </div>
    );
  } else if (type === 'contact') {
      title = "Contact Us";
      content = (
        <div className="prose max-w-none">
            <p>Have questions? Reach out to us!</p>
            <div className="bg-rose-50 p-6 rounded-xl border border-rose-100 not-prose">
                <p className="font-bold text-lg mb-2">Abhinay Panchal</p>
                <p className="mb-1">📧 Email: <a href="mailto:panchalabhinay@gmail.com" className="text-rose-600 hover:underline">panchalabhinay@gmail.com</a></p>
                <p>📱 Mobile: +91 9936362455</p>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">{title}</h1>
            <div className="text-gray-600 leading-relaxed">
                {content}
            </div>
        </div>
    </div>
  );
};