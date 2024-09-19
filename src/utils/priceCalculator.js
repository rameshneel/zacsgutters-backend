export const calculateTotalPrice = (formData) => {
  console.log("Received formData:", formData);
  let totalPrice = 0;

  // Special check for "Town House/3 Stories" to limit bedroom options
  if (
    formData.selectHomeStyle === "Town House/3 Stories" &&
    (formData.numberOfBedrooms !== "3 Bedroom" &&
      formData.numberOfBedrooms !== "4 Bedroom")
  ) {
    console.log("Invalid bedroom selection for Town House/3 Stories.");
    return 0;
  }

  // Ensure gutterCleaningOptions and gutterRepairsOptions are arrays
  const gutterCleaningOptions = Array.isArray(formData.gutterCleaningOptions) 
    ? formData.gutterCleaningOptions  
    : [formData.gutterCleaningOptions];
    
  const gutterRepairsOptions = Array.isArray(formData.gutterRepairsOptions) 
    ? formData.gutterRepairsOptions 
    : [formData.gutterRepairsOptions];

  // Calculate base price based on house type and number of bedrooms ONLY for gutter cleaning
  if (formData.selectService === "Gutter Cleaning") {
    const basePrice =
      housePrices[formData.selectHomeStyle]?.[formData.numberOfBedrooms];
    
    console.log("Base price for gutter cleaning:", basePrice);

    if (basePrice) {
      totalPrice += basePrice;
    } else {
      console.log("Base price not found for selected house style and bedroom count.");
    }

    // Add prices for gutter cleaning options
    console.log("Processing gutter cleaning options:", gutterCleaningOptions);
    gutterCleaningOptions.forEach((option) => {
      const price = servicePrices.gutterCleaning[option] || 0;
      console.log(`Adding ${option} gutter cleaning: £${price}`);
      totalPrice += price;
    });
  }

  // Add prices for gutter repair options
  if (formData.selectService === "Gutter Repair") {
    console.log("Processing gutter repair options:", gutterRepairsOptions);
    
    let repairPrice;
    if (formData.selectHomeStyle === "Bungalow" && formData.numberOfBedrooms === "Ground") {
      repairPrice = 45;
    } else if (formData.selectHomeStyle === "Town House/3 Stories") {
      repairPrice = 85;
    } else {
      repairPrice = 65;
    }
    
    gutterRepairsOptions.forEach((option) => {
      console.log(`Adding ${option} gutter repair: £${repairPrice}`);
      totalPrice += repairPrice;
    });
  }

  // Calculate VAT (20%)
  const vatRate = 0.20;
  const vatAmount = totalPrice * vatRate;

  // Calculate total price including VAT
  const totalPriceWithVAT = totalPrice + vatAmount;

  console.log("Total price before VAT:", totalPrice);
  console.log("VAT amount:", vatAmount);
  console.log("Total price with VAT:", totalPriceWithVAT);
  
  return totalPriceWithVAT;
};


const servicePrices = {
  gutterCleaning: {
    Garage: 40,
    Conservatory: 40,
    Extension: 40,
  },
  gutterRepairs: {
    "Running Outlet": 65,
    "Union Joint": 65,
    Corner: 65,
    "Gutter Bracket": 65,
    Downpipe: 65,
  },
};

const housePrices = {
  Terrace: {
    "2 Bedroom": 69,
    "3 Bedroom": 79,
    "4 Bedroom": 99,
    "5 Bedroom": 129,
  },
  "Semi-Detached": {
    "2 Bedroom": 79,
    "3 Bedroom": 89,
    "4 Bedroom": 99,
    "5 Bedroom": 139,
  },
  Detached: {
    "2 Bedroom": 79,
    "3 Bedroom": 89,
    "4 Bedroom": 99,
    "5 Bedroom": 119,
  },
  Bungalow: {
    "2 Bedroom": 79,
    "3 Bedroom": 89,
    "4 Bedroom": 99,
    "5 Bedroom": 109,
    "Ground": 0,
  },
  "Town House/3 Stories": {
    "3 Bedroom": 129,
    "4 Bedroom": 139,
  },
};

