const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Import models
const User = require('./User')(sequelize, DataTypes);
const Chef = require('./Chef')(sequelize, DataTypes);
const Booking = require('./Booking')(sequelize, DataTypes);
const Review = require('./Review')(sequelize, DataTypes);
const Cuisine = require('./Cuisine')(sequelize, DataTypes);
const FavoriteChef = require('./FavoriteChef')(sequelize, DataTypes);

// Define associations
User.hasOne(Chef, { foreignKey: 'userId', as: 'chefProfile' });
Chef.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Chef.hasMany(Booking, { foreignKey: 'chefId', as: 'bookings' });
Booking.belongsTo(Chef, { foreignKey: 'chefId', as: 'chef' });

Chef.hasMany(Review, { foreignKey: 'chefId', as: 'reviews' });
Review.belongsTo(Chef, { foreignKey: 'chefId', as: 'chef' });

User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Booking.hasOne(Review, { foreignKey: 'bookingId', as: 'review' });
Review.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

Chef.belongsToMany(Cuisine, { through: 'ChefCuisines', foreignKey: 'chefId' });
Cuisine.belongsToMany(Chef, { through: 'ChefCuisines', foreignKey: 'cuisineId' });
Chef.hasMany(Cuisine, { foreignKey: 'createdByChefId', as: 'managedCuisines' });
Cuisine.belongsTo(Chef, { foreignKey: 'createdByChefId', as: 'creatorChef' });

User.belongsToMany(Chef, {
  through: FavoriteChef,
  foreignKey: 'userId',
  otherKey: 'chefId',
  as: 'favoriteChefs',
});
Chef.belongsToMany(User, {
  through: FavoriteChef,
  foreignKey: 'chefId',
  otherKey: 'userId',
  as: 'favoritedByUsers',
});

FavoriteChef.belongsTo(User, { foreignKey: 'userId', as: 'user' });
FavoriteChef.belongsTo(Chef, { foreignKey: 'chefId', as: 'chef' });
User.hasMany(FavoriteChef, { foreignKey: 'userId', as: 'favoriteChefLinks' });
Chef.hasMany(FavoriteChef, { foreignKey: 'chefId', as: 'favoriteChefLinks' });

module.exports = {
  sequelize,
  User,
  Chef,
  Booking,
  Review,
  Cuisine,
  FavoriteChef,
};
