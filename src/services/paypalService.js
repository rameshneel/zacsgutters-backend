// services/paypalService.js
import checkoutNodeJssdk from "@paypal/checkout-server-sdk";

function client() {
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing PayPal live client credentials in environment variables");
  }

  console.log("Using PayPal Live credentials");
  console.log("Client ID:", clientId.substring(0, 5) + "..." + clientId.substring(clientId.length - 5));
  console.log("Client Secret:", clientSecret.substring(0, 5) + "..." + clientSecret.substring(clientSecret.length - 5));

  return new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret);
}

export async function createOrder(amount, bookingDetails) {
  try {
    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: amount.toString(),
          },
          description: `Service: ${bookingDetails.selectService}, Date: ${bookingDetails.selectedDate}, Time: ${bookingDetails.selectedTimeSlot}`,
        },
      ],
      application_context: {
        return_url: "https://yourdomain.com/paypal/return", // Update with your live domain
        cancel_url: "https://yourdomain.com/booking-cancelled", // Update with your live domain
      },
    });

    const order = await client().execute(request);
    console.log("Order created:", order.result.id);
    return order.result;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

export async function capturePayment(orderId) {
  try {
    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});
    const response = await client().execute(request);
    console.log("Payment captured for order:", orderId);
    return response.result;
  } catch (error) {
    console.error("Error capturing payment:", error);
    throw error;
  }
}
export async function checkOrderStatus(orderId) {
  const request = new checkoutNodeJssdk.orders.OrdersGetRequest(orderId);
  const response = await client().execute(request);
  return response.result;
}
export async function refundPayment(captureId, amount) {
  // Capture ID ko use karte hain jo aapko payment capture ke response se milta hai
  const request = new checkoutNodeJssdk.payments.CapturesRefundRequest(
    captureId
  );

  // Agar partial refund chahiye toh amount specify karein, otherwise use empty object for full refund
  request.requestBody({
    amount: {
      currency_code: "USD",
      value: amount.toString(), // Refund amount ko string mein convert karna
    },
  });

  try {
    const response = await client().execute(request);
    return response.result;
  } catch (error) {
    console.error("Refund error:", error);
    throw error;
  }
}