// export const calculateTotalPrice = (formData) => {
//   console.log("Received formData:", formData);
//   let totalPrice = 0;

//   // Special check for "Town House/3 Stories" to limit bedroom options
//   if (
//     formData.selectHomeStyle === "Town House/3 Stories" &&
//     (formData.numberOfBedrooms !== "3 Bedroom" &&
//       formData.numberOfBedrooms !== "4 Bedroom")
//   ) {
//     console.log("Invalid bedroom selection for Town House/3 Stories.");
//     return 0;
//   }

//   // Calculate base price based on house type and number of bedrooms ONLY for gutter cleaning
//   if (formData.selectService === "Gutter Cleaning") {
//     const basePrice =
//       housePrices[formData.selectHomeStyle]?.[formData.numberOfBedrooms];
    
//     console.log("Base price for gutter cleaning:", basePrice);

//     if (basePrice) {
//       totalPrice += basePrice;
//     } else {
//       console.log("Base price not found for selected house style and bedroom count.");
//     }

//     // Add prices for gutter cleaning options
     
//     if (Array.isArray(formData.gutterCleaningOptions)) {
//       console.log("Processing gutter cleaning options:", formData.gutterCleaningOptions);
//       formData.gutterCleaningOptions.forEach((option) => {
//         const price = servicePrices.gutterCleaning[option] || 0;
//         console.log(`Adding ${option} gutter cleaning: £${price}`);
//         totalPrice += price;
//       });
//     }
//   }

//   // Add prices for gutter repair options
//   if (formData.selectService === "Gutter Repair" && Array.isArray(formData.gutterRepairsOptions)) {
//     console.log("Processing gutter repair options:", formData.gutterRepairsOptions);
    
//     let repairPrice;
//     if (formData.selectHomeStyle === "Bungalow" && formData.numberOfBedrooms === "Ground") {
//       repairPrice = 45;
//     } else if (formData.selectHomeStyle === "Town House/3 Stories") {
//       repairPrice = 85;
//     } else {
//       repairPrice = 65;
//     }
    
//     formData.gutterRepairsOptions.forEach((option) => {
//       console.log(`Adding ${option} gutter repair: £${repairPrice}`);
//       totalPrice += repairPrice;
//     });
//   }

//   // Calculate VAT (20%)
//   const vatRate = 0.20;
//   const vatAmount = totalPrice * vatRate;

//   // Calculate total price including VAT
//   const totalPriceWithVAT = totalPrice + vatAmount;

//   console.log("Total price before VAT:", totalPrice);
//   console.log("VAT amount:", vatAmount);
//   console.log("Total price with VAT:", totalPriceWithVAT);
  
//   return totalPriceWithVAT;
// };



// const servicePrices = {
//   gutterCleaning: {
//     Garage: 40,
//     Conservatory: 40,
//     Extension: 40,
//   },
//   gutterRepairs: {
//     "Running Outlet": 65,
//     "Union Joint": 65,
//     Corner: 65,
//     "Gutter Bracket": 65,
//     Downpipe: 65,
//     "Gutter Length Replacement": 85,
//   },
// };

// // Updated house prices
// const housePrices = {
//   Terrace: {
//     "2 Bedroom": 69,
//     "3 Bedroom": 79,
//     "4 Bedroom": 99,
//     "5 Bedroom": 129,
//   },
//   "Semi-Detached": {
//     "2 Bedroom": 79,
//     "3 Bedroom": 89,
//     "4 Bedroom": 99,
//     "5 Bedroom": 139,
//   },
//   Detached: {
//     "2 Bedroom": 79,
//     "3 Bedroom": 89,
//     "4 Bedroom": 99,
//     "5 Bedroom": 119,
//   },
//   Bungalow: {
//     "2 Bedroom": 79,
//     "3 Bedroom": 89,
//     "4 Bedroom": 99,
//     "5 Bedroom": 109,
//   },
//   "Town House/3 Stories": {
//     "3 Bedroom": 129,
//     "4 Bedroom": 139,
//   },
// };
// export const calculateTotalPrice = (formData) => {
//   console.log("Received formData:", formData);

