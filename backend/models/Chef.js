module.exports = (sequelize, DataTypes) => {
  const Chef = sequelize.define('Chef', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    experience: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 50
      }
    },
    pricePerService: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    pricePerGuest: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    zipCode: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    serviceRadius: {
      type: DataTypes.INTEGER,
      defaultValue: 20
    },
    profileImage: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0
    },
    totalReviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    totalBookings: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    languages: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    signatureDishes: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    certifications: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    availability: {
      type: DataTypes.JSON,
      defaultValue: {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'chefs',
    timestamps: true
  });

  return Chef;
};