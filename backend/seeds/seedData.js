const bcrypt = require('bcryptjs');
const { sequelize, User, Chef, Cuisine } = require('../models');

const seedData = async () => {
  try {
    await sequelize.sync({ force: true });

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@originfoods.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true,
    });

    // Create sample users
    const users = await User.bulkCreate([
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'user',
        city: 'New York',
        state: 'NY',
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        role: 'user',
        city: 'Los Angeles',
        state: 'CA',
      },
    ]);

    // Create sample chefs
    const chefs = await Chef.bulkCreate([
      {
        userId: users[0].id,
        name: 'Chef Maria Lopez',
        cuisine: 'Mexican',
        bio: 'Authentic Mexican cuisine from Oaxaca, passed down through generations.',
        experience: 12,
        pricePerService: 150,
        city: 'Los Angeles',
        state: 'CA',
        isVerified: true,
        rating: 4.9,
        totalReviews: 128,
        signatureDishes: JSON.stringify(['Tacos al Pastor', 'Mole Poblano', 'Chiles En Nogada']),
        languages: JSON.stringify(['English', 'Spanish']),
      },
      {
        userId: users[1].id,
        name: 'Chef Rajesh Kumar',
        cuisine: 'Indian',
        bio: 'Traditional North Indian cooking with authentic spices and recipes.',
        experience: 15,
        pricePerService: 160,
        city: 'New York',
        state: 'NY',
        isVerified: true,
        rating: 4.8,
        totalReviews: 95,
        signatureDishes: JSON.stringify(['Butter Chicken', 'Biryani', 'Dal Makhani']),
        languages: JSON.stringify(['English', 'Hindi']),
      },
    ]);

    console.log('✅ Database seeded successfully!');
    console.log('Admin credentials:');
    console.log('Email: admin@originfoods.com');
    console.log('Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();