// quoteController.js

const RideQuote = require("../models/rideQuote");

// Get all quotes function
const getAllQuotes = async (req, res) => {
  try {
    // Fetch all quotes from the database
    const quotes = await RideQuote.find();

    // Return the quotes with a 200 status
    res.status(200).json(quotes);
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error fetching quotes:", error);

    // Return a 500 status with an error message
    res.status(500).json({
      message:
        error.message || "An unknown error occurred while fetching quotes",
    });
  }
};

// Get a single quote by ID
const getSingleQuote = async (req, res) => {
  try {
    const quote = await RideQuote.findById(req.params.id);
    if (!quote) return res.status(404).json({ message: "Quote not found" });
    res.status(200).json(quote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search quotes by vehicle type and state
// const searchQuotes = async (req, res) => {
//   try {
//     const { vehicleType, state } = req.query;

//     // Build query object
//     const query = {};
//     if (vehicleType) query["selectedRide.vehicleType"] = vehicleType;
//     if (state) query["selectedRide.state"] = state;

//     const quotes = await RideQuote.find(query);
//     res.status(200).json(quotes);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
const searchQuotes = async (req, res) => {
    try {
        const { vehicleType, rideType } = req.query;
        console.log("Vehicle Type:", vehicleType); // Log vehicleType
        console.log("Ride Type:", rideType);  // Log rideType
        
        // Build query object
        const query = {};
        if (vehicleType) {
            query["selectedRide.carName"] = vehicleType;
        }

        if (rideType) {
            query["rideType"] = rideType;
        }

        console.log("Query object:", query); // Log the final query object

        const quotes = await RideQuote.find(query);

        res.status(200).json(quotes);
    } catch (error) {
        console.error("Error searching quotes:", error);
        res.status(500).json({
            message: error.message || "An unknown error occurred while searching quotes",
        });
    }
};



module.exports = {
  getAllQuotes,
  getSingleQuote,
  searchQuotes,
};
