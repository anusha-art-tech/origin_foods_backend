const asyncHandler = require('express-async-handler');
const { Chef, User, Review, Booking, Cuisine } = require('../models');
const { Op } = require('sequelize');
const { buildFileUrl } = require('../middleware/uploadMiddleware');

const parseList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

const cuisineInclude = {
  model: Cuisine,
  attributes: ['id', 'name', 'description', 'icon', 'createdByChefId'],
  through: { attributes: [] },
};

const getUploadedProfileImage = (req) => req.files?.profileImage?.[0]
  ? buildFileUrl(req, req.files.profileImage[0])
  : null;

const getUploadedGalleryImages = (req) => (req.files?.galleryImages || []).map((file) => buildFileUrl(req, file));

const getExistingGalleryImages = (req) => parseList(req.body.existingGalleryImages);

const resolveGalleryImages = (req, currentGalleryImages = []) => {
  const uploadedGalleryImages = getUploadedGalleryImages(req);

  if (uploadedGalleryImages.length > 0) {
    return [...getExistingGalleryImages(req), ...uploadedGalleryImages];
  }

  if (req.body.existingGalleryImages !== undefined) {
    return getExistingGalleryImages(req);
  }

  if (req.body.galleryImages !== undefined) {
    return parseList(req.body.galleryImages);
  }

  return currentGalleryImages;
};

// @desc    Get all chefs
// @route   GET /api/chefs
// @access  Public
const getChefs = asyncHandler(async (req, res) => {
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
      { cuisine: { [Op.like]: `%${req.query.search}%` } }
    ];
  }

  const { count, rows } = await Chef.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'avatar']
      },
      cuisineInclude,
    ],
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
});

// @desc    Get single chef
// @route   GET /api/chefs/:id
// @access  Public
const getChefById = asyncHandler(async (req, res) => {
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
      },
      cuisineInclude,
    ]
  });

  if (!chef) {
    res.status(404);
    throw new Error('Chef not found');
  }

  res.status(200).json({
    success: true,
    data: chef,
  });
});

// @desc    Create chef profile
// @route   POST /api/chefs
// @access  Private
const createChefProfile = asyncHandler(async (req, res) => {
  const existingChef = await Chef.findOne({ where: { userId: req.user.id } });
  if (existingChef) {
    res.status(400);
    throw new Error('Chef profile already exists');
  }

  await User.update({ role: 'chef' }, { where: { id: req.user.id } });

  const chef = await Chef.create({
    userId: req.user.id,
    name: req.body.name,
    cuisine: req.body.cuisine,
    bio: req.body.bio,
    experience: req.body.experience,
    pricePerService: req.body.pricePerService,
    pricePerGuest: req.body.pricePerGuest,
    travelFee: req.body.travelFee || 0,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    country: req.body.country,
    zipCode: req.body.zipCode,
    serviceRadius: req.body.serviceRadius || 20,
    profileImage: getUploadedProfileImage(req),
    specialties: parseList(req.body.specialties),
    dietaryOptions: parseList(req.body.dietaryOptions),
    signatureDishes: parseList(req.body.signatureDishes),
    languages: parseList(req.body.languages),
    certifications: parseList(req.body.certifications),
    serviceAreas: parseList(req.body.serviceAreas),
    galleryImages: resolveGalleryImages(req),
    minimumGuests: req.body.minimumGuests || 1,
    maxGuests: req.body.maxGuests || 12,
    responseTime: req.body.responseTime || 'Usually responds within 24 hours',
    sampleMenu: req.body.sampleMenu || null,
    kitchenRequirements: req.body.kitchenRequirements || null,
    allergenExperience: req.body.allergenExperience || null,
    availability: req.body.availability || {}
  });

  res.status(201).json({
    success: true,
    data: chef,
  });
});

// @desc    Update chef profile
// @route   PUT /api/chefs/:id
// @access  Private
const updateChefProfile = asyncHandler(async (req, res) => {
  let chef = await Chef.findByPk(req.params.id);

  if (!chef) {
    res.status(404);
    throw new Error('Chef not found');
  }

  if (chef.userId !== req.user.id && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to update this profile');
  }

  const updatePayload = {
    ...req.body,
    profileImage: getUploadedProfileImage(req) || chef.profileImage,
    specialties: req.body.specialties !== undefined ? parseList(req.body.specialties) : chef.specialties,
    dietaryOptions: req.body.dietaryOptions !== undefined ? parseList(req.body.dietaryOptions) : chef.dietaryOptions,
    signatureDishes: req.body.signatureDishes !== undefined ? parseList(req.body.signatureDishes) : chef.signatureDishes,
    languages: req.body.languages !== undefined ? parseList(req.body.languages) : chef.languages,
    certifications: req.body.certifications !== undefined ? parseList(req.body.certifications) : chef.certifications,
    serviceAreas: req.body.serviceAreas !== undefined ? parseList(req.body.serviceAreas) : chef.serviceAreas,
    galleryImages: resolveGalleryImages(req, chef.galleryImages),
  };

  await chef.update(updatePayload);

  res.status(200).json({
    success: true,
    data: chef,
  });
});