//   let totalPrice = 0;

//   // Special check for "Town House/3 Stories" to limit bedroom options
//   if (
//     formData.selectHomeStyle === "Town House/3 Stories" &&
//     (formData.numberOfBedrooms !== "3 Bedroom" &&
//       formData.numberOfBedrooms !== "4 Bedroom")
//   ) {
//     console.log("Invalid bedroom selection for Town House/3 Stories.");
//     return 0; // Ya error return kar sakte hain
//   }

//   // Base price calculate karte hain
//   const basePrice =
//     housePrices[formData.selectHomeStyle]?.[formData.numberOfBedrooms];
  
//   console.log("Base price:", basePrice);

//   if (basePrice) {
//     totalPrice += basePrice;
//   } else {
//     console.log("Base price not found for selected house style and bedroom count.");
//   }

//   // Gutter cleaning options ka price add karte hain
//   const gutterCleaningOptions = Array.isArray(formData.gutterCleaningOptions) 
//     ? formData.gutterCleaningOptions 
//     : [formData.gutterCleaningOptions];
  
//   if (formData.selectService === "Gutter Cleaning") {
//     console.log("Processing gutter cleaning options:", gutterCleaningOptions);
//     gutterCleaningOptions.forEach((option) => {
//       const price = servicePrices.gutterCleaning[option] || 0;
//       console.log(`Adding ${option} gutter cleaning: $${price}`);
//       totalPrice += price;
//     });
//   }

//   // Gutter repair options ka price add karte hain
//   const gutterRepairsOptions = Array.isArray(formData.gutterRepairsOptions) 
//     ? formData.gutterRepairsOptions 
//     : [formData.gutterRepairsOptions];
  
//   if (formData.selectService === "Gutter Repair") {
//     console.log("Processing gutter repair options:", gutterRepairsOptions);
//     gutterRepairsOptions.forEach((option) => {
//       const price = servicePrices.gutterRepairs[option] || 0;
//       console.log(`Adding ${option} gutter repair: $${price}`);
//       totalPrice += price;
//     });
//   }

//   // VAT calculate karte hain (20%)
//   const vatRate = 0.20; // 20% VAT
//   const vatAmount = totalPrice * vatRate;

//   // Total price including VAT calculate karte hain
//   const totalPriceWithVAT = totalPrice + vatAmount;

//   console.log("Total price before VAT:", totalPrice);
//   console.log("VAT amount:", vatAmount);
//   console.log("Total price with VAT:", totalPriceWithVAT);
  
//   return totalPriceWithVAT;
// };

// export const calculateTotalPrice = (formData) => {
//   console.log("Received formData:", formData);

//   let totalPrice = 0;

//   // Special check for "Town House/3 Stories" to limit bedroom options
//   if (
//     formData.selectHomeStyle === "Town House/3 Stories" &&
//     (formData.numberOfBedrooms !== "3 Bedroom" &&
//       formData.numberOfBedrooms !== "4 Bedroom")
//   ) {
//     console.log("Invalid bedroom selection for Town House/3 Stories.");
//     return 0; // Ya error return kar sakte hain
//   }

//   // Base price calculate karte hain
//   const basePrice =
//     housePrices[formData.selectHomeStyle]?.[formData.numberOfBedrooms];
  
//   console.log("Base price:", basePrice);

//   if (basePrice) {
//     totalPrice += basePrice;
//   } else {
//     console.log("Base price not found for selected house style and bedroom count.");
//   }

