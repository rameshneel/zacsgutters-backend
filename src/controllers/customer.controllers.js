import Customer from "../models/customer.model.js";
import TimeSlot from "../models/timeSlotmodel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { calculateTotalPrice } from "../utils/priceCalculator.js";

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
const createCustomerByAdmin = asyncHandler(async (req, res, next) => {
  try {
    const {
      customerName,
      email,
      contactNumber,
      firstLineOfAddress,
      town,
      postcode,
      selectedDate,
      selectedTimeSlot,
      selectService,
      gutterCleaningOptions,
      gutterRepairsOptions,
      selectHomeType,
      selectHomeStyle,
      numberOfBedrooms,
      numberOfStories,
      paymentMethod,
      message,
    } = req.body;

    // Validate required fields
    if (
      !customerName ||
      !email ||
      !postcode ||
      !selectedDate ||
      !selectedTimeSlot ||
      !selectService
    ) {
      throw new ApiError(400, "Required fields are missing.");
    }

    const date = new Date(selectedDate);
    date.setUTCHours(0, 0, 0, 0);

    // Ensure that selectedDate is not today
    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0);
    if (date.getTime() === currentDate.getTime()) {
      throw new ApiError(400, "Bookings for today are not allowed.");
    }

    // Ensure that selectedDate is a weekday (Monday to Friday)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      throw new ApiError(400, "Bookings are only allowed from Monday to Friday.");
    }

    // Check if the time slot is available
    // let timeSlot = await TimeSlot.findOne({ date: date });

    // if (timeSlot) {
    //   const slot = timeSlot.slots.find(s => s.time === selectedTimeSlot);
    //   if (slot && (slot.blockedBy || slot.bookedBy)) {
    //     throw new ApiError(400, "The selected time slot is not available.");
    //   }
    // } else {
    //   timeSlot = new TimeSlot({ date: date, slots: [] });
    // }
    let timeSlot = await TimeSlot.findOne({ date: date });

    if (timeSlot) {
      const slot = timeSlot.slots.find(s => s.time === selectedTimeSlot);
      if (slot && (slot.blockedBy || slot.bookedBy)) {
        throw new ApiError(400, "The selected time slot is not available.");
      }
    } else {
      timeSlot = new TimeSlot({ date: date, slots: [] });
    }

    // Calculate price
    const price = calculateTotalPrice(req.body);
    if (price === 0) {
      throw new ApiError(400, "Total price cannot be 0. Please review your selections.");
    }

    // Create and save new customer
    const newCustomer = new Customer({
      customerName,
      email,
      contactNumber,
      firstLineOfAddress,
      town,
      postcode,
      selectedDate: date,
      selectedTimeSlot,
      selectService,
      gutterCleaningOptions,
      gutterRepairsOptions,
      selectHomeType,
      selectHomeStyle,
      totalPrice: price,
      numberOfBedrooms,
      numberOfStories,
      message,
      paymentMethod,
      isLocked: true,
      termsConditions: true,
      paymentStatus: "completed",
      bookedBy: "admin"
    });

    await newCustomer.save();

    // Update the time slot
    const slotIndex = timeSlot.slots.findIndex(s => s.time === selectedTimeSlot);
    if (slotIndex !== -1) {
      timeSlot.slots[slotIndex].bookedBy = newCustomer._id;
    } else {
      timeSlot.slots.push({
        time: selectedTimeSlot,
        bookedBy: newCustomer._id
      });
    }

    await timeSlot.save();

    return res.status(201).json(
      new ApiResponse(201, { customer: newCustomer }, "Booking successful")
    );
  } catch (error) {
    next(error);
  }
});

// const createCustomerByAdmin = asyncHandler(async (req, res, next) => {
//   try {
//     const {
//       customerName,
//       email,
//       contactNumber,
//       firstLineOfAddress,
//       town,
//       postcode,
//       selectedDate,
//       selectedTimeSlot,
//       selectService,
//       gutterCleaningOptions,
//       gutterRepairsOptions,
//       selectHomeType,
//       selectHomeStyle,
//       numberOfBedrooms,
//       numberOfStories,
//       paymentMethod,
//       message,
//     } = req.body;

