import { User, CardTemplate, CardContent } from '../types';

const API_URL = 'http://localhost:5000/api';
// const API_URL = 'https://scrollwish-api-155830263049.asia-south1.run.app/api';

const handleResponse = async (res: Response) => {
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'API Error');
    }
    return res.json();
};

export const mockAuth = {
    sendOtp: async (phone: string): Promise<boolean> => {
        try {
            await fetch(`${API_URL}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            }).then(handleResponse);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    },
    verifyOtp: async (phone: string, otp: string): Promise<User | null> => {
        try {
            const res = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp })
            }).then(handleResponse);
            return { ...res.user, isLoggedIn: true };
        } catch (e) {
            console.error(e);
            return null;
        }
    }
};

export const mockPayment = {
    createOrder: async (amount: number): Promise<any> => {
        return fetch(`${API_URL}/payment/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount })
        }).then(handleResponse);
    },
    verifyPayment: async (paymentData: any): Promise<boolean> => {
        try {
            await fetch(`${API_URL}/payment/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentData)
            }).then(handleResponse);
            return true;
        } catch (e) {
            return false;
        }
    }
};

export const mockCards = {
    getCards: async (categorySlug?: string): Promise<CardTemplate[]> => {
        try {
            const query = categorySlug && categorySlug !== 'all' ? `?categorySlug=${categorySlug}` : '';
            const templates = await fetch(`${API_URL}/templates${query}`).then(handleResponse);
            return templates.map((t: any) => ({
                id: t._id,
                title: t.title,
                categoryId: t.category?._id || t.category,
                previewImage: t.previewImage,
                isPaid: t.isPaid,
                price: t.price,
                themeColor: t.themeColor,
                layout: t.layout
            }));
        } catch (e) {
            console.error(e);
            return [];
        }
    },
    getCardById: async (id: string): Promise<CardTemplate | undefined> => {
        try {
            const t = await fetch(`${API_URL}/templates/${id}`).then(handleResponse);
            return {
                id: t._id,
                title: t.title,
                categoryId: t.category?._id || t.category,
                previewImage: t.previewImage,
                isPaid: t.isPaid,
                price: t.price,
                themeColor: t.themeColor,
                layout: t.layout
            };
        } catch (e) {
            console.error(e);
            return undefined;
        }
    },
    createCard: async (userId: string, templateId: string, content: CardContent, isPaid: boolean) => {
        return fetch(`${API_URL}/cards`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, templateId, content, isPaid })
        }).then(handleResponse);
    },
    getCardByHash: async (hash: string) => {
        return fetch(`${API_URL}/cards/${hash}`).then(handleResponse);
    },
    saveResponse: async (hash: string, data: any) => {
        return fetch(`${API_URL}/cards/${hash}/respond`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(handleResponse);
    },
    getUserCards: async (userId: string) => {
        try {
            const cards = await fetch(`${API_URL}/user/${userId}/cards`).then(handleResponse);
            return cards;
        } catch (e) {
            console.error(e);
            return [];
        }
    }
};

export const category = {
    getCategoryList: async (): Promise<CardTemplate[]> => {
        try {
            const templates = await fetch(`${API_URL}/categories`).then(handleResponse);
            return templates.map((t: any) => ({
                id: t._id,
                name: t.name,
                slug: t.slug,
                icon: t.icon
            }));
        } catch (e) {
            console.error(e);
            return [];
        }
    },
};

