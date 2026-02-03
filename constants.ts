import { Category, CardTemplate, CardContent } from './types';
import { Heart, Gift, Music, Star, Users, Briefcase, Smile, Sun, Moon, Coffee } from 'lucide-react';

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Birthday', slug: 'birthday', icon: '🎂' },
  { id: '2', name: 'Love', slug: 'love', icon: '❤️' },
  { id: '3', name: 'Wedding', slug: 'wedding', icon: '💍' },
  { id: '4', name: 'Friendship', slug: 'friendship', icon: '👯' },
  { id: '5', name: 'Thank You', slug: 'thank-you', icon: '🙏' },
  { id: '6', name: 'Congratulations', slug: 'congrats', icon: '🎉' },
];

export const SHAYARI_LIBRARY = [
  "In the book of life, you are my favorite chapter.",
  "Distances mean nothing when someone means everything.",
  "May your day be filled with the same joy you bring to others.",
  "Counting the stars, I count you twice.",
  "A true friend reaches for your hand and touches your heart.",
  "Love is not about how many days, months, or years you have been together. Love is about how much you love each other every single day."
];

export const DEMO_TEMPLATES: CardTemplate[] = [
  {
    id: 't7',
    title: 'Valentine Proposal',
    categoryId: '2',
    previewImage: 'https://www.dropbox.com/scl/fi/ob5p76116i1y7oa7oxxy6/priscilla-du-preez-xSAiIM6Wa2c-unsplash.jpg?rlkey=rjqlwnahmu9sqtdiy4xj5cvkl&st=rirjwf74&raw=1',
    isPaid: false,
    price: 299,
    themeColor: 'rose',
    layout: 'valentine'
  },
  {
    id: 't6',
    title: 'Friendship Journey',
    categoryId: '4',
    previewImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isPaid: false,
    price: 199,
    themeColor: 'friendship',
    layout: 'timeline'
  },
  {
    id: 't1',
    title: 'Floral Birthday',
    categoryId: '1',
    previewImage: 'https://www.dropbox.com/scl/fi/m68r3bk5pyeknrky8lyxm/morgan-lane-18N4okmWccM-unsplash.jpg?rlkey=1oduiuycwj011tqod2f2yo89s&st=juhci19n&raw=1',
    isPaid: false,
    themeColor: 'rose'
  },
  {
    id: 't2',
    title: 'Neon Party',
    categoryId: '1',
    previewImage: 'https://www.dropbox.com/scl/fi/wy1p4iayscp61gl6731c2/ameer-basheer-XP7QZpvbnKY-unsplash.jpg?rlkey=iq61472nb77jp4cfxdzbg78nz&st=dfqj2k54&raw=1',
    isPaid: true,
    price: 99,
    themeColor: 'ocean'
  },
  {
    id: 't3',
    title: 'Romantic Sunset',
    categoryId: '2',
    previewImage: 'https://picsum.photos/id/106/400/600',
    isPaid: true,
    price: 149,
    themeColor: 'sunset'
  },
  {
    id: 't4',
    title: 'Elegant Wedding',
    categoryId: '3',
    previewImage: 'https://picsum.photos/id/180/400/600',
    isPaid: false,
    themeColor: 'lavender'
  },
  {
    id: 't5',
    title: 'Besties Forever',
    categoryId: '4',
    previewImage: 'https://picsum.photos/id/338/400/600',
    isPaid: false,
    themeColor: 'rose'
  }
];

export const DEFAULT_CARD_CONTENT: CardContent = {
  title: "Happy Birthday!",
  recipientName: "Saloni",
  message: "Wishing you a day filled with happiness and a year filled with joy. Happy Birthday!",
  shayari: "May your day be filled with the same joy you bring to others.",
  images: [
    "https://picsum.photos/id/1011/800/600",
    "https://picsum.photos/id/1015/800/600",
    "https://picsum.photos/id/1019/800/600"
  ],
  senderName: "Abhinay",
  theme: 'rose',
  layout: 'default'
};

export const THEME_CONFIG = {
  rose: {
    bg: 'bg-gradient-to-b from-rose-50 to-rose-200',
    text: 'text-rose-900',
    accent: 'bg-rose-500',
    secondary: 'bg-rose-100',
    pattern: ''
  },
  ocean: {
    bg: 'bg-gradient-to-b from-cyan-50 to-blue-200',
    text: 'text-blue-900',
    accent: 'bg-blue-500',
    secondary: 'bg-blue-100',
    pattern: ''
  },
  sunset: {
    bg: 'bg-gradient-to-b from-orange-50 to-pink-200',
    text: 'text-orange-900',
    accent: 'bg-orange-500',
    secondary: 'bg-orange-100',
    pattern: ''
  },
  lavender: {
    bg: 'bg-gradient-to-b from-purple-50 to-violet-200',
    text: 'text-purple-900',
    accent: 'bg-purple-500',
    secondary: 'bg-purple-100',
    pattern: ''
  },
  friendship: {
    bg: 'bg-[#ECE5DD]', // WhatsApp-ish base
    text: 'text-teal-900',
    accent: 'bg-teal-600',
    secondary: 'bg-[#DCF8C6]',
    pattern: 'opacity-10 bg-[url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")]' // WhatsApp Doodle pattern URL
  }
};