const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Stripe = require("stripe");
const { encrypt, decrypt } = require("../utils/encryption");
const nodemailer = require("nodemailer");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});
// Function to generate a JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
registerUser = async (req, res) => {
  const { firstName, lastName, email, password, phone, role } = req.body;
  console.log("Request", req);
  if (!firstName || !lastName || !email || !password || !phone || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = encrypt(password);

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      role,
      password: hashedPassword,
    });
    console.log("User", user);
    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
authUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (user && decrypt(user.password) === password) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error authenticating user", error });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    // Extract userId from request parameters
    const { id } = req.params;

    // Find the user by ID
    const user = await User.findById(id);

    if (user) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile", error });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    // Extract userId from request parameters
    const { id } = req.params;
    const { password, newPassword, firstName, lastName, email } = req.body;

    // Find the user by ID
    const user = await User.findById(id);

    if (user) {
      // Verify current password
      const decryptedPassword = decrypt(user.password);
      if (password && decryptedPassword !== password) {
        return res
          .status(400)
          .json({ valid: false, message: "Current password is incorrect" });
      }

      // Update user details
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.email = email || user.email;

      // Update password if new password is provided
      if (newPassword) {
        user.password = encrypt(newPassword);
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating user profile", error });
  }
};

const verifypassword = async (req, res) => {
  const { userId, password } = req.body;
  try {
    const user = await User.findById(userId);
    if (user) {
      const decryptedPassword = decrypt(user.password);
      if (password === decryptedPassword) {
        res.status(200).json({ valid: true });
      } else {
        res
          .status(400)
          .json({ valid: false, message: "Current password is incorrect" });
      }
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error verifying password", error });
  }
};
// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

changePassword = async (req, res) => {
  const { firstName, lastName, email, password, newPassword } = req.body;

  if (!firstName || !lastName || !email || !password || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await User.findOne({ email, firstName, lastName });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const decryptedPassword = decrypt(user.password);

    if (password !== decryptedPassword) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = encrypt(newPassword);
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Error changing password", error });
  }
};

createCheckoutSession = async (req, res) => {
  const { customerId } = req.body;

  if (!customerId) {
    return res.status(400).json({ error: "Customer ID is required" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "setup",
      payment_method_types: ["card"],
      customer: customerId,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Error creating checkout session" });
  }
};

createCustomer = async (req, res) => {
  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const customer = await stripe.customers.create({
      email,
      name,
    });

    res.json({ stripeCustomerId: customer.id });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: "Error creating customer." });
  }
};

createPaymentIntent = async (req, res) => {
  const {
    amount,
    stripeCustomerId,
    paymentMethodId,
    customerName,
    customerAddress,
  } = req.body;

  if (
    !amount ||
    !stripeCustomerId ||
    !paymentMethodId ||
    !customerName ||
    !customerAddress
  ) {
    return res
      .status(400)
      .json({
        error:
          "Amount, customer ID, payment method ID, customer name, and customer address are required",
      });
  }

  if (amount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      customer: stripeCustomerId,
      payment_method: paymentMethodId,
      description: "Ride booking donation payment",
      off_session: true,
      confirm: true,
      payment_method_types: ["card"],
      shipping: {
        name: customerName,
        address: customerAddress,
      },
    });

    res.json({ paymentIntent });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: "Error charging customer." });
  }
};

createSetupIntent = async (req, res) => {
  const { stripeCustomerId } = req.body;

  if (!stripeCustomerId) {
    return res.status(400).json({ error: "Customer ID is required" });
  }

  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      usage: "off_session",
    });

    res.json({ setupIntentClientSecret: setupIntent.client_secret });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: "Error creating setup intent." });
  }
};

findAccount = async (req, res) => {
  const { email, firstName, lastName } = req.body;

  if (!email || !firstName || !lastName) {
    return res
      .status(400)
      .json({ message: "Email, first name, and last name are required" });
  }

  try {
    const user = await User.findOne({ email, firstName, lastName });

    if (!user) {
      return res.status(400).json({ message: "Account not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error finding account", error });
  }
};

forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "No user found with that email" });
    }

    const resetToken = generateToken(user._id);
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${resetToken}`;
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: "Password Reset",
      html: `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Password reset link sent to email" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sending password reset email", error });
  }
};