//     // Validate required fields
//     if (
//       !customerName ||
//       !email ||
//       !postcode ||
//       !selectedDate ||
//       !selectedTimeSlot ||
//       !selectService
//     ) {
//       throw new ApiError(400, "Required fields are missing.");
//     }

//     const date = new Date(selectedDate);
//     date.setUTCHours(0, 0, 0, 0);

//     // Ensure that selectedDate is not today
//     const currentDate = new Date();
//     currentDate.setUTCHours(0, 0, 0, 0);
//     if (date.getTime() === currentDate.getTime()) {
//       throw new ApiError(400, "Bookings for today are not allowed.");
//     }

//     // Ensure that selectedDate is a weekday (Monday to Friday)
//     const dayOfWeek = date.getDay();
//     if (dayOfWeek === 0 || dayOfWeek === 6) {
//       throw new ApiError(400, "Bookings are only allowed from Monday to Friday.");
//     }

//     // Check if the time slot is available
//     let timeSlot = await TimeSlot.findOne({ date: date });

//     if (timeSlot) {
//       const slot = timeSlot.slots.find(s => s.time === selectedTimeSlot);
//       if (slot && (slot.isBlocked || slot.bookedBy)) {
//         throw new ApiError(400, "The selected time slot is not available.");
//       }
//     } else {
//       timeSlot = new TimeSlot({ date: date, slots: [] });
//     }

//     // Calculate price
//     const price = calculateTotalPrice(req.body);
//     if (price === 0) {
//       throw new ApiError(400, "Total price cannot be 0. Please review your selections.");
//     }

//     // Create and save new customer
//     const newCustomer = new Customer({
//       customerName,
//       email,
//       contactNumber,
//       firstLineOfAddress,
//       town,
//       postcode,
//       selectedDate: date,
//       selectedTimeSlot,
//       selectService,
//       gutterCleaningOptions,
//       gutterRepairsOptions,
//       selectHomeType,
//       selectHomeStyle,
//       totalPrice: price,
//       numberOfBedrooms,
//       numberOfStories,
//       message,
//       paymentMethod,
//       isLocked: true,
//       termsConditions: true,
//       paymentStatus: "completed",
//       bookedBy: "admin"
//     });

//     await newCustomer.save();

//     // Update the time slot
//     const slotIndex = timeSlot.slots.findIndex(s => s.time === selectedTimeSlot);
//     if (slotIndex !== -1) {
//       timeSlot.slots[slotIndex].bookedBy = newCustomer._id;
//     } else {
//       timeSlot.slots.push({
//         time: selectedTimeSlot,
//         bookedBy: newCustomer._id
//       });
//     }

//     await timeSlot.save();

//     return res.status(201).json(
//       new ApiResponse(201, { customer: newCustomer }, "Booking successful")
//     );
//   } catch (error) {
//     next(error);
//   }
// });
// const createCustomerByAdmin = asyncHandler(async (req, res, next) => {
//   try {
//     const {
//       customerName,
//       email,
//       contactNumber,
//       firstLineOfAddress,
//       town,
//       postcode,
//       selectedDate,
//       selectedTimeSlot,
//       selectService,
//       gutterCleaningOptions,
//       gutterRepairsOptions,
//       selectHomeType,
//       selectHomeStyle,
//       numberOfBedrooms,
//       numberOfStories,
//       paymentMethod,
//       message,
//     } = req.body;

//     // Validate required fields
//     if (
//       !customerName ||
//       !email ||
//       !postcode ||
//       !selectedDate ||
//       !selectedTimeSlot ||
//       !selectService
//     ) {
//       throw new ApiError(400, "Required fields are missing.");
//     }


//     const date = new Date(selectedDate);
//     date.setUTCHours(0, 0, 0, 0);

