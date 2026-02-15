
const mongoose = require('mongoose');
const { Category, Template } = require('./models/schema');

const MONGO_URI = 'mongodb://localhost:27017/scrollwish';

const categories = [
  { name: 'Birthday', slug: 'birthday', icon: '🎂' },
  { name: 'Love', slug: 'love', icon: '❤️' },
  { name: 'Wedding', slug: 'wedding', icon: '💍' },
  { name: 'Friendship', slug: 'friendship', icon: '👯' },
  { name: 'Thank You', slug: 'thank-you', icon: '🙏' },
  { name: 'Congratulations', slug: 'congrats', icon: '🎉' },
];

const templates = [
  {
    title: 'Valentine Proposal',
    catSlug: 'love',
    previewImage: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isPaid: true,
    price: 299,
    themeColor: 'rose',
    layout: 'valentine',
    renderFunction: 'ValentineViewer'
  },
  {
    title: 'Friendship Journey',
    catSlug: 'friendship',
    previewImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isPaid: true,
    price: 199,
    themeColor: 'friendship',
    layout: 'timeline',
    renderFunction: 'FriendshipTimelineViewer'
  },
  {
    title: 'Floral Birthday',
    catSlug: 'birthday',
    previewImage: 'https://picsum.photos/id/40/400/600',
    isPaid: false,
    themeColor: 'rose',
    layout: 'default',
    renderFunction: 'DefaultViewer'
  },
  {
    title: 'Neon Party',
    catSlug: 'birthday',
    previewImage: 'https://picsum.photos/id/103/400/600',
    isPaid: true,
    price: 99,
    themeColor: 'ocean',
    layout: 'default',
    renderFunction: 'DefaultViewer'
  },
  // WEDDING TEMPLATE
  {
    title: 'Royal Wedding Invite',
    catSlug: 'wedding',
    previewImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isPaid: true,
    price: 499,
    themeColor: 'gold',
    layout: 'wedding',
    renderFunction: 'WeddingViewer'
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB...');

    // Clear existing
    await Category.deleteMany({});
    await Template.deleteMany({});

    // Insert Categories
    const createdCats = await Category.insertMany(categories);
    console.log(`Inserted ${createdCats.length} categories`);

    // Map templates to category IDs
    const templateData = templates.map(t => {
      const cat = createdCats.find(c => c.slug === t.catSlug);
      return {
        title: t.title,
        category: cat._id,
        previewImage: t.previewImage,
        isPaid: t.isPaid,
        price: t.price,
        themeColor: t.themeColor,
        layout: t.layout,
        renderFunction: t.renderFunction,
        isVisible: true
      };
    });

    await Template.insertMany(templateData);
    console.log(`Inserted ${templateData.length} templates`);

    console.log('Seeding Complete!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