//   // Gutter cleaning options ka price add karte hain
//   if (formData.selectService === "Gutter Cleaning" && Array.isArray(formData.gutterCleaningOptions)) {
//     console.log("Processing gutter cleaning options:", formData.gutterCleaningOptions);
//     formData.gutterCleaningOptions.forEach((option) => {
//       const price = servicePrices.gutterCleaning[option] || 0;
//       console.log(`Adding ${option} gutter cleaning: $${price}`);
//       totalPrice += price;
//     });
//   }

//   // Gutter repair options ka price add karte hain
//   if (formData.selectService === "Gutter Repair" && Array.isArray(formData.gutterRepairsOptions)) {
//     console.log("Processing gutter repair options:", formData.gutterRepairsOptions);
//     formData.gutterRepairsOptions.forEach((option) => {
//       const price = servicePrices.gutterRepairs[option] || 0;
//       console.log(`Adding ${option} gutter repair: $${price}`);
//       totalPrice += price;
//     });
//   }

//   // VAT calculate karte hain (20%)
//   const vatRate = 0.20; // 20% VAT
//   const vatAmount = totalPrice * vatRate;

//   // Total price including VAT calculate karte hain
//   const totalPriceWithVAT = totalPrice + vatAmount;

//   console.log("Total price before VAT:", totalPrice);
//   console.log("VAT amount:", vatAmount);
//   console.log("Total price with VAT:", totalPriceWithVAT);
  
//   return totalPriceWithVAT;
// };

// const servicePrices = {
//   gutterCleaning: {
//     Garage: 40,
//     Conservatory: 40,
//     Extension: 40,
//   },
//   gutterRepairs: {
//     "Running Outlet": 65,
//     "Union Joint": 65,
//     Corner: 65,
//     "Gutter Bracket": 65,
//     Downpipe: 65,
//     "Gutter Length Replacement": 85,
//   },
// };

// const housePrices = {
//   Terrace: {
//     Bungalow: 59,
//     "2 Bedroom": 69,
//     "3 Bedroom": 79,
//     "4 Bedroom": 99,
//     "5 Bedroom": 129,
//     "Town House/3 Stories": 129,
//   },
//   "Semi-Detached": {
//     Bungalow: 69,
//     "2 Bedroom": 79,
//     "3 Bedroom": 89,
//     "4 Bedroom": 99,
//     "5 Bedroom": 139,
//     "Town House/3 Stories": 139,
//   },
//   Detached: {
//     Bungalow: 79,
//     "2 Bedroom": 89,
//     "3 Bedroom": 99,
//     "4 Bedroom": 119,
//     "5 Bedroom": 149,
//     "Town House/3 Stories": 149,
//   },
// };

// export const calculateTotalPrice = (formData) => {
//   console.log("caldata", formData);
  
//   let totalPrice = 0;

//   // Calculate base price based on house type and style
//   const basePrice =
//     housePrices[formData.selectHomeStyle]?.[formData.selectHomeType];
//   if (basePrice) {
//     totalPrice += basePrice;
//   }

//   // Add prices for gutter cleaning options
//   if (formData.selectService === "Gutter Cleaning") {
//     // Ensure gutterCleaningOptions is an array
//     const gutterCleaningOptions = Array.isArray(formData.gutterCleaningOptions)
//       ? formData.gutterCleaningOptions
//       : [formData.gutterCleaningOptions];

//     gutterCleaningOptions.forEach((option) => {
//       totalPrice += servicePrices.gutterCleaning[option] || 0;
//     });
//   }

//   // Add prices for gutter repair options
//   if (formData.selectService === "Gutter Repair") {
//     // Ensure gutterRepairsOptions is an array
//     const gutterRepairsOptions = Array.isArray(formData.gutterRepairsOptions)
//       ? formData.gutterRepairsOptions
//       : [formData.gutterRepairsOptions];

//     gutterRepairsOptions.forEach((option) => {
//       totalPrice += servicePrices.gutterRepairs[option] || 0;
//     });
//   }
  
//   const vatRate = 0.20;      // 20% VAT
//   const vatAmount = totalPrice * vatRate;
//   const totalPriceWithVAT = totalPrice + vatAmount;