//     // Ensure that selectedDate is not today
//     const currentDate = new Date();
//     currentDate.setUTCHours(0, 0, 0, 0);
//     if (date.getTime() === currentDate.getTime()) {
//       throw new ApiError(400, "Bookings for today are not allowed.");
//     }

//     // Ensure that selectedDate is a weekday (Monday to Friday)
//     const dayOfWeek = date.getDay();
//     if (dayOfWeek === 0 || dayOfWeek === 6) {
//       throw new ApiError(400, "Bookings are only allowed from Monday to Friday.");
//     }

//     // Check if the time slot is available
//     const timeSlot = await TimeSlot.findOne({
//       date: date,
//       slot: selectedTimeSlot
//     });

//     if (timeSlot && (timeSlot.isBlocked || timeSlot.bookedBy)) {
//       throw new ApiError(400, "The selected time slot is not available.");
//     }

//     // Calculate price
//     const price = calculateTotalPrice(req.body);
//     if (price === 0) {
//       throw new ApiError(400, "Total price cannot be 0. Please review your selections.");
//     }

//     // Create and save new customer
//     const newCustomer = new Customer({
//       customerName,
//       email,
//       contactNumber,
//       firstLineOfAddress,
//       town,
//       postcode,
//       selectedDate: date,
//       selectedTimeSlot,
//       selectService,
//       gutterCleaningOptions,
//       gutterRepairsOptions,
//       selectHomeType,
//       selectHomeStyle,
//       totalPrice: price,
//       numberOfBedrooms,
//       numberOfStories,
//       message,
//       paymentMethod,
//       isLocked: true,
//       termsConditions: true,
//       paymentStatus: "completed",
//       bookedBy: "admin"
//     });

//     await newCustomer.save();

//     // Update or create the time slot
//     if (timeSlot) {
//       timeSlot.bookedBy = newCustomer._id;
//       await timeSlot.save();
//     } else {
//       await TimeSlot.create({
//         date: date,
//         slot: selectedTimeSlot,
//         bookedBy: newCustomer._id
//       });
//     }

//     return res.status(201).json(
//       new ApiResponse(201, { customer: newCustomer }, "Booking successful")
//     );
//   } catch (error) {
//     next(error);
//   }
// });

// const createCustomerByAdmin = asyncHandler(async (req, res, next) => {
//   try {
//     const {
//       customerName,
//       email,
//       contactNumber,
//       firstLineOfAddress,
//       town,
//       postcode,
//       selectedDate,
//       selectedTimeSlot,
//       selectService,
//       gutterCleaningOptions,
//       gutterRepairsOptions,
//       selectHomeType,
//       selectHomeStyle,
//       numberOfBedrooms,
//       numberOfStories,
//       paymentMethod,
//       message,
//     } = req.body;

//     // Validate required fields
//     if (
//       !customerName ||
//       !email ||
//       !postcode ||
//       !selectedDate ||
//       !selectedTimeSlot ||
//       !selectService
//     ) {
//       throw new ApiError(400, "Required fields are missing.");
//     }

//     let photoUrls = [];
//     if (req.files && req.files.length > 0) {
//       // Array to store URLs
//       for (let file of req.files) {
//         const fileUrl = `https://${req.get("host")}/zacks-gutter/api/public/${file.filename}`;
//         photoUrls.push(fileUrl); // Add URL to array
//       }
//     } 
//     const date = new Date(selectedDate);

//     // Ensure that selectedDate is not today
//     const currentDate = new Date();
//     currentDate.setHours(0, 0, 0, 0); // Set to start of the day
//     if (date.toDateString() === currentDate.toDateString()) {
//       throw new ApiError(400, "Bookings for today are not allowed.");
//     }

//     // Ensure that selectedDate is a weekday (Monday to Friday)
//     const dayOfWeek = date.getDay();
//     if (dayOfWeek === 0 || dayOfWeek === 6) {
//       throw new ApiError(
//         400,
//         "Bookings are only allowed from Monday to Friday."
//       );
//     }

//     // Define postcode groups
//     const postcodeGroups = {
//       Crawley: ["RH10", "RH11"],
//       Horsham: ["RH12", "RH13"]
//     };

