const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { encrypt, decrypt } = require("../utils/encryption");
const nodemailer = require("nodemailer");

// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// const stripe = require('stripe')('sk_test_51OfdGbSICzhlc2ExXZTGWX1RAoiXt2BpG7wtOK0UkcEBVmnHptdlWp9wSE9dgfmZdTXn4aibnCr4MbOfOfYA1D1r00nFEOOfWQ');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20", // Replace with the version you're using
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
const registerUser = async (req, res) => {
  console.log("req: ", req.body);
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    role, // Assuming role is still required
    paymentMethodId,
    stripeCustomerId,
    setupIntentClientSecret,
    address,
    billingDetails,
  } = req.body;

  // Validate required fields
  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !phone ||
    !role || // Assuming role is still required
    !paymentMethodId ||
    !stripeCustomerId ||
    !setupIntentClientSecret ||
    !address ||
    !address.line1 ||
    !address.city ||
    !address.state ||
    !address.postal_code ||
    !address.country ||
    !billingDetails ||
    !billingDetails.cardHolderName ||
    !billingDetails.cardType ||
    !billingDetails.expirationDate ||
    !billingDetails.last4
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if a user with the provided email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email is already registered" });
    }

    // Encrypt the password before saving it to the database
    const hashedPassword = encrypt(password);

    // Create a new user document with the provided data
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      role, // Saving role
      stripeCustomerId,
      setupIntentClientSecret,
      paymentMethodId,
      address, // Save the address in the user document
      billingDetails, // Save billingDetails in the user document
    });

    // Save the new user document to the database
    await newUser.save();

    // Respond with a success message along with user details and a token
    res.status(201).json({
      _id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role, // Assuming role is still required in response
      address: newUser.address,
      billingDetails: newUser.billingDetails,
      token: generateToken(newUser._id),
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error registering user" });
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
        phone: user.phone,
        address: user.address,
        billingDetails: user.billingDetails,
        stripeCustomerId: user.stripeCustomerId,
        paymentMethodId: user.paymentMethodId,
        setupIntentClientSecret: user.setupIntentClientSecret,
        role: user.role,
        selectedReservations: user.selectedReservations,
        companyProfile: user.companyProfile,
        vehiclesDetails: user.vehiclesDetails,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
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

const verifyPassword = async (req, res) => {
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
  console.log("Stripe Secret Key:", process.env.STRIPE_SECRET_KEY); // Make sure it logs correctly (remove it afterward for security)

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
    return res.status(400).json({
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
      // payment_method_types: ['card'],
      usage: "off_session",
    });

    res.json({ setupIntentClientSecret: setupIntent.client_secret });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: "Error creating setup intent." });
  }
};

