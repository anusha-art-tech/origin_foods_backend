module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define('Booking', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    chefId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'chefs',
        key: 'id'
      }
    },
    chefName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    cuisine: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    time: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    guests: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 50
      }
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    zipCode: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    specialRequests: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dietaryRestrictions: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded'),
      defaultValue: 'pending'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    serviceFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    chefEarnings: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
      defaultValue: 'pending'
    },
    paymentId: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    cancellationReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
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
    tableName: 'bookings',
    timestamps: true
  });

  // Instance method to check if booking can be cancelled
  Booking.prototype.canCancel = function() {
    const bookingDate = new Date(this.date);
    const now = new Date();
    const hoursDiff = (bookingDate - now) / (1000 * 60 * 60);
    return hoursDiff >= 24 && this.status === 'pending';
  };

  return Booking;
};