//     // Check if the postcode prefix (first 4 characters) is valid
//     const prefix = postcode.substring(0, 4).toUpperCase();
//     let group = Object.keys(postcodeGroups).find(group =>
//       postcodeGroups[group].includes(prefix)
//     );

//     if (!group) {
//       throw new ApiError(
//         400,
//         "We do not currently service this postcode area."
//       );
//     }

//     const formattedDate = date.toISOString().split("T")[0];
//     // Check for existing bookings on the selected date
//     const existingBookings = await Customer.find({
//       selectedDate: formattedDate,
//     });

//     if (existingBookings.length > 0) {
//       const existingCustomer = existingBookings[0];

//       // Extract the first 4 characters of the existing customer's postcode
//       const existingCustomerPostcodePrefix =
//         existingCustomer.postcode.substring(0, 4);

//       // Find group of existing customer postcode
//       const existingCustomerGroup = Object.keys(postcodeGroups).find(group =>
//         postcodeGroups[group].includes(existingCustomerPostcodePrefix)
//       );

//       if (existingCustomerGroup !== group) {
//         throw new ApiError(
//           400,
//           `Bookings are already made for this date. Only customers from the same postcode area group (${existingCustomerGroup}) can book for this date.`
//         );
//       }

//       if (
//         existingBookings.some(
//           (booking) => booking.selectedTimeSlot === selectedTimeSlot
//         )
//       ) {
//         throw new ApiError(
//           400,
//           `The selected time slot is already booked: ${selectedTimeSlot}`
//         );
//       }
//     }

//     // Validate that the selected time slot is in the future
//     const currentTime = new Date();
//     const [startHour, startMinute] = selectedTimeSlot.split("-")[0].split(":");
//     const selectedSlotDate = new Date(selectedDate);
//     selectedSlotDate.setHours(
//       parseInt(startHour, 10),
//       parseInt(startMinute, 10)
//     );

//     if (selectedSlotDate <= currentTime) {
//       throw new ApiError(
//         400,
//         "The selected time slot is in the past or too soon. Please select a future time slot."
//       );
//     }
//     // Calculate price
//     const price = calculateTotalPrice(req.body);
//     if (price==0) {
//       throw new ApiError(
//         400,
//         "Total price cannot be 0. Please review your selections."
//       );
//     }

//     // Create and save new customer
//     const newCustomer = new Customer({
//       customerName,
//       email,
//       contactNumber,
//       firstLineOfAddress,
//       town,
//       postcode,
//       selectedDate: formattedDate,
//       selectedTimeSlot,
//       selectService,
//       gutterCleaningOptions,
//       gutterRepairsOptions,
//       selectHomeType,
//       selectHomeStyle,
//       totalPrice: price,
//       numberOfBedrooms,
//       numberOfStories,
//       message,
//       paymentMethod,
//       photos: photoUrls,
//       isLocked: true,
//       termsConditions:true,
//       paymentStatus:"completed",
//       bookedBy:"admin"
//     });
//     await newCustomer.save();
    

//     return res
//       .status(201)
//       .json(
//         new ApiResponse(201, { customer: newCustomer }, "Booking successful")
//       );
//   } catch (error) {
//     next(error);
//   }
// });

// const createCustomerByAdmin = asyncHandler(async (req, res, next) => {
//   try {
//     const {
//       customerName,
//       email,
//       contactNumber,
//       firstLineOfAddress,
//       town,
//       postcode,
//       selectedDate,
//       selectedTimeSlot,
//       selectService,
//       gutterCleaningOptions,
//       gutterRepairsOptions,
//       selectHomeType,
//       selectHomeStyle,
//       numberOfBedrooms,
//       numberOfStories,
//       paymentMethod,
//       message,
//     } = req.body;

//     // Validate required fields
//     if (
//       !customerName ||
//       !email ||
//       !postcode ||
//       !selectedDate ||
//       !selectedTimeSlot ||
//       !selectService
//     ) {
//       throw new ApiError(400, "Required fields are missing.");
//     }
//     const date = new Date(selectedDate);

