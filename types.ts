
export interface Category {
  _id?: string;
  id: string;
  name: string;
  icon: string;
  slug: string;
}

export interface CardTemplate {
  _id?: string;
  id: string;
  title: string;
  categoryId: string;
  category?: Category;
  previewImage: string;
  isPaid: boolean;
  price?: number;
  themeColor: string;
  layout?: 'default' | 'timeline' | 'valentine' | 'wedding';
  renderFunction?: string; // Function name for dynamic rendering
  isVisible?: boolean;
}

export interface CardContent {
  title: string;
  recipientName: string; // Used as Bride Name in Wedding
  senderName: string; // Used as Groom Name in Wedding
  message: string;
  shayari?: string;
  images: string[];
  theme: 'rose' | 'ocean' | 'sunset' | 'lavender' | 'friendship' | 'gold';
  layout?: 'default' | 'timeline' | 'valentine' | 'wedding';
  renderFunction?: string; // Function name for dynamic rendering
  friendshipYears?: { start: string; end: string };
  videoUrl?: string;
  
  // Wedding Specifics
  weddingDate?: string;
  weddingTime?: string;
  venueName?: string;
  venueAddress?: string;
  venueMapUrl?: string;
  invitationNote?: string;
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
  _id: string;
  id?: string;
  templateId: string;
  template?: CardTemplate;
  content: CardContent;
  isLocked: boolean;
  paymentStatus: 'pending' | 'paid';
  shareHash: string;
  createdAt: string;
  recipientResponse?: RecipientResponse;
  user?: string | any; // Owner ID or Object
}

export interface User {
  uid: string;
  phone: string;
  name: string;
  email?: string;
  isLoggedIn: boolean;
  isAdmin?: boolean;
}