// Function to retrieve payment method details from Stripe
const getPaymentMethod = async (req, res) => {
  try {
    // Extract paymentMethodId from request body
    const { paymentMethodId } = req.body;

    if (!paymentMethodId) {
      return res.status(400).json({ error: "Payment Method ID is required" });
    }

    // Fetch payment method details from Stripe using the provided paymentMethodId
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    // Respond with the payment method details
    return res.status(200).json({ paymentMethod });
  } catch (error) {
    // Handle errors and respond with appropriate message
    console.error("Stripe Error:", error);
    return res.status(500).json({ error: error.message });
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
  if (req.method === "POST") {
    const { lastName, email, phone } = req.body;
    console.log("Received Request Body:", { lastName, email, phone });

    try {
      // Using findOne to search for a single user
      const user = await User.findOne({
        lastName: new RegExp(`^${lastName}$`, "i"), // Case-insensitive match
        email: new RegExp(`^${email}$`, "i"),
        phone: new RegExp(`^${phone}$`, "i"),
      });

      console.log("User found:", user);

      // If no user is found, return a 404 response
      if (!user) {
        console.log("No user found");
        return res.status(404).json({ message: "User not found" });
      }

      // Return the found user
      return res.status(200).json({ user });
    } catch (error) {
      console.error("Error fetching user details:", error);
      return res.status(500).json({
        message: "Error fetching user details",
        error: error.message || "Unknown Error",
      });
    }
  } else {
    // Method not allowed
    return res.status(405).json({ message: "Method Not Allowed" });
  }
};

// Search Reservation Function
const searchByPhone = async (req, res) => {
  if (req.method === "POST") {
    const { phone } = req.body;
    console.log("Received Request Body:", { phone });

    try {
      const user = await User.findOne({
        phone: new RegExp(`^${phone}$`, "i"),
      });

      console.log("Users found:", user);

      if (user.length === 0) {
        console.log("No user found");
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({ user: user });
    } catch (error) {
      console.error("Error fetching user details:", error);
      return res.status(500).json({
        message: "Error fetching user details",
        error: error.message || "Unknown Error",
      });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
};

const getAllReservations = async (req, res) => {
  if (req.method === "GET") {
    try {
      const reservations = await User.find({}); // Fetch all reservations
      return res.status(200).json({ reservations });
    } catch (error) {
      console.error("Error fetching all reservations:", error);
      return res
        .status(500)
        .json({ message: "Error fetching all reservations." });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
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
        companyProfile: user.companyProfile,
        vehiclesDetails: user.vehiclesDetails,
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
const getUsersByIds = async (req, res) => {
  try {
    const { ids } = req.query;

    if (!ids) {
      return res.status(400).json({ message: "User IDs are required." });
    }

    const idsArray = Array.isArray(ids) ? ids : ids.split(",");
    console.log("idsArray: ", idsArray);
    const users = await User.find({ _id: { $in: idsArray } });
    console.log("users", users);
    if (users.length > 0) {
      res.json(users);
    } else {
      res.status(404).json({ message: "No users found." });
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
    const { id } = req.params; // Extract id from the URL parameters
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
    console.log("Requested Data: ", req.body);
    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the company profile details if provided, otherwise keep the existing ones
    user.companyProfile.businessName =
      businessName || user.companyProfile.businessName;

    user.companyProfile.address = {
      line1: address?.line1 || user.companyProfile.address.line1,
      city: address?.city || user.companyProfile.address.city,
      state: address?.state || user.companyProfile.address.state,
      postal_code:
        address?.postal_code || user.companyProfile.address.postal_code,
      country: address?.country || user.companyProfile.address.country,
    };

    user.companyProfile.metroArea = metroArea || user.companyProfile.metroArea;
    user.companyProfile.officePhone =
      officePhone || user.companyProfile.officePhone;
    user.companyProfile.cellPhone = cellPhone || user.companyProfile.cellPhone;
    user.companyProfile.operatorLicense =
      operatorLicense || user.companyProfile.operatorLicense;
    user.companyProfile.taxId = taxId || user.companyProfile.taxId;
    user.companyProfile.area = area || user.companyProfile.area;
    user.companyProfile.notification =
      notification || user.companyProfile.notification;
    user.companyProfile.nlaMember = nlaMember || user.companyProfile.nlaMember;

    // Save the updated user
    const updatedCompany = await user.save(); // Save method to update the user record in DB

    return res.json({
      message: "Company profile updated successfully",
      company: updatedCompany,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating company profile",
      error: error.message,
    });
  }
};
const updateDriverBillingDetails = async (req, res) => {
  try {
    const { id } = req.params; // Extract id from the URL parameters
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
    console.log("Requested Data: ", req.body);
    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the company profile details if provided, otherwise keep the existing ones
    user.companyProfile.businessName =
      businessName || user.companyProfile.businessName;

    user.companyProfile.address = {
      line1: address?.line1 || user.companyProfile.address.line1,
      city: address?.city || user.companyProfile.address.city,
      state: address?.state || user.companyProfile.address.state,
      postal_code:
        address?.postal_code || user.companyProfile.address.postal_code,
      country: address?.country || user.companyProfile.address.country,
    };

    user.companyProfile.metroArea = metroArea || user.companyProfile.metroArea;
    user.companyProfile.officePhone =
      officePhone || user.companyProfile.officePhone;
    user.companyProfile.cellPhone = cellPhone || user.companyProfile.cellPhone;
    user.companyProfile.operatorLicense =
      operatorLicense || user.companyProfile.operatorLicense;
    user.companyProfile.taxId = taxId || user.companyProfile.taxId;
    user.companyProfile.area = area || user.companyProfile.area;
    user.companyProfile.notification =
      notification || user.companyProfile.notification;
    user.companyProfile.nlaMember = nlaMember || user.companyProfile.nlaMember;

    // Save the updated user
    const updatedCompany = await user.save(); // Save method to update the user record in DB

    return res.json({
      message: "Company profile updated successfully",
      company: updatedCompany,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating company profile",
      error: error.message,
    });
  }
};
const addOrUpdateVehicleDetails = async (req, res) => {
  const { userId } = req.params; // Get userId from the URL parameters
  const { vehicleData } = req.body; // Get vehicleData from the request body
console.log("vehicleData: ", vehicleData)
  try {
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Add or update vehicle details
    user.vehiclesDetails = vehicleData;

    // Save the updated user document
    await user.save();

    return res
      .status(200)
      .json({ message: "Vehicle details updated successfully", user });
  } catch (error) {
    console.error("Error updating vehicle details:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
// const updateUserData = async (req, res) => {
//   const { userId } = req.params;
//   const userData = req.body;
//   const newReservation = userData.selectedReservations[0];

//   try {
//     const existingUser = await User.findById(userId);

//     if (!existingUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const reservationExists = existingUser.selectedReservations.some(
//       (r) =>
//         r?.reservation?._id?.toString() ===
//         newReservation?.reservation?._id?.toString()
//     );

//     if (reservationExists) {
//       return res.status(400).json({ message: "Reservation already accepted" });
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       {
//         $push: {
//           selectedReservations: {
//             reservation: newReservation.reservation,
//             rideStatus: newReservation.rideStatus,
//           },
//         },
//       },
//       { new: true }
//     );

//     res.status(200).json(updatedUser);
//   } catch (error) {
//     console.error("Error updating user data:", error);
//     res.status(500).json({ message: "Internal server error", error });
//   }
// };
// const updateUserData = async (req, res) => {
//   const { userId } = req.params;
//   const userData = req.body;
//   const newReservation = userData.selectedReservations[0];
//   console.log("newReservation: ", newReservation)
//   try {
//     const existingUser = await User.findById(userId);

//     if (!existingUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Find the index of the existing reservation in the array
//     const reservationIndex = existingUser.selectedReservations.findIndex(
//       (r) =>
//         r?.reservationId?.toString() ===
//         newReservation?.reservation?._id?.toString()
//     );

//     if (reservationIndex > -1) {
//       // Reservation exists, so update it using $set
//       const updatedUser = await User.findOneAndUpdate(
//         { _id: userId, "selectedReservations.reservationId": newReservation.reservation._id },
//         {
//           $set: {
//             selectedReservations: {
//               reservation: newReservation.reservation,
//               rideStatus: newReservation.rideStatus,
//               userId: newReservation.userId,
//               reservationId: newReservation._id,
//             },
//           },
//         },
//         { new: true }
//       );
//       return res.status(200).json(updatedUser);
//     }
//     res.status(200).json(updatedUser);
//   } catch (error) {
//     console.error("Error updating user data:", error);
//     res.status(500).json({ message: "Internal server error", error });
//   }
// };
const updateUserData = async (req, res) => {
  const { userId } = req.params;
  const userData = req.body;

  const newReservation = userData.selectedReservations[0];

  try {
    const existingUser = await User.findById(userId);

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Directly update the existing reservation
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, "selectedReservations.reservationId": newReservation.reservation._id },
      {
        $set: {
          "selectedReservations.$.reservation": newReservation.reservation,
          "selectedReservations.$.rideStatus": newReservation.rideStatus,
        },
      },
      { new: true }
    );

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user data:", error);
    return res.status(500).json({ message: "An error occurred while updating user data", error });
  }
};



const updateDriverData = async (req, res) => {
  const { driverId } = req.params;
  const driverData = req.body;
  const newReservation = driverData.selectedReservations[0];

  try {
    const existingDriver = await User.findById(driverId);

    if (!existingDriver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const reservationExists = existingDriver.selectedReservations.some(
      (r) =>
        r?.reservation?._id?.toString() ===
        newReservation?.reservation?._id?.toString()
    );

    if (reservationExists) {
      return res.status(400).json({ message: "Reservation already exists" });
    }

    const updatedDriver = await User.findByIdAndUpdate(
      driverId,
      {
        $push: {
          selectedReservations: {
            reservation: newReservation.reservation,
            rideStatus: newReservation.rideStatus,
            userId: newReservation.userId, // storing userId
            reservationId: newReservation._id,
          },
        },
      },
      { new: true }
    );

    res.status(200).json(updatedDriver);
  } catch (error) {
    console.error("Error updating driver data:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

module.exports = {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
  updateUserData,
  updateDriverData,
  verifyPassword,
  getAllUsers,
  changePassword,
  createCheckoutSession,
  createCustomer,
  createPaymentIntent,
  createSetupIntent,
  getPaymentMethod,
  findAccount,
  forgotPassword,
  resetPassword,
  searchReservation,
  getUserById,
  getUsersByIds,
  getAllReservations,
  searchByPhone,
  updateCompanyProfile,
  updateDriverBillingDetails,
  addOrUpdateVehicleDetails,
};