//     // Ensure that selectedDate is not today
//     const currentDate = new Date();
//     currentDate.setHours(0, 0, 0, 0); // Set to start of the day
//     if (date.toDateString() === currentDate.toDateString()) {
//       throw new ApiError(400, "Bookings for today are not allowed.");
//     }

//     // Ensure that selectedDate is a weekday (Monday to Friday)
//     const dayOfWeek = date.getDay();
//     if (dayOfWeek === 0 || dayOfWeek === 6) {
//       throw new ApiError(
//         400,
//         "Bookings are only allowed from Monday to Friday."
//       );
//     }

//     // Define postcode groups
//     const postcodeGroups = {
//       Crawley: ["RH10", "RH11"],
//       Horsham: ["RH12", "RH13"]
//     };

//     // Check if the postcode prefix (first 4 characters) is valid
//     const prefix = postcode.substring(0, 4).toUpperCase();
//     let group = Object.keys(postcodeGroups).find(group =>
//       postcodeGroups[group].includes(prefix)
//     );

//     if (!group) {
//       throw new ApiError(
//         400,
//         "We do not currently service this postcode area."
//       );
//     }
//     const formattedDate = new Date(selectedDate);
//     formattedDate.setUTCHours(0, 0, 0, 0);

//     // Check if the slot is available
//     const slot = await TimeSlot.findOne({
//       date: formattedDate,
//       slot: selectedTimeSlot,
//       isBlocked: false,
//       bookedBy: { $exists: false }
//     });
//     console.log("slotjfj",slot);
    

//     if (!slot) {
//       throw new ApiError(400, "The selected time slot is not available.");
//     }
//     // Check for existing bookings on the selected date
//     const existingBookings = await Customer.find({
//       selectedDate: formattedDate,
//     });

//     if (existingBookings.length > 0) {
//       const existingCustomer = existingBookings[0];

//       // Extract the first 4 characters of the existing customer's postcode
//       const existingCustomerPostcodePrefix =
//         existingCustomer.postcode.substring(0, 4);

//       // Find group of existing customer postcode
//       const existingCustomerGroup = Object.keys(postcodeGroups).find(group =>
//         postcodeGroups[group].includes(existingCustomerPostcodePrefix)
//       );

//       if (existingCustomerGroup !== group) {
//         throw new ApiError(
//           400,
//           `Bookings are already made for this date. Only customers from the same postcode area group (${existingCustomerGroup}) can book for this date.`
//         );
//       }

//       if (
//         existingBookings.some(
//           (booking) => booking.selectedTimeSlot === selectedTimeSlot
//         )
//       ) {
//         throw new ApiError(
//           400,
//           `The selected time slot is already booked: ${selectedTimeSlot}`
//         );
//       }
//     }

//     // Validate that the selected time slot is in the future
//     const currentTime = new Date();
//     const [startHour, startMinute] = selectedTimeSlot.split("-")[0].split(":");
//     const selectedSlotDate = new Date(selectedDate);
//     selectedSlotDate.setHours(
//       parseInt(startHour, 10),
//       parseInt(startMinute, 10)
//     );

//     if (selectedSlotDate <= currentTime) {
//       throw new ApiError(
//         400,
//         "The selected time slot is in the past or too soon. Please select a future time slot."
//       );
//     }
//     // Calculate price
//     const price = calculateTotalPrice(req.body);
//     if (price==0) {
//       throw new ApiError(
//         400,
//         "Total price cannot be 0. Please review your selections."
//       );
//     }

//     // Create and save new customer
//     const newCustomer = new Customer({
//       customerName,
//       email,
//       contactNumber,
//       firstLineOfAddress,
//       town,
//       postcode,
//       selectedDate: formattedDate,
//       selectedTimeSlot,
//       selectService,
//       gutterCleaningOptions,
//       gutterRepairsOptions,
//       selectHomeType,
//       selectHomeStyle,
//       totalPrice: price,
//       numberOfBedrooms,
//       numberOfStories,
//       message,
//       paymentMethod,
//       isLocked: true,
//       termsConditions:true,
//       paymentStatus:"completed",
//       bookedBy:"admin"
//     });
//     await newCustomer.save();
    

