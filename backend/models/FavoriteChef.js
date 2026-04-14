module.exports = (sequelize, DataTypes) => {
  const FavoriteChef = sequelize.define('FavoriteChef', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    chefId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'chefs',
        key: 'id',
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'favorite_chefs',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'chefId'],
      },
    ],
  });

  return FavoriteChef;
};
