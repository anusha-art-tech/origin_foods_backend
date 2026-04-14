-- Create database
CREATE DATABASE IF NOT EXISTS origin_foods;
USE origin_foods;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'chef', 'admin') DEFAULT 'customer',
    avatar VARCHAR(255) DEFAULT '',
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    zipCode VARCHAR(20),
    isVerified BOOLEAN DEFAULT FALSE,
    resetPasswordToken VARCHAR(255),
    resetPasswordExpire DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Chefs table
CREATE TABLE IF NOT EXISTS chefs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    cuisine VARCHAR(100),
    bio TEXT NOT NULL,
    experience INT NOT NULL,
    pricePerService DECIMAL(10,2) NOT NULL DEFAULT 0,
    pricePerGuest DECIMAL(10,2) DEFAULT 0,
    travelFee DECIMAL(10,2) DEFAULT 0,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    zipCode VARCHAR(20),
    serviceRadius INT DEFAULT 20,
    profileImage VARCHAR(255),
    galleryImages JSON DEFAULT (JSON_ARRAY()),
    isVerified BOOLEAN DEFAULT FALSE,
    isAvailable BOOLEAN DEFAULT TRUE,
    rating DECIMAL(3,2) DEFAULT 0,
    totalReviews INT DEFAULT 0,
    totalBookings INT DEFAULT 0,
    specialties JSON DEFAULT (JSON_ARRAY()),
    dietaryOptions JSON DEFAULT (JSON_ARRAY()),
    languages JSON DEFAULT (JSON_ARRAY()),
    signatureDishes JSON DEFAULT (JSON_ARRAY()),
    certifications JSON DEFAULT (JSON_ARRAY()),
    serviceAreas JSON DEFAULT (JSON_ARRAY()),
    minimumGuests INT DEFAULT 1,
    maxGuests INT DEFAULT 12,
    responseTime VARCHAR(100) DEFAULT 'Usually responds within 24 hours',
    sampleMenu TEXT,
    kitchenRequirements TEXT,
    allergenExperience TEXT,
    availability JSON,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    chefId INT NOT NULL,
    chefName VARCHAR(100) NOT NULL,
    cuisine VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(20) NOT NULL,
    guests INT NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    zipCode VARCHAR(20),
    specialRequests TEXT,
    dietaryRestrictions JSON,
    status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded') DEFAULT 'pending',
    totalAmount DECIMAL(10,2) NOT NULL,
    serviceFee DECIMAL(10,2) NOT NULL,
    chefEarnings DECIMAL(10,2) NOT NULL,
    paymentStatus ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    paymentId VARCHAR(255),
    cancellationReason TEXT,
    cancelledAt DATETIME,
    completedAt DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (chefId) REFERENCES chefs(id)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    chefId INT NOT NULL,
    bookingId INT UNIQUE NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(100) NOT NULL,
    comment TEXT NOT NULL,
    images JSON,
    tags JSON,
    helpful INT DEFAULT 0,
    isVerified BOOLEAN DEFAULT TRUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (chefId) REFERENCES chefs(id),
    FOREIGN KEY (bookingId) REFERENCES bookings(id)
);

-- Favorite chefs table
CREATE TABLE IF NOT EXISTS favorite_chefs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    chefId INT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_user_chef_favorite (userId, chefId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (chefId) REFERENCES chefs(id) ON DELETE CASCADE
);

-- Cuisines table
CREATE TABLE IF NOT EXISTS cuisines (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    isActive BOOLEAN DEFAULT TRUE,
    createdByChefId INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (createdByChefId) REFERENCES chefs(id) ON DELETE SET NULL
);

-- Chef-Cuisine junction table
CREATE TABLE IF NOT EXISTS chef_cuisines (
    chefId INT NOT NULL,
    cuisineId INT NOT NULL,
    PRIMARY KEY (chefId, cuisineId),
    FOREIGN KEY (chefId) REFERENCES chefs(id) ON DELETE CASCADE,
    FOREIGN KEY (cuisineId) REFERENCES cuisines(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_chefs_city ON chefs(city);
CREATE INDEX idx_chefs_rating ON chefs(rating);
CREATE INDEX idx_bookings_user ON bookings(userId);
CREATE INDEX idx_bookings_chef ON bookings(chefId);
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_reviews_chef ON reviews(chefId);
CREATE INDEX idx_favorite_chefs_user ON favorite_chefs(userId);
CREATE INDEX idx_favorite_chefs_chef ON favorite_chefs(chefId);

-- Insert sample cuisines
INSERT INTO cuisines (name, description) VALUES
('British', 'Modern and traditional British cooking'),
('Italian', 'Authentic Italian cuisine from various regions'),
('Indian', 'Traditional Indian dishes with rich spices'),
('Chinese', 'Authentic Chinese home-style cooking'),
('Mexican', 'Traditional Mexican flavors and recipes'),
('Japanese', 'Authentic Japanese cuisine'),
('Thai', 'Traditional Thai dishes'),
('French', 'Classic French cooking'),
('Spanish', 'Authentic Spanish tapas and paella'),
('Middle Eastern', 'Traditional Middle Eastern cuisine'),
('Greek', 'Authentic Greek Mediterranean dishes');