//     return res
//       .status(201)
//       .json(
//         new ApiResponse(201, { customer: newCustomer }, "Booking successful")
//       );
//   } catch (error) {
//     next(error);
//   }
// });
const updateCustomerByAdmin = asyncHandler(async (req, res, next) => {
  try {
    const { customerId } = req.params; // Assuming customerId is passed in the URL
    const {
      customerName,
      email,
      contactNumber,
      firstLineOfAddress,
      town,
      postcode,
      selectedDate,
      selectedTimeSlot,
      selectService,
      gutterCleaningOptions,
      gutterRepairsOptions,
      selectHomeType,
      selectHomeStyle,
      numberOfBedrooms,
      numberOfStories,
      paymentMethod,
      message,
    } = req.body;

    // Find the existing customer booking
    const existingCustomer = await Customer.findById(customerId);
    if (!existingCustomer) {
      throw new ApiError(404, "Booking not found.");
    }

    // Validate if the selected date and time slot can be updated
    if (selectedDate || selectedTimeSlot) {
      const date = new Date(selectedDate);
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      // Ensure selectedDate is not today
      if (selectedDate && date.toDateString() === currentDate.toDateString()) {
        throw new ApiError(400, "Cannot update booking to today.");
      }

      // Ensure selectedDate is a weekday
      if (selectedDate && (date.getDay() === 0 || date.getDay() === 6)) {
        throw new ApiError(400, "Bookings can only be updated to weekdays.");
      }

      // Check if the new selected time slot is already booked,
      // but allow if it's the same as the existing booking
      const formattedDate = date.toISOString().split("T")[0];
      const existingBookings = await Customer.find({
        selectedDate: formattedDate,
        selectedTimeSlot: selectedTimeSlot,
      });

      // Allow the update if the existing booking's date and time slot are the same
      const isSameBooking = existingBookings.some(
        (booking) => booking._id.toString() === customerId
      );

      if (!isSameBooking && existingBookings.length > 0) {
        throw new ApiError(400, `The selected time slot is already booked: ${selectedTimeSlot}`);
      }
    }

    // Update fields
    existingCustomer.customerName = customerName || existingCustomer.customerName;
    existingCustomer.email = email || existingCustomer.email;
    existingCustomer.contactNumber = contactNumber || existingCustomer.contactNumber;
    existingCustomer.firstLineOfAddress = firstLineOfAddress || existingCustomer.firstLineOfAddress;
    existingCustomer.town = town || existingCustomer.town;
    existingCustomer.postcode = postcode || existingCustomer.postcode;
    existingCustomer.selectedDate = selectedDate || existingCustomer.selectedDate;
    existingCustomer.selectedTimeSlot = selectedTimeSlot || existingCustomer.selectedTimeSlot;
    existingCustomer.selectService = selectService || existingCustomer.selectService;
    existingCustomer.gutterCleaningOptions = gutterCleaningOptions || existingCustomer.gutterCleaningOptions;
    existingCustomer.gutterRepairsOptions = gutterRepairsOptions || existingCustomer.gutterRepairsOptions;
    existingCustomer.selectHomeType = selectHomeType || existingCustomer.selectHomeType;
    existingCustomer.selectHomeStyle = selectHomeStyle || existingCustomer.selectHomeStyle;
    existingCustomer.numberOfBedrooms = numberOfBedrooms || existingCustomer.numberOfBedrooms;
    existingCustomer.numberOfStories = numberOfStories || existingCustomer.numberOfStories;
    existingCustomer.paymentMethod = paymentMethod || existingCustomer.paymentMethod;
    existingCustomer.message = message || existingCustomer.message;

    // Save the updated booking
    await existingCustomer.save();

    return res.status(200).json(new ApiResponse(200, { customer: existingCustomer }, "Booking updated successfully"));
  } catch (error) {
    next(error);
  }
});

