export interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
}

export interface CardTemplate {
  id: string;
  title: string;
  categoryId: string;
  previewImage: string;
  isPaid: boolean;
  price?: number;
  themeColor: string;
  layout?: 'default' | 'timeline' | 'valentine';
}

export interface CardContent {
  title: string;
  recipientName: string;
  message: string;
  shayari?: string;
  images: string[];
  senderName: string;
  theme: 'rose' | 'ocean' | 'sunset' | 'lavender' | 'friendship';
  layout?: 'default' | 'timeline' | 'valentine';
  friendshipYears?: { start: string; end: string };
  videoUrl?: string;
}

export interface RecipientResponse {
  respondedAt: string;
  availableOn14?: boolean;
  customDate?: string;
  time?: string;
  venue?: string;
  giftWants?: string;
  giftDontWants?: string;
}

export interface UserCard {
  id: string;
  templateId: string;
  content: CardContent;
  isLocked: boolean;
  recipientResponse?: RecipientResponse;
}

export interface User {
  id: string;
  phone: string;
  isLoggedIn: boolean;
}