//   return totalPriceWithVAT;
// };


//+++++++++++++++++++++++++++++++++++++

// const VAT_RATE = 0.2; // 20% VAT

// // Prices for services
// const servicePrices = {
//   gutterCleaning: {
//     Garage: 40,
//     Conservatory: 40,
//     Extension: 40,
//   },
//   gutterRepairs: {
//     RunningOutlet: 65,
//     UnionJoint: 65,
//     Corner: 65,
//     GutterBracket: 65,
//     Downpipe: 65,
//     GutterLengthReplacement: 85,
//   },
// };

// // Prices for house types and styles
// const housePrices = {
//   Terrace: {
//     Bungalow: 59,
//     "2 bed House": 69,
//     "3 bed House": 79,
//     "4 bed House": 99,
//     "5 bed House": 129,
//     "Town House / 3 Stories": "BY QUOTE",
//   },
//   SemiDetached: {
//     Bungalow: 69,
//     "2 bed House": 79,
//     "3 bed House": 89,
//     "4 bed House": 99,
//     "5 bed House": 139,
//     "Town House / 3 Stories": "BY QUOTE",
//   },
//   Detached: {
//     Bungalow: 79,
//     "2 bed House": 89,
//     "3 bed House": 99,
//     "4 bed House": 119,
//     "5 bed House": 149,
//     "Town House / 3 Stories": "BY QUOTE",
//   },
// };

// // Function to calculate the price
// function calculatePrice(serviceType, serviceName, houseType, houseStyle) {
//   let price = 0;

//   // Check for service pricing
//   if (serviceType === "gutterCleaning" || serviceType === "gutterRepairs") {
//     if (servicePrices[serviceType][serviceName] !== undefined) {
//       price = servicePrices[serviceType][serviceName];
//     } else {
//       throw new Error("Invalid service name.");
//     }
//   } else if (serviceType === "houseCleaning") {
//     if (
//       housePrices[houseStyle] &&
//       housePrices[houseStyle][houseType] !== undefined
//     ) {
//       const housePrice = housePrices[houseStyle][houseType];
//       if (housePrice === "BY QUOTE") {
//         throw new Error("Price is by quote.");
//       }
//       price = housePrice;
//     } else {
//       throw new Error("Invalid house type or style.");
//     }
//   } else {
//     throw new Error("Invalid service type.");
//   }

//   // Add VAT
//   const totalPrice = price + price * VAT_RATE;
//   return totalPrice;
// }

// // Example usage
// try {
//   const serviceType = "gutterCleaning"; // or 'gutterRepairs'
//   const serviceName = "Garage"; // or other service names
//   const houseType = "2 bed House"; // relevant for house cleaning
//   const houseStyle = "Terrace"; // relevant for house cleaning

//   const price = calculatePrice(serviceType, serviceName, houseType, houseStyle);
//   console.log(`Total price including VAT: £${price.toFixed(2)}`);
// } catch (error) {
//   console.error(`Error calculating price: ${error.message}`);
// }

//*********************************** */

// export function calculatePrice(service, bedrooms, stories) {
//     let basePrice = 0;

//     switch(service) {
//       case "Gutter Cleaning":
//         basePrice = 50;
//         break;
//       case "Gutter Wash Down":
//         basePrice = 70;
//         break;
//       case "Gutter Repair":
//         basePrice = 100;
//         break;
//       case "Gutter Replacement":
//         basePrice = 200;
//         break;
//       case "Soffits and Fascias":
//         basePrice = 150;
//         break;
//       default:
//         throw new Error("Invalid service selected");
//     }

//     // Adjust price based on number of bedrooms
//     const bedroomFactor = 1 + (parseInt(bedrooms) - 1) * 0.1;

//     // Adjust price based on number of stories
//     const storyFactor = 1 + (parseInt(stories) - 1) * 0.2;

//     return Math.round(basePrice * bedroomFactor * storyFactor);
//   }