export { getcustomerBooking,getCustomerById,deleteCustomerById,createCustomerByAdmin,updateCustomerByAdmin,};
// const updateCustomerByAdmin = asyncHandler(async (req, res, next) => {
//   try {
//     const { customerId } = req.params; // Assuming customerId is passed in the URL
//     const {
//       customerName,
//       email,
//       contactNumber,
//       firstLineOfAddress,
//       town,
//       postcode,
//       selectedDate,
//       selectedTimeSlot,
//       selectService,
//       gutterCleaningOptions,
//       gutterRepairsOptions,
//       selectHomeType,
//       selectHomeStyle,
//       numberOfBedrooms,
//       numberOfStories,
//       paymentMethod,
//       message,
//       // Include any other fields you might want to update
//     } = req.body;

//     // Find the existing customer booking
//     const existingCustomer = await Customer.findById(customerId);
//     if (!existingCustomer) {
//       throw new ApiError(404, "Booking not found.");
//     }

//     // Optional: Validate if the selected date and time slot can be updated
//     if (selectedDate || selectedTimeSlot) {
//       const date = new Date(selectedDate);
//       const currentDate = new Date();
//       currentDate.setHours(0, 0, 0, 0);
      
//       // Ensure selectedDate is not today
//       if (selectedDate && date.toDateString() === currentDate.toDateString()) {
//         throw new ApiError(400, "Cannot update booking to today.");
//       }

//       // Ensure selectedDate is a weekday
//       if (selectedDate && (date.getDay() === 0 || date.getDay() === 6)) {
//         throw new ApiError(400, "Bookings can only be updated to weekdays.");
//       }

//       // Check if the new selected time slot is already booked
//       const formattedDate = date.toISOString().split("T")[0];
//       const existingBookings = await Customer.find({
//         selectedDate: formattedDate,
//         selectedTimeSlot: selectedTimeSlot,
//       });

//       if (existingBookings.length > 0) {
//         throw new ApiError(400, `The selected time slot is already booked: ${selectedTimeSlot}`);
//       }
//     }

//     // Update fields
//     existingCustomer.customerName = customerName || existingCustomer.customerName;
//     existingCustomer.email = email || existingCustomer.email;
//     existingCustomer.contactNumber = contactNumber || existingCustomer.contactNumber;
//     existingCustomer.firstLineOfAddress = firstLineOfAddress || existingCustomer.firstLineOfAddress;
//     existingCustomer.town = town || existingCustomer.town;
//     existingCustomer.postcode = postcode || existingCustomer.postcode;
//     existingCustomer.selectedDate = selectedDate || existingCustomer.selectedDate;
//     existingCustomer.selectedTimeSlot = selectedTimeSlot || existingCustomer.selectedTimeSlot;
//     existingCustomer.selectService = selectService || existingCustomer.selectService;
//     existingCustomer.gutterCleaningOptions = gutterCleaningOptions || existingCustomer.gutterCleaningOptions;
//     existingCustomer.gutterRepairsOptions = gutterRepairsOptions || existingCustomer.gutterRepairsOptions;
//     existingCustomer.selectHomeType = selectHomeType || existingCustomer.selectHomeType;
//     existingCustomer.selectHomeStyle = selectHomeStyle || existingCustomer.selectHomeStyle;
//     existingCustomer.numberOfBedrooms = numberOfBedrooms || existingCustomer.numberOfBedrooms;
//     existingCustomer.numberOfStories = numberOfStories || existingCustomer.numberOfStories;
//     existingCustomer.paymentMethod = paymentMethod || existingCustomer.paymentMethod;
//     existingCustomer.message = message || existingCustomer.message;

//     // Save the updated booking
//     await existingCustomer.save();

