// quoteController.js

const RideQuote = require("../models/rideQuote");

// Get all ride quotes
const getAllQuotes = async (req, res) => {
    try {
      // Fetch all ride quotes from the database
      const quotes = await RideQuote.find();
  console.log("All quotes: ", quotes)
      // Send a success response with the quotes data
      res.status(200).json({
        success: true,
        data: quotes,
      });
    } catch (error) {
      // Handle errors
      console.error("Error fetching ride quotes: ", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch ride quotes",
        error: error.message,
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
const updateQuote = async (req, res) => {
    try {
        console.log("req.params: ", req?.params);
        console.log("req.body: ", req?.body);
      const { id } = req.params; // Get the quote ID from the request parameters
      const updateData = req.body; // Get the updated data from the request body
  
      // Validate the presence of update data
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No data provided for update" });
      }
  
      // Find the quote by ID and update it with the provided data
      const updatedQuote = await RideQuote.findByIdAndUpdate(
        id,
        updateData,
        { new: true } // Return the updated document
      );
  
      // Check if the quote was found and updated
      if (!updatedQuote) {
        return res.status(404).json({ message: "Quote not found" });
      }
  
      // Send the updated quote back as a response
      res.status(200).json({
        success: true,
        data: updatedQuote,
      });
    } catch (error) {
      console.error("Error updating quote:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update quote",
        error: error.message,
      });
    }
  };
  
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


const searchQuotesByDate = async (req, res) => {
    try {
        // Ensure the method is POST
        if (req.method !== 'POST') {
            return res.status(405).json({ message: "Method Not Allowed" });
        }

        // Extract startDate and endDate from the request body
        const { startDate, endDate } = req.body;

        // Ensure both dates are provided
        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Start and end dates are required" });
        }

        // Convert dates to JavaScript Date objects for comparison
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Make sure end date includes the entire day by setting time to 23:59:59
        end.setHours(23, 59, 59, 999);
        console.log("Filtering quotes between:", start, end);

        // Find all quotes between the provided date range
        const quotes = await RideQuote.find({
            createdAt: { 
                $gte: start, 
                $lte: end 
            },
            quoteType: "completed"
        });
        console.log("Filtered quotes:", quotes);
        if (quotes.length === 0) {
            return res.status(404).json({ message: "No quotes found" });
        }

        res.status(200).json(quotes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// const searchQuotesByDate = async (req, res) => {
//     try {
//         // Ensure the method is POST
//         if (req.method !== 'POST') {
//             return res.status(405).json({ message: "Method Not Allowed" });
//         }

//         // Extract startDate and endDate from the request body
//         const { startDate, endDate } = req.body;

//         // Ensure both dates are provided
//         if (!startDate || !endDate) {
//             return res.status(400).json({ message: "Start and end dates are required" });
//         }

//         // Convert dates to JavaScript Date objects for comparison
//         const start = new Date(startDate);
//         const end = new Date(endDate);

//         // Make sure end date includes the entire day by setting time to 23:59:59
//         end.setHours(23, 59, 59, 999);
//         console.log("Filtering quotes between:", start, end);

//         // Find all quotes between the provided date range and with quoteType "completed"
//         const quotes = await RideQuote.find({
//             createdAt: { 
//                 $gte: start, 
//                 $lte: end 
//             },
//             quoteType: "completed" // Additional filter for completed quotes
//         });

//         console.log("Filtered quotes:", quotes);

//         // Check if no quotes were found
//         if (quotes.length === 0) {
//             return res.status(404).json({ message: "No completed quotes found" });
//         }

//         // Calculate the total count of quotes
//         const totalCount = quotes.length;

//         // Calculate the total amount (excluding refunds)
//         const totalAmount = quotes.reduce((acc, quote) => {
//             // Assuming that each quote has an `amount` field and a `refund` field
//             if (!quote.refund) { // Only include quotes that are not refunded
//                 return acc + quote.amount;
//             }
//             return acc;
//         }, 0);

//         // Send response with the quotes, count, and total amount
//         res.status(200).json({
//             totalCount,        // Total count of quotes
//             totalAmount,       // Total amount excluding refunds
//             quotes             // The filtered quotes
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Server error" });
//     }
// };

  
module.exports = {
  getAllQuotes,
  getSingleQuote,
  updateQuote,
  searchQuotes,
  searchQuotesByDate
};
