
import { CardContent, CardTemplate, Category, User, UserCard } from '../types';
import { CATEGORIES, DEMO_TEMPLATES, DEFAULT_CARD_CONTENT } from '../constants';

// const API_URL = 'http://localhost:5000/api';
const API_URL = 'https://scrollwish-api-155830263049.asia-south1.run.app/api';
// Helper to handle response with fallback
const request = async <T>(endpoint: string, options?: RequestInit, fallback?: T): Promise<T> => {
    try {
        const res = await fetch(`${API_URL}${endpoint}`, options);
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return await res.json();
    } catch (err) {
        console.warn(`API Request to ${endpoint} failed. Using fallback data.`, err);
        if (fallback !== undefined) return fallback;
        throw err;
    }
};

export const api = {
    // --- Auth ---
    auth: {
        sendOtp: async (phone: string) => {
            return request('/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            }, { success: true, message: 'OTP sent (Mock)' });
        },
        verifyOtp: async (phone: string, otp: string) => {
            return request('/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp })
            }, {
                success: true,
                user: { id: 'mock_user_1', phone, isLoggedIn: true, isAdmin: true }
            });
        }
    },

    addUser: async (userData: { name: string; email: string; phone: string; uid: string }) => {
        return request('/user/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        }, { success: true, user: { ...userData, isLoggedIn: true } });
    },

    // --- Public Data ---
    getTemplates: async (categorySlug?: string): Promise<CardTemplate[]> => {
        let fallback = DEMO_TEMPLATES;
        if (categorySlug && categorySlug !== 'all') {
            const cat = CATEGORIES.find(c => c.slug === categorySlug);
            if (cat) fallback = DEMO_TEMPLATES.filter(t => t.categoryId === cat.id);
        }

        const url = categorySlug && categorySlug !== 'all'
            ? `/templates?categorySlug=${categorySlug}`
            : `/templates`;

        return request(url, undefined, fallback);
    },

    // getTemplateById: async (id: string): Promise<CardTemplate | undefined> => {
    //     return request(`/templates/${id}`, undefined, DEMO_TEMPLATES.find(t => t.id === id));
    // },

    getTemplateBySlug: async (slug: string): Promise<CardTemplate | undefined> => {
        return request(`/templates/${slug}`, undefined);
    },


    getCategories: async (): Promise<Category[]> => {
        return request('/categories', undefined, CATEGORIES);
    },

    // --- Card Operations ---
    createCard: async (userId: string, slug: string, content: CardContent, isPaid: boolean) => {
        const mockHash = Math.random().toString(36).substring(2, 8);
        return request('/cards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, slug, content, isPaid })
        }, { success: true, shareHash: mockHash, cardId: 'mock_card_' + Date.now() });
    },

    getCardByHash: async (hash: string): Promise<any> => {
        const mockCard = {
            isLocked: false,
            template: DEMO_TEMPLATES[0],
            ownerId: 'mock_user_1',
            paymentStatus: 'paid',
            shareHash: hash,
            cardId: 'mock_card_1',
            createdAt: new Date().toISOString(),
            content: DEFAULT_CARD_CONTENT,
            recipientResponse: undefined
        };

        if (hash === 'wedding-demo') {
            const weddingTemp = DEMO_TEMPLATES.find(t => t.layout === 'wedding');
            if (weddingTemp) {
                mockCard.template = weddingTemp;
                mockCard.content = { ...DEFAULT_CARD_CONTENT, layout: 'wedding', renderFunction: 'WeddingViewer' };
            }
        }

        return request(`/cards/${hash}`, undefined, mockCard);
    },

    getUserCards: async (userId: string): Promise<UserCard[]> => {
        const dummyUserCards: any[] = [
            {
                _id: 'card_1',
                user: userId,
                template: DEMO_TEMPLATES[0],
                content: DEFAULT_CARD_CONTENT,
                isLocked: false,
                paymentStatus: 'paid',
                shareHash: 'demo-hash-1',
                createdAt: new Date().toISOString()
            }
        ];
        return request(`/user/${userId}/cards`, undefined, dummyUserCards);
    },

    saveResponse: async (hash: string, data: any) => {
        return request(`/cards/${hash}/respond`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }, { success: true });
    },

    // --- Payment ---
    createOrder: async (amount: number) => {
        return request('/payment/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount })
        }, {
            id: 'order_mock_' + Math.random().toString(36).substring(7),
            currency: 'INR',
            amount: amount * 100
        });
    },

    verifyPayment: async (data: { cardId: string; paymentId: string; orderId: string; signature: string }) => {
        return request('/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }, { success: true });
    },

    // --- Admin ---
    admin: {
        getAllCards: async () => {
            return request('/admin/cards', undefined, []);
        },
        updateCardStatus: async (cardId: string, status: string) => {
            return request(`/admin/cards/${cardId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            }, { success: true });
        },
        createCategory: async (data: any) => {
            return request('/admin/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }, { ...data, id: 'new_cat_' + Date.now() });
        },
        updateCategory: async (id: string, data: any) => {
            return request(`/admin/categories/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }, data);
        },
        deleteCategory: async (id: string) => {
            return request(`/admin/categories/${id}`, { method: 'DELETE' }, { success: true });
        },
        createTemplate: async (data: any) => {
            return request('/admin/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }, { ...data, id: 'new_temp_' + Date.now() });
        },
        updateTemplate: async (id: string, data: any) => {
            return request(`/admin/templates/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }, data);
        },
        deleteTemplate: async (id: string) => {
            return request(`/admin/templates/${id}`, { method: 'DELETE' }, { success: true });
        },
        toggleTemplateVisibility: async (id: string, isVisible: boolean) => {
            return request(`/admin/templates/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isVisible })
            }, { id, isVisible });
        }
    }
};