//     return res.status(200).json(new ApiResponse(200, { customer: existingCustomer }, "Booking updated successfully"));
//   } catch (error) {
//     next(error);
//   }
// });
// const updateCustomerByAdmin = asyncHandler(async (req, res, next) => {
//   try {
//     const { customerId } = req.params; // Assuming customerId is passed in the URL
//     const {
//       customerName,
//       email,
//       contactNumber,
//       firstLineOfAddress,
//       town,
//       postcode,
//       selectedDate,
//       selectedTimeSlot,
//       selectService,
//       gutterCleaningOptions,
//       gutterRepairsOptions,
//       selectHomeType,
//       selectHomeStyle,
//       numberOfBedrooms,
//       numberOfStories,
//       paymentMethod,
//       message,
//     } = req.body;
//     console.log("req",postcode);
    

//     // Find the existing customer booking
//     const existingCustomer = await Customer.findById(customerId);
//     if (!existingCustomer) {
//       throw new ApiError(404, "Booking not found.");
//     }

//     // If both selectedDate and selectedTimeSlot are the same as existing
//     const isSameDate = selectedDate === existingCustomer.selectedDate;
//     const isSameTimeSlot = selectedTimeSlot === existingCustomer.selectedTimeSlot;

//     // If either date or time slot is being changed, perform checks
//     if (!isSameDate || !isSameTimeSlot) {
//       const date = new Date(selectedDate);
//       const currentDate = new Date();
//       currentDate.setHours(0, 0, 0, 0);

//       // Ensure selectedDate is not today
//       if (selectedDate && date.toDateString() === currentDate.toDateString()) {
//         throw new ApiError(400, "Cannot update booking to today.");
//       }

//       // Ensure selectedDate is a weekday
//       if (selectedDate && (date.getDay() === 0 || date.getDay() === 6)) {
//         throw new ApiError(400, "Bookings can only be updated to weekdays.");
//       }

//       // Check for existing bookings if date or time slot is being changed
//       if (selectedDate && selectedTimeSlot) {
//         const formattedDate = date.toISOString().split("T")[0];
//         const existingBookings = await Customer.find({
//           selectedDate: formattedDate,
//           selectedTimeSlot: selectedTimeSlot,
//           _id: { $ne: customerId }, // Exclude the current customerId from the check
//         });

//         if (existingBookings.length > 0) {
//           throw new ApiError(400, `The selected time slot is already booked: ${selectedTimeSlot}`);
//         }
//       }
//     }

//     // Update fields
//     existingCustomer.customerName = customerName || existingCustomer.customerName;
//     existingCustomer.email = email || existingCustomer.email;
//     existingCustomer.contactNumber = contactNumber || existingCustomer.contactNumber;
//     existingCustomer.firstLineOfAddress = firstLineOfAddress || existingCustomer.firstLineOfAddress;
//     existingCustomer.town = town || existingCustomer.town;
//     existingCustomer.postcode = postcode || existingCustomer.postcode;
//     existingCustomer.selectedDate = selectedDate || existingCustomer.selectedDate;
//     existingCustomer.selectedTimeSlot = selectedTimeSlot || existingCustomer.selectedTimeSlot;
//     existingCustomer.selectService = selectService || existingCustomer.selectService;
//     existingCustomer.gutterCleaningOptions = gutterCleaningOptions || existingCustomer.gutterCleaningOptions;
//     existingCustomer.gutterRepairsOptions = gutterRepairsOptions || existingCustomer.gutterRepairsOptions;
//     existingCustomer.selectHomeType = selectHomeType || existingCustomer.selectHomeType;
//     existingCustomer.selectHomeStyle = selectHomeStyle || existingCustomer.selectHomeStyle;
//     existingCustomer.numberOfBedrooms = numberOfBedrooms || existingCustomer.numberOfBedrooms;
//     existingCustomer.numberOfStories = numberOfStories || existingCustomer.numberOfStories;
//     existingCustomer.paymentMethod = paymentMethod || existingCustomer.paymentMethod;
//     existingCustomer.message = message || existingCustomer.message;

//     // Save the updated booking
//     await existingCustomer.save();

//     return res.status(200).json(new ApiResponse(200, { customer: existingCustomer }, "Booking updated successfully"));
//   } catch (error) {
//     next(error);
//   }
// });

