const { sequelize, User, Chef, FavoriteChef, Cuisine } = require('../models');

const seedData = async () => {
  try {
    await sequelize.sync({ force: true });

    // Create admin user
    await User.create({
      name: 'Admin User',
      email: 'admin@originfoods.co.uk',
      password: 'admin123',
      role: 'admin',
      phone: '+44 20 7946 0101',
      city: 'London',
      country: 'United Kingdom',
      isVerified: true,
    });

    const users = await User.bulkCreate([
      {
        name: 'Customer Demo',
        email: 'customer@originfoods.co.uk',
        password: 'password123',
        role: 'customer',
        city: 'Manchester',
        state: 'Greater Manchester',
        country: 'United Kingdom',
        phone: '+44 161 496 0202',
        isVerified: true,
      },
      {
        name: 'Chef Eleanor Hughes',
        email: 'chef@originfoods.co.uk',
        password: 'password123',
        role: 'chef',
        city: 'London',
        state: 'Greater London',
        country: 'United Kingdom',
        phone: '+44 20 7946 0303',
        isVerified: true,
      },
      {
        name: 'Chef Rajesh Kumar',
        email: 'rajesh@originfoods.co.uk',
        password: 'password123',
        role: 'chef',
        city: 'Birmingham',
        state: 'West Midlands',
        country: 'United Kingdom',
        phone: '+44 121 496 0404',
        isVerified: true,
      },
    ]);

    const chefs = await Chef.bulkCreate([
      {
        userId: users[1].id,
        name: 'Chef Eleanor Hughes',
        cuisine: 'British',
        bio: 'Modern British cooking with seasonal produce, Sunday roasts, and classic comfort dishes tailored for private dining.',
        experience: 12,
        pricePerService: 120,
        pricePerGuest: 18,
        travelFee: 12,
        city: 'London',
        state: 'Greater London',
        country: 'United Kingdom',
        isVerified: true,
        rating: 4.9,
        totalReviews: 128,
        totalBookings: 36,
        specialties: ['Private Dining', 'Seasonal British Menus', 'Family Style Service'],
        dietaryOptions: ['Vegetarian', 'Gluten-Free', 'Nut-Free'],
        signatureDishes: ['Beef Wellington', 'Sunday Roast', 'Sticky Toffee Pudding'],
        languages: ['English'],
        certifications: ['Level 2 Food Hygiene', 'Allergen Awareness'],
        serviceAreas: ['Central London', 'Canary Wharf', 'Richmond'],
        galleryImages: [
          'https://images.unsplash.com/photo-1544025162-d76694265947',
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'
        ],
        minimumGuests: 2,
        maxGuests: 14,
        responseTime: 'Usually responds within 3 hours',
        sampleMenu: 'Starter: Pea and mint soup\nMain: Herb-crusted lamb with roast potatoes\nDessert: Sticky toffee pudding',
        kitchenRequirements: 'Standard oven, four-burner hob, and refrigerator space for prep ingredients.',
        allergenExperience: 'Experienced with dairy-free, gluten-free, and nut-aware menu planning.',
      },
      {
        userId: users[2].id,
        name: 'Chef Rajesh Kumar',
        cuisine: 'Indian',
        bio: 'Traditional North Indian cooking with authentic spices and recipes.',
        experience: 15,
        pricePerService: 135,
        pricePerGuest: 16,
        travelFee: 10,
        city: 'Birmingham',
        state: 'West Midlands',
        country: 'United Kingdom',
        isVerified: true,
        rating: 4.8,
        totalReviews: 95,
        totalBookings: 28,
        specialties: ['North Indian', 'Tandoor Menus', 'Festive Catering'],
        dietaryOptions: ['Vegetarian', 'Vegan', 'Halal'],
        signatureDishes: ['Butter Chicken', 'Biryani', 'Dal Makhani'],
        languages: ['English', 'Hindi'],
        certifications: ['Level 3 Food Safety', 'Advanced Allergy Training'],
        serviceAreas: ['Birmingham City Centre', 'Solihull', 'Wolverhampton'],
        galleryImages: [
          'https://images.unsplash.com/photo-1512058564366-18510be2db19',
          'https://images.unsplash.com/photo-1546833999-b9f581a1996d'
        ],
        minimumGuests: 4,
        maxGuests: 20,
        responseTime: 'Usually responds within 6 hours',
        sampleMenu: 'Starter: Onion bhaji\nMain: Butter chicken, biryani, dal makhani\nDessert: Gulab jamun',
        kitchenRequirements: 'Access to hob space, prep counter, and serving dishes for buffet setup.',
        allergenExperience: 'Comfortable adapting menus for dairy-free, nut-free, and mild spice requirements.',
      },
    ]);

    const cuisineRecords = await Cuisine.bulkCreate([
      {
        name: 'Seasonal British',
        description: 'Farm-to-table British menus for private dining and family events.',
        createdByChefId: chefs[0].id,
      },
      {
        name: 'Sunday Roast',
        description: 'Traditional roast dinners with refined sides and desserts.',
        createdByChefId: chefs[0].id,
      },
      {
        name: 'North Indian',
        description: 'Classic North Indian dishes with authentic spice blends.',
        createdByChefId: chefs[1].id,
      },
      {
        name: 'Festival Catering',
        description: 'Large-format Indian menus for celebrations and gatherings.',
        createdByChefId: chefs[1].id,
      },
    ]);

    await chefs[0].addCuisines(cuisineRecords.slice(0, 2));
    await chefs[1].addCuisines(cuisineRecords.slice(2));

    await FavoriteChef.bulkCreate([
      {
        userId: users[0].id,
        chefId: chefs[0].id,
      },
      {
        userId: users[0].id,
        chefId: chefs[1].id,
      },
    ]);

    console.log('Database seeded successfully');
    console.log('Admin: admin@originfoods.co.uk / admin123');
    console.log('Customer: customer@originfoods.co.uk / password123');
    console.log('Chef: chef@originfoods.co.uk / password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
