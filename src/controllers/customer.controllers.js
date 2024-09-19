import Customer from "../models/customer.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getCustomerById = asyncHandler(async (req, res, next) => {
  try {
    // Extract customer ID from request parameters
    const { id } = req.params;

    // Validate the ID (basic validation)
    if (!id || id.length !== 24) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format.",
      });
    }

    // Fetch the customer by ID
    const customer = await Customer.findById(id);

    // If customer not found, return 404
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    // Return the customer data
    return res.status(200).json({
      success: true,
      data: customer,
      message: "Customer data retrieved successfully.",
    });
  } catch (error) {
    console.error("Error fetching customer data by ID:", error);
    next(new ApiError(500, "Internal server error."));
  }
});
const getcustomerBooking = asyncHandler(async (req, res, next) => {
  try {
    // Extract page and limit from query parameters
    let { page = 1, limit = 10 } = req.query;

    // Convert to integers and set defaults
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    // Calculate the starting index
    const startIndex = (page - 1) * limit;

    // Fetch the total number of customers
    const totalCustomers = await Customer.countDocuments();

    // Fetch the customers for the current page
    const customers = await Customer.find()
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalCustomers / limit);

    return res.status(200).json(
      new ApiResponse(200, {
        customers,
        totalCustomers,
        totalPages,
        currentPage: page,
      }, "Customer data retrieved successfully.")
    );
  } catch (error) {
    console.error("Error fetching customer data:", error);
    next(new ApiError(500, "Internal server error."));
  }
});
const deleteCustomerById = asyncHandler(async (req, res, next) => {
  try {
    // Extract customer ID from request parameters
    const { id } = req.params;

    // Validate the ID (basic validation)
    if (!id || id.length !== 24) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format.",
      });
    }

    // Delete the customer by ID
    const result = await Customer.findByIdAndDelete(id);

    // If customer not found, return 404
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Customer deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting customer:", error);
    next(new ApiError(500, "Internal server error."));
  }
});

export { getcustomerBooking,getCustomerById,deleteCustomerById};