const resetPassword = async (req, res) => {
  const { email, newPassword, resetToken } = await req.json();

  if (!token || !newPassword) {
    return res.status(400).json({ message: "Token and password are required" });
  }

  try {
    await dbConnect();
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 400 });
    }
    // Verify reset token (if provided)
    if (resetToken && user.resetPasswordToken !== resetToken) {
      return NextResponse.json({
        status: 400,
        message: "Invalid or expired reset token",
      });
    }

    // Encrypt the new password
    const encryptedPassword = encrypt(newPassword);

    // Update the user's password and clear any reset token fields
    user.password = encryptedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
// Search Reservation Function
const searchReservation = async (req, res) => {
  if (req.method === 'POST') {
    const { lastName, email, phone } = req.body;
    console.log('Received Request Body:', { lastName, email, phone });

    try {
      const user = await User.findOne({
        lastName: new RegExp(`^${lastName}$`, 'i'),
        email: new RegExp(`^${email}$`, 'i'),
        phone: new RegExp(`^${phone}$`, 'i'),
      });
      
      console.log('Users found:', user);

      if (user.length === 0) {
        console.log('No user found');
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({ user: user });
    } catch (error) {
      console.error('Error fetching user details:', error);
      return res.status(500).json({ message: 'Error fetching user details', error: error.message || 'Unknown Error' });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
};
// Search Reservation Function
const searchByPhone = async (req, res) => {
  if (req.method === 'POST') {
    const { phone } = req.body;
    console.log('Received Request Body:', { phone });

    try {
      const user = await User.findOne({
        phone: new RegExp(`^${phone}$`, 'i'),
      });
      
      console.log('Users found:', user);

      if (user.length === 0) {
        console.log('No user found');
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({ user: user });
    } catch (error) {
      console.error('Error fetching user details:', error);
      return res.status(500).json({ message: 'Error fetching user details', error: error.message || 'Unknown Error' });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
};




const getAllReservations = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const reservations = await User.find({}); // Fetch all reservations
      return res.status(200).json({ reservations });
    } catch (error) {
      console.error('Error fetching all reservations:', error);
      return res.status(500).json({ message: 'Error fetching all reservations.' });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
};

// @desc    Get user by ID
// @route   GET /api/user/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    // Extract userId from request parameters
    const { id } = req.params;

    // Find the user by ID
    const user = await User.findById(id);

    if (user) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address, // Include address details
        billingDetails: user.billingDetails, // Include billing details
        stripeCustomerId: user.stripeCustomerId,
        paymentMethodId: user.paymentMethodId,
        selectedReservations: user.selectedReservations, // Include reservations
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching user details", error });
  }
};
// @desc    Update company profile
// @route   PUT /api/company/profile
// @access  Private (Admin)
const updateCompanyProfile = async (req, res) => {
  try {
    const {
      businessName,
      address,
      metroArea,
      officePhone,
      cellPhone,
      operatorLicense,
      taxId,
      area,
      notification,
      nlaMember,
    } = req.body;

    const { id } = req.params;
    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update company details
    user.companyProfile.businessName = businessName || user.companyProfile.businessName;

    user.companyProfile.address = {
      line1: address?.line1 || user.companyProfile.address.line1,
      city: address?.city || user.companyProfile.address.city,
      state: address?.state || user.companyProfile.address.state,
      postal_code: address?.postal_code || user.companyProfile.address.postal_code,
      country: address?.country || user.companyProfile.address.country,
    };
    user.companyProfile.metroArea = metroArea || user.companyProfile.metroArea;
    user.companyProfile.officePhone = officePhone || user.companyProfile.officePhone;
    user.companyProfile.cellPhone = cellPhone || user.companyProfile.cellPhone;
    user.companyProfile.operatorLicense = operatorLicense || user.companyProfile.operatorLicense;
    user.companyProfile.taxId = taxId || user.companyProfile.taxId;
    user.companyProfile.area = area || user.companyProfile.area;
    user.companyProfile.notification = notification || user.companyProfile.notification;
    user.companyProfile.nlaMember = nlaMember || user.companyProfile.nlaMember;
    const updatedCompany = await User.save();
    res.json({
      message: "Company profile updated successfully",
      company: updatedCompany,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating company profile", error });
  }
};

module.exports = {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
  verifypassword,
  getAllUsers,
  changePassword,
  createCheckoutSession,
  createCustomer,
  createPaymentIntent,
  createSetupIntent,
  findAccount,
  forgotPassword,
  resetPassword,
  searchReservation,
  getUserById,
  getAllReservations,
  searchByPhone,
  updateCompanyProfile
};
