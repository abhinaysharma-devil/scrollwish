
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { CardTemplate, Category, UserCard } from '../types';
import { Loader } from '../components/Loader';
import { Button } from '../components/Button';
import { Layout, Grid, Users, Plus, Edit, Eye, EyeOff, Save, Trash2, CheckCircle, Clock, X, Code, Upload } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { PUBLIC_UPLOAD_PATH, TEMPLATE_UPLOAD_PATH } from '@/constants';
import { uploadFile } from '@/services/firebase';


export const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'cards' | 'templates' | 'categories'>('cards');
    const [cards, setCards] = useState<UserCard[]>([]);
    const [templates, setTemplates] = useState<CardTemplate[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Media Upload State
    const [uploading, setUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

    // Auth Check
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');

    // Modal State
    const [activeModal, setActiveModal] = useState<'template' | 'category' | null>(null);
    const [editingItem, setEditingItem] = useState<any>(null); // Holds the item being edited

    useEffect(() => {
        if (isAuthenticated) fetchAllData();
    }, [isAuthenticated]);

    // Handle Image Uploads
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const files = Array.from(e.target.files) as File[];
        const newUrls: string[] = [];

        try {
       
            for (const file of files) {

                const path = `${PUBLIC_UPLOAD_PATH}/${Date.now()}_${file.name}`;
                const url = await uploadFile(file, path);
                newUrls.push(url);
            }

            setUploadedFiles(newUrls);

            // // Append new images to existing ones
            // setContent(prev => ({
            //     ...prev,
            //     images: [...prev.images, ...newUrls]
            // }));
        } catch (error) {
            console.error("Image upload failed", error);
            alert("Failed to upload image. Please check your Firebase configuration.");
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [c, t, cat] = await Promise.all([
                api.admin.getAllCards(),
                api.getTemplates('all'),
                api.getCategories()
            ]);
            setCards(c as any);
            setTemplates(t);
            setCategories(cat);
        } catch (e) {
            console.error("Admin Fetch Error", e);
        }
        setLoading(false);
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'devil456') setIsAuthenticated(true);
        else alert('Wrong Password');
    };

    const toggleVisibility = async (id: string, current: boolean) => {
        await api.admin.toggleTemplateVisibility(id, !current);
        setTemplates(templates.map(t => t.id === id ? { ...t, isVisible: !current } : t));
    };

    const updateCardStatus = async (id: string, status: 'paid' | 'pending') => {
        await api.admin.updateCardStatus(id, status);
        setCards(cards.map(c => c._id === id ? { ...c, paymentStatus: status, isLocked: status === 'pending' } : c));
    };

    const openEditModal = (type: 'template' | 'category', item?: any) => {
        setEditingItem(item || {}); // If no item, it's a create action
        setActiveModal(type);
    };

    const closeModal = () => {
        setActiveModal(null);
        setEditingItem(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (activeModal === 'category') {
                if (editingItem.id) {
                    await api.admin.updateCategory(editingItem.id, editingItem);
                } else {
                    await api.admin.createCategory(editingItem);
                }
            } else if (activeModal === 'template') {
                if (editingItem.id) {
                    await api.admin.updateTemplate(editingItem.id, editingItem);
                } else {
                    await api.admin.createTemplate(editingItem);
                }
            }
            closeModal();
            fetchAllData();
        } catch (err) {
            console.error(err);
            alert("Failed to save.");
        }
    };

    const handleDelete = async (id: string, type: 'template' | 'category') => {
        if (!confirm("Are you sure?")) return;
        try {
            if (type === 'template') await api.admin.deleteTemplate(id);
            if (type === 'category') await api.admin.deleteCategory(id);
            fetchAllData();
        } catch (e) { console.error(e); }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
                    <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter Secret Code"
                        className="w-full p-3 border rounded-lg mb-4"
                    />
                    <Button className="w-full">Access Dashboard</Button>
                </form>
            </div>
        );
    }

    if (loading) return <div className="h-screen"><Loader text="Loading Admin Data..." /></div>;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 text-white p-6 hidden md:block fixed h-full">
                <h1 className="text-xl font-bold mb-8 flex items-center gap-2"><Layout /> Admin Panel</h1>
                <div className="space-y-2">
                    <button
                        onClick={() => setActiveTab('cards')}
                        className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'cards' ? 'bg-rose-600' : 'hover:bg-slate-800'}`}
                    >
                        <Users size={18} /> User Cards
                    </button>
                    <button
                        onClick={() => setActiveTab('templates')}
                        className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'templates' ? 'bg-rose-600' : 'hover:bg-slate-800'}`}
                    >
                        <Grid size={18} /> Templates
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'categories' ? 'bg-rose-600' : 'hover:bg-slate-800'}`}
                    >
                        <Layout size={18} /> Categories
                    </button>

                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'upload' ? 'bg-rose-600' : 'hover:bg-slate-800'}`}
                    >
                        <Layout size={18} /> Upload files
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 ml-0 md:ml-64">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 capitalize">{activeTab} Management</h2>
                    <Button size="sm" onClick={fetchAllData}>Refresh Data</Button>
                </div>

                {/* USER CARDS TAB */}
                {activeTab === 'cards' && (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 font-semibold text-gray-600">User Phone</th>
                                    <th className="p-4 font-semibold text-gray-600">Template</th>
                                    <th className="p-4 font-semibold text-gray-600">Created</th>
                                    <th className="p-4 font-semibold text-gray-600">Status</th>
                                    <th className="p-4 font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {cards.map(card => (
                                    <tr key={card._id} className="hover:bg-gray-50">
                                        <td className="p-4 text-sm">{card.user?.phone || card.user?.email  || 'Unknown'}</td>
                                        <td className="p-4 text-sm">{card.template?.title || 'Unknown Template'}</td>
                                        <td className="p-4 text-sm text-gray-500">{new Date(card.createdAt).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold uppercase ${card.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {card.paymentStatus === 'paid' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                                {card.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {card.paymentStatus !== 'paid' && (
                                                <button
                                                    onClick={() => updateCardStatus(card._id, 'paid')}
                                                    className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                                                >
                                                    Mark Paid
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* TEMPLATES TAB */}
                {activeTab === 'templates' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map(t => (
                            <div key={t.id} className={`bg-white rounded-xl shadow-sm border p-4 ${!t.isVisible ? 'opacity-60 grayscale' : ''} relative group`}>
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button onClick={() => openEditModal('template', t)} className="bg-blue-500 text-white p-1.5 rounded"><Edit size={14} /></button>
                                    <button onClick={() => handleDelete(t.id, 'template')} className="bg-red-500 text-white p-1.5 rounded"><Trash2 size={14} /></button>
                                </div>

                                <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden relative">
                                    <img src={t.previewImage} alt="" className="w-full h-full object-cover" />
                                    {t.renderFunction && (
                                        <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1 rounded font-mono">
                                            {t.renderFunction}
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold truncate pr-2">{t.title}</h3>
                                    <span className={`text-xs px-2 py-1 rounded ${t.isPaid ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                        {t.isPaid ? `₹${t.price}` : 'Free'}
                                    </span>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => toggleVisibility(t.id, t.isVisible || false)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-sm font-medium ${t.isVisible ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}
                                    >
                                        {t.isVisible ? <><EyeOff size={16} /> Hide</> : <><Eye size={16} /> Show</>}
                                    </button>
                                </div>
                            </div>
                        ))}
                        {/* Add New Placeholder */}
                        <div
                            onClick={() => openEditModal('template')}
                            className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-8 text-gray-400 cursor-pointer hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50 transition-colors min-h-[250px]"
                        >
                            <Plus size={40} className="mb-2" />
                            <span className="font-medium">Add Template</span>
                        </div>
                    </div>
                )}

                {/* CATEGORIES TAB */}
                {activeTab === 'categories' && (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden max-w-2xl">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4">Icon</th>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Slug</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map(c => (
                                    <tr key={c.id} className="border-b border-gray-50 last:border-0">
                                        <td className="p-4 text-2xl">{c.icon}</td>
                                        <td className="p-4 font-medium">{c.name}</td>
                                        <td className="p-4 text-gray-500 text-sm">{c.slug}</td>
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            <button onClick={() => openEditModal('category', c)} className="text-blue-500 hover:bg-blue-50 p-2 rounded"><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(c.id, 'category')} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="p-4 border-t border-gray-100">
                            <Button onClick={() => openEditModal('category')} variant="outline" size="sm" className="w-full border-dashed"><Plus size={16} /> Add Category</Button>
                        </div>
                    </div>
                )}
                {/* UPLOAD TAB */}
                {activeTab === 'upload' && (
                    <div className="relative">
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="image-upload"
                            disabled={uploading}
                        />
                        <label
                            htmlFor="image-upload"
                            className={`flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-rose-400 hover:bg-rose-50 transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {uploading ? <Loader text="Uploading..." /> :
                                <>
                                    <Upload size={20} className="text-gray-400" />
                                    <span className="text-gray-600 font-medium">Upload Photos</span>
                                </>}
                        </label>
                        {uploadedFiles.length > 0 && (
                            <div className="ml-4 px-2 py-1 bg-green-100 text-green-700 font-medium text-base rounded mt-4">
                                Uploaded File URL
                                <br />
                                <br />
                                <ul className="mt-1">
                                    {uploadedFiles.map((url, idx) => (
                                        <li key={idx}>
                                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{url}</a>
                                            <button onClick={() => navigator.clipboard.writeText(url)} className="ml-2 text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded">Copy</button>
                                            <img src={url} alt="Uploaded" className="w-200 h-32 object-cover mt-1 rounded" />
                                            <br />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* MODALS */}
            <AnimatePresence>
                {activeModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={closeModal} className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto"
                        >
                            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400"><X size={24} /></button>
                            <h2 className="text-2xl font-bold mb-6 capitalize">{editingItem?.id ? 'Edit' : 'Create'} {activeModal}</h2>

                            <form onSubmit={handleSave} className="space-y-4">
                                {activeModal === 'category' ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Name</label>
                                            <input className="w-full border p-2 rounded" value={editingItem.name || ''} onChange={e => setEditingItem({ ...editingItem, name: e.target.value })} required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Slug</label>
                                            <input className="w-full border p-2 rounded" value={editingItem.slug || ''} onChange={e => setEditingItem({ ...editingItem, slug: e.target.value })} required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Icon (Emoji)</label>
                                            <input className="w-full border p-2 rounded" value={editingItem.icon || ''} onChange={e => setEditingItem({ ...editingItem, icon: e.target.value })} required />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Title</label>
                                            <input className="w-full border p-2 rounded" value={editingItem.title || ''} onChange={e => setEditingItem({ ...editingItem, title: e.target.value })} required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Slug</label>
                                            <input className="w-full border p-2 rounded" value={editingItem.slug || ''} onChange={e => setEditingItem({ ...editingItem, slug: e.target.value })} required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Category</label>
                                            <select
                                                className="w-full border p-2 rounded"
                                                value={editingItem.categoryId || editingItem.category?._id || ''}
                                                onChange={e => setEditingItem({ ...editingItem, categoryId: e.target.value })}
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Preview Image URL</label>
                                            <input className="w-full border p-2 rounded" value={editingItem.previewImage || ''} onChange={e => setEditingItem({ ...editingItem, previewImage: e.target.value })} />
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" checked={editingItem.isPaid || false} onChange={e => setEditingItem({ ...editingItem, isPaid: e.target.checked })} />
                                                <label>Is Paid?</label>
                                            </div>
                                            {editingItem.isPaid && (
                                                <div className="flex-1">
                                                    <input type="number" className="w-full border p-2 rounded" placeholder="Price (INR)" value={editingItem.price || ''} onChange={e => setEditingItem({ ...editingItem, price: Number(e.target.value) })} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Render Function Name (Component)</label>
                                            <div className="relative">
                                                <Code size={16} className="absolute left-3 top-3 text-gray-400" />
                                                <input
                                                    className="w-full border p-2 pl-9 rounded font-mono text-sm"
                                                    placeholder="e.g. WeddingViewer"
                                                    value={editingItem.renderFunction || ''}
                                                    onChange={e => setEditingItem({ ...editingItem, renderFunction: e.target.value })}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Available: WeddingViewer, ValentineViewer, FriendshipTimelineViewer, DefaultViewer</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Theme Color</label>
                                            <select className="w-full border p-2 rounded" value={editingItem.themeColor || 'rose'} onChange={e => setEditingItem({ ...editingItem, themeColor: e.target.value })}>
                                                <option value="rose">Rose</option>
                                                <option value="ocean">Ocean</option>
                                                <option value="sunset">Sunset</option>
                                                <option value="friendship">Friendship</option>
                                                <option value="gold">Gold</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Legacy Layout</label>
                                            <select className="w-full border p-2 rounded" value={editingItem.layout || 'default'} onChange={e => setEditingItem({ ...editingItem, layout: e.target.value })}>
                                                <option value="default">Default</option>
                                                <option value="timeline">Timeline</option>
                                                <option value="valentine">Valentine</option>
                                                <option value="wedding">Wedding</option>
                                                <option value="birthday_cake">Birthday</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                                <Button className="w-full mt-4" size="lg">Save Changes</Button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
