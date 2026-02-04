const mongoose = require('mongoose');

// User Schema
const UserSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  otp: { type: String }, // In prod, store hashed or use transient store like Redis
  otpExpires: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Category Schema
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  icon: { type: String, required: true }
});

// Template Schema
const TemplateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  previewImage: { type: String },
  isPaid: { type: Boolean, default: false },
  price: { type: Number, default: 0 },
  themeColor: { type: String },
  layout: { type: String, enum: ['default', 'timeline', 'valentine'], default: 'default' }
});

// UserCard Schema (Created Cards)
const UserCardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  template: { type: mongoose.Schema.Types.ObjectId, ref: 'Template' },
  content: { type: Object, required: true }, // Stores the JSON content state
  recipientResponse: {
    respondedAt: { type: Date },
    availableOn14: { type: Boolean },
    customDate: { type: String },
    time: { type: String },
    venue: { type: String },
    giftWants: { type: String },
    giftDontWants: { type: String }
  },
  shareHash: { type: String, required: true, unique: true },
  password: { type: String },
  isLocked: { type: Boolean, default: false },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  User: mongoose.model('User', UserSchema),
  Category: mongoose.model('Category', CategorySchema),
  Template: mongoose.model('Template', TemplateSchema),
  UserCard: mongoose.model('UserCard', UserCardSchema)
};