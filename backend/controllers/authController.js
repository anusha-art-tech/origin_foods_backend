const asyncHandler = require('express-async-handler');
const { User, Chef, Cuisine } = require('../models');
const { buildFileUrl } = require('../middleware/uploadMiddleware');

const parseList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

const getUploadedProfileImage = (req) => req.files?.profileImage?.[0]
  ? buildFileUrl(req, req.files.profileImage[0])
  : null;

const getUploadedGalleryImages = (req) => (req.files?.galleryImages || []).map((file) => buildFileUrl(req, file));

const buildAuthPayload = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] },
  });

  const chefProfile = user.role === 'chef'
    ? await Chef.findOne({
      where: { userId },
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      include: [{
        model: Cuisine,
        attributes: ['id', 'name', 'description', 'icon', 'createdByChefId'],
        through: { attributes: [] },
      }],
    })
    : null;

  return { user, chefProfile };
};

const sendTokenResponse = async (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const data = await buildAuthPayload(user.id);

  res.status(statusCode).json({
    success: true,
    token,
    data,
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role = 'customer',
    phone,
    address,
    city,
    state,
    country,
    zipCode,
    cuisine,
    bio,
    experience,
    pricePerService,
    pricePerGuest,
    travelFee,
    serviceRadius,
    signatureDishes,
    languages,
    specialties,
    dietaryOptions,
    certifications,
    serviceAreas,
    minimumGuests,
    maxGuests,
    responseTime,
    sampleMenu,
    kitchenRequirements,
    allergenExperience,
  } = req.body;

  if (role === 'admin') {
    res.status(403);
    throw new Error('Admin registration is not allowed');
  }

  const userExists = await User.findOne({ where: { email } });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    phone,
    address,
    city,
    state,
    country,
    zipCode,
    isVerified: role === 'chef',
  });

  if (role === 'chef') {
    const uploadedProfileImage = getUploadedProfileImage(req);
    const uploadedGalleryImages = getUploadedGalleryImages(req);

    await Chef.create({
      userId: user.id,
      name,
      cuisine,
      bio: bio || 'Chef profile pending update.',
      experience: Number(experience) || 0,
      pricePerService: Number(pricePerService) || 0,
      pricePerGuest: Number(pricePerGuest) || 0,
      travelFee: Number(travelFee) || 0,
      serviceRadius: Number(serviceRadius) || 20,
      minimumGuests: Number(minimumGuests) || 1,
      maxGuests: Number(maxGuests) || 12,
      responseTime: responseTime || 'Usually responds within 24 hours',
      address,
      city,
      state,
      country,
      zipCode,
      profileImage: uploadedProfileImage,
      specialties: parseList(specialties),
      dietaryOptions: parseList(dietaryOptions),
      signatureDishes: parseList(signatureDishes),
      languages: parseList(languages),
      certifications: parseList(certifications),
      serviceAreas: parseList(serviceAreas),
      galleryImages: uploadedGalleryImages,
      sampleMenu: sampleMenu || null,
      kitchenRequirements: kitchenRequirements || null,
      allergenExperience: allergenExperience || null,
      isVerified: true,
    });
  }

  await sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide an email and password');
  }

  const user = await User.findOne({ where: { email } });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  await sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const data = await buildAuthPayload(req.user.id);

  res.status(200).json({
    success: true,
    data,
  });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
const updateDetails = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    country: req.body.country,
    zipCode: req.body.zipCode,
  };

  await User.update(fieldsToUpdate, {
    where: { id: req.user.id },
  });

  if (req.user.role === 'chef') {
    await Chef.update({
      name: req.body.name,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      country: req.body.country,
      zipCode: req.body.zipCode,
    }, {
      where: { userId: req.user.id },
    });
  }

  const data = await buildAuthPayload(req.user.id);

  res.status(200).json({
    success: true,
    data,
  });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
const updatePassword = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);

  if (!(await user.matchPassword(req.body.currentPassword))) {
    res.status(401);
    throw new Error('Password is incorrect');
  }

  user.password = req.body.newPassword;
  await user.save();

  await sendTokenResponse(user, 200, res);
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  logout,
};
