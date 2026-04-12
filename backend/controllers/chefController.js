const { Chef, User, Review, Booking, sequelize } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all chefs
// @route   GET /api/chefs
// @access  Public
const getChefs = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  let where = { isVerified: true };

  if (req.query.cuisine && req.query.cuisine !== 'All') {
    where.cuisine = req.query.cuisine;
  }

  if (req.query.city) {
    where.city = { [Op.like]: `%${req.query.city}%` };
  }

  if (req.query.minRating) {
    where.rating = { [Op.gte]: parseFloat(req.query.minRating) };
  }

  if (req.query.minPrice && req.query.maxPrice) {
    where.pricePerService = {
      [Op.gte]: parseFloat(req.query.minPrice),
      [Op.lte]: parseFloat(req.query.maxPrice)
    };
  }

  if (req.query.search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${req.query.search}%` } },
      { bio: { [Op.like]: `%${req.query.search}%` } },
      { signatureDishes: { [Op.like]: `%${req.query.search}%` } }
    ];
  }

  const { count, rows } = await Chef.findAndCountAll({
    where,
    include: [{
      model: User,
      as: 'user',
      attributes: ['id', 'name', 'email', 'avatar']
    }],
    limit,
    offset,
    order: [['rating', 'DESC'], ['totalBookings', 'DESC']]
  });

  res.status(200).json({
    success: true,
    data: rows,
    pagination: {
      page,
      limit,
      total: count,
      pages: Math.ceil(count / limit),
    },
  });
};

// @desc    Get single chef
// @route   GET /api/chefs/:id
// @access  Public
const getChefById = async (req, res) => {
  const chef = await Chef.findByPk(req.params.id, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'avatar', 'phone']
      },
      {
        model: Review,
        as: 'reviews',
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'avatar']
        }],
        limit: 10
      }
    ]
  });

  if (!chef) {
    return res.status(404).json({
      success: false,
      message: 'Chef not found',
    });
  }

  res.status(200).json({
    success: true,
    data: chef,
  });
};

// @desc    Create chef profile
// @route   POST /api/chefs
// @access  Private
const createChefProfile = async (req, res) => {
  const existingChef = await Chef.findOne({ where: { userId: req.user.id } });
  if (existingChef) {
    return res.status(400).json({
      success: false,
      message: 'Chef profile already exists',
    });
  }

  await User.update({ role: 'chef' }, { where: { id: req.user.id } });

  const chef = await Chef.create({
    userId: req.user.id,
    name: req.body.name,
    bio: req.body.bio,
    experience: req.body.experience,
    pricePerService: req.body.pricePerService,
    pricePerGuest: req.body.pricePerGuest,
    city: req.body.city,
    state: req.body.state,
    country: req.body.country,
    signatureDishes: req.body.signatureDishes || [],
    languages: req.body.languages || [],
    availability: req.body.availability || {}
  });

  res.status(201).json({
    success: true,
    data: chef,
  });
};

// @desc    Update chef profile
// @route   PUT /api/chefs/:id
// @access  Private
const updateChefProfile = async (req, res) => {
  let chef = await Chef.findByPk(req.params.id);

  if (!chef) {
    return res.status(404).json({
      success: false,
      message: 'Chef not found',
    });
  }

  if (chef.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to update this profile',
    });
  }

  await chef.update(req.body);

  res.status(200).json({
    success: true,
    data: chef,
  });
};

// @desc    Get chef availability
// @route   GET /api/chefs/:id/availability
// @access  Public
const getChefAvailability = async (req, res) => {
  const chef = await Chef.findByPk(req.params.id, {
    attributes: ['availability']
  });

  if (!chef) {
    return res.status(404).json({
      success: false,
      message: 'Chef not found',
    });
  }

  const bookings = await Booking.findAll({
    where: {
      chefId: req.params.id,
      status: { [Op.in]: ['pending', 'confirmed'] },
      date: { [Op.gte]: new Date() }
    },
    attributes: ['date', 'time']
  });

  res.status(200).json({
    success: true,
    data: {
      availability: chef.availability,
      bookedSlots: bookings,
    },
  });
};

// @desc    Get top rated chefs
// @route   GET /api/chefs/top
// @access  Public
const getTopChefs = async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;

  const chefs = await Chef.findAll({
    where: { isVerified: true },
    include: [{
      model: User,
      as: 'user',
      attributes: ['id', 'name', 'avatar']
    }],
    order: [['rating', 'DESC'], ['totalBookings', 'DESC']],
    limit
  });

  res.status(200).json({
    success: true,
    data: chefs,
  });
};

// @desc    Search chefs
// @route   GET /api/chefs/search
// @access  Public
const searchChefs = async (req, res) => {
  const { query, city, minRating } = req.query;

  let where = { isVerified: true };

  if (query) {
    where[Op.or] = [
      { name: { [Op.like]: `%${query}%` } },
      { bio: { [Op.like]: `%${query}%` } },
      { signatureDishes: { [Op.like]: `%${query}%` } }
    ];
  }

  if (city) {
    where.city = { [Op.like]: `%${city}%` };
  }

  if (minRating) {
    where.rating = { [Op.gte]: parseFloat(minRating) };
  }

  const chefs = await Chef.findAll({
    where,
    include: [{
      model: User,
      as: 'user',
      attributes: ['id', 'name', 'avatar']
    }],
    limit: 20
  });

  res.status(200).json({
    success: true,
    data: chefs,
  });
};

module.exports = {
  getChefs,
  getChefById,
  createChefProfile,
  updateChefProfile,
  getChefAvailability,
  getTopChefs,
  searchChefs,
};