// @desc    Get chef availability
// @route   GET /api/chefs/:id/availability
// @access  Public
const getChefAvailability = asyncHandler(async (req, res) => {
  const chef = await Chef.findByPk(req.params.id, {
    attributes: ['availability']
  });

  if (!chef) {
    res.status(404);
    throw new Error('Chef not found');
  }

  const bookings = await Booking.findAll({
    where: {
      chefId: req.params.id,
      status: { [Op.in]: ['pending', 'confirmed'] },
      date: { [Op.gte]: new Date().toISOString().split('T')[0] }
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
});

// @desc    Get top rated chefs
// @route   GET /api/chefs/top
// @access  Public
const getTopChefs = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;

  const chefs = await Chef.findAll({
    where: { isVerified: true },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'avatar']
      },
      cuisineInclude,
    ],
    order: [['rating', 'DESC'], ['totalBookings', 'DESC']],
    limit
  });

  res.status(200).json({
    success: true,
    data: chefs,
  });
});

// @desc    Search chefs
// @route   GET /api/chefs/search
// @access  Public
const searchChefs = asyncHandler(async (req, res) => {
  const { query, city, minRating } = req.query;

  let where = { isVerified: true };

  if (query) {
    where[Op.or] = [
      { name: { [Op.like]: `%${query}%` } },
      { bio: { [Op.like]: `%${query}%` } },
      { cuisine: { [Op.like]: `%${query}%` } }
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
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'avatar']
      },
      cuisineInclude,
    ],
    limit: 20
  });

  res.status(200).json({
    success: true,
    data: chefs,
  });
});

// @desc    Get chef cuisines
// @route   GET /api/chefs/:id/cuisines
// @access  Public
const getChefCuisines = asyncHandler(async (req, res) => {
  const chef = await Chef.findByPk(req.params.id, {
    include: [cuisineInclude],
  });

  if (!chef) {
    res.status(404);
    throw new Error('Chef not found');
  }

  res.status(200).json({
    success: true,
    data: chef.Cuisines || [],
  });
});

// @desc    Create cuisine for chef
// @route   POST /api/chefs/:id/cuisines
// @access  Private/Chef
const createChefCuisine = asyncHandler(async (req, res) => {
  const chef = await Chef.findByPk(req.params.id);

  if (!chef) {
    res.status(404);
    throw new Error('Chef not found');
  }

  if (chef.userId !== req.user.id && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to manage cuisines for this chef');
  }

  const cuisine = await Cuisine.create({
    name: req.body.name,
    description: req.body.description || null,
    icon: req.body.icon || null,
    createdByChefId: chef.id,
    isActive: true,
  });

  await chef.addCuisine(cuisine);

  res.status(201).json({
    success: true,
    data: cuisine,
  });
});

// @desc    Update chef cuisine
// @route   PUT /api/chefs/:id/cuisines/:cuisineId
// @access  Private/Chef
const updateChefCuisine = asyncHandler(async (req, res) => {
  const chef = await Chef.findByPk(req.params.id);

  if (!chef) {
    res.status(404);
    throw new Error('Chef not found');
  }

  if (chef.userId !== req.user.id && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to manage cuisines for this chef');
  }

  const cuisine = await Cuisine.findByPk(req.params.cuisineId);

  if (!cuisine) {
    res.status(404);
    throw new Error('Cuisine not found');
  }

  if (cuisine.createdByChefId !== chef.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Only cuisines created by this chef can be edited');
  }

  await cuisine.update({
    name: req.body.name ?? cuisine.name,
    description: req.body.description ?? cuisine.description,
    icon: req.body.icon ?? cuisine.icon,
  });

  res.status(200).json({
    success: true,
    data: cuisine,
  });
});

// @desc    Delete chef cuisine
// @route   DELETE /api/chefs/:id/cuisines/:cuisineId
// @access  Private/Chef
const deleteChefCuisine = asyncHandler(async (req, res) => {
  const chef = await Chef.findByPk(req.params.id);

  if (!chef) {
    res.status(404);
    throw new Error('Chef not found');
  }

  if (chef.userId !== req.user.id && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to manage cuisines for this chef');
  }

  const cuisine = await Cuisine.findByPk(req.params.cuisineId);

  if (!cuisine) {
    res.status(404);
    throw new Error('Cuisine not found');
  }

  if (cuisine.createdByChefId !== chef.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Only cuisines created by this chef can be deleted');
  }

  await chef.removeCuisine(cuisine);
  await cuisine.destroy();

  res.status(200).json({
    success: true,
    message: 'Cuisine removed successfully',
  });
});

module.exports = {
  getChefs,
  getChefById,
  createChefProfile,
  updateChefProfile,
  getChefAvailability,
  getTopChefs,
  searchChefs,
  getChefCuisines,
  createChefCuisine,
  updateChefCuisine,
  deleteChefCuisine,
};
