import payment from '../models/paymentModel.js';
import vehicle from '../models/Vehicle.js';
import Booking from '../models/Booking.js';
import Stripe from 'stripe';
import {
  notifyPaymentInitiated,
  notifyOwnerPaymentInitiated,
  notifyOwnerPaymentReceived,
  notifyCustomerPaymentSuccess,
  notifyCustomerPaymentFailed,
  notifyOwnerPaymentRefunded
} from '../controllers/notificationController.js';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//create payment 
export const createPayment = async (req, res) => {
    try {
      console.log("first")
      const customerId = req.user.userid;
      const { vehicleId, bookingId} = req.body;

      if( !vehicleId || !bookingId){
        return res.status(400).json({
          success: false,
          message: "Missing required fields."
        })
      }
      //get booking amount from DB
      const booking = await Booking.findById(bookingId)
      if(!booking){
        return res.status(404).json({
          success: false,
          message: "Booking not found"
        })
      }
      //check already paid or not
      const existingPayment = await payment.findOne({ bookingId });
      if (existingPayment) {
        return res.status(400).json({
          success: false,
          message: "Payment already exists for this booking.",
        });
      }

      //check if the booking belongs to the customer
      if (booking.customerId.toString() !== customerId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to make payment for this booking.",
        });
      }

      const totalAmount = booking.totalAmount;

      //get vehicle owner id
      const owner = await vehicle.findById(vehicleId).select("ownerId");
      const paymentDate = new Date(Date.now());

      //platform fee calculation
      const platformFee = totalAmount * 0.1;
      const payableAmount = totalAmount - platformFee;

      console.log("PaymentIntent")
      const paymentIntent = await stripe.paymentIntents.create({
        // payment_method_types: ["card"],
        // mode: "payment",
        amount: Math.round(payableAmount * 100), // cents
        currency: "usd",
        metadata: {
          bookingId: bookingId.toString(),
          vehicleId: vehicleId.toString(),
          customerId: customerId.toString(),
        },
      });
      console.log("payment intent created")

        //stripe session
        // const session = await stripe.checkout.sessions.create({
        //     payment_method_types: ["card"],
        //     mode: "payment",
        // })

      const newPayment = await payment.create({
        customerId,
        OwnerId: owner.ownerId,
        vehicleId,
        bookingId,
        amount: {
          amount: payableAmount,
          platformFee,
          currency: "LKR",
          paymentMethod: "card"
        },
        paymentDate,
        stripePaymentIntentId: paymentIntent.id,
      });

      // NOTIFY PAYMENT INITIATED
      try {
        await notifyPaymentInitiated(newPayment._id);
        await notifyOwnerPaymentInitiated(newPayment._id);
        console.log(`Payment initiation notifications sent for: ${newPayment._id}`);
      } catch (notifyError) {
        console.error("Failed to send payment initiation notifications:", notifyError);
        // Don't fail the payment creation if notifications fail
      }

      res.status(201).json({
        success: true,
        message: "Payment created successfully.",
        paymentId: newPayment._id,
        clientSecret: paymentIntent.client_secret,
      });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Side Error."
        });
    }
}

//stripe webhook to update payment status
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature failed", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // ✅ PAYMENT SUCCESS
    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object;

      const Payment = await payment.findOne({
        stripePaymentIntentId: intent.id,
      });

      if (Payment) {
        Payment.status = "paid";
        await Payment.save();

        // also update booking
        await Booking.findByIdAndUpdate(Payment.bookingId, {
          status: "approved",
        });

        //  NOTIFY PAYMENT SUCCESS
        try {
          await notifyOwnerPaymentReceived(Payment._id);
          await notifyCustomerPaymentSuccess(Payment._id);
          console.log(` Payment success notifications sent for: ${Payment._id}`);
        } catch (notifyError) {
          console.error(" Failed to send payment success notifications:", notifyError);
          // Don't fail the webhook if notifications fail
        }
      }
    }

    // ❌ PAYMENT FAILED or CANCELED
    /**if (
      event.type === "payment_intent.payment_failed" ||
      event.type === "payment_intent.canceled"
    ) {
      const intent = event.data.object;

      await payment.findOneAndDelete({
        stripePaymentIntentId: intent.id,
      });
    }*/

      //payment failed
    if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object;

      const Payment = await payment.findOne({
        stripePaymentIntentId: intent.id,
      });

      if (Payment) {
        // NOTIFY PAYMENT FAILED (before deletion)
        try {
          await notifyCustomerPaymentFailed(intent.id);
          console.log(`Payment failure notification sent for intent: ${intent.id}`);
        } catch (notifyError) {
          console.error(" Failed to send payment failure notification:", notifyError);
        }
        
        // Delete payment record
        await payment.findOneAndDelete({
          stripePaymentIntentId: intent.id,
        });
      }
    }
    
    // ❌ PAYMENT CANCELED
    if (event.type === "payment_intent.canceled") {
      const intent = event.data.object;

      const Payment = await payment.findOne({
        stripePaymentIntentId: intent.id,
      });

      if (Payment) {
        // NOTIFY PAYMENT REFUNDED/CANCELED
        try {
          await notifyOwnerPaymentRefunded(Payment._id);
          console.log(`Payment refund notification sent for: ${Payment._id}`);
        } catch (notifyError) {
          console.error("Failed to send payment refund notification:", notifyError);
        }
        
        // Delete payment record
        await payment.findOneAndDelete({
          stripePaymentIntentId: intent.id,
        });
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook handling error", error);
    res.status(500).json({ message: "Webhook error" });
  }
};

//get payment by user id
export const getPaymentsByUserId = async (req, res) => {
  try {
    const userId = req.user.userid;
    const payments = await payment.find({ customerId: userId }).populate("vehicleId").populate("bookingId");
    res.status(200).json({
      success: true,
      message: "Payments fetched successfully.",
      payments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Side Error.",
    });
  }
};

// Get all PAID payments (admin view)
export const getAllPaidPaymentsForAdmin = async (req, res) => {
  try {
    const { startDate, endDate, limit = 10, page = 1, customerId } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Build filter
    let filter = { status: "paid" }; // Only paid payments

    if (customerId) {
      filter.customerId = customerId;
    }

    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) filter.paymentDate.$gte = new Date(startDate);
      if (endDate) filter.paymentDate.$lte = new Date(endDate);
    }

    // Fetch payments
    const payments = await payment
      .find(filter)
      .populate({
        path: "vehicleId",
        select: "make model year image registrationNumber",
      })
      .populate({
        path: "bookingId",
        select: "startDate endDate totalAmount",
      })
      .populate({
        path: "customerId",
        select: "name email",
      })
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limitNumber);

    const totalCount = await payment.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Paid payments fetched successfully for admin.",
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalCount / limitNumber),
        totalItems: totalCount,
        itemsPerPage: limitNumber,
      },
      payments,
    });
  } catch (error) {
    console.error("Error fetching paid payments for admin:", error);
    res.status(500).json({
      success: false,
      message: "Server Side Error.",
      error: error.message,
    });
  }
};

// Get all PAID payments for vehicle owner
export const getPaidPaymentsForOwner = async (req, res) => {
  try {
    const ownerId = req.user.userid; // Logged-in owner
    const { startDate, endDate, limit = 10, page = 1 } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Build filter
    let filter = { status: "paid", OwnerId: ownerId };

    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) filter.paymentDate.$gte = new Date(startDate);
      if (endDate) filter.paymentDate.$lte = new Date(endDate);
    }

    // Fetch payments
    const payments = await payment
      .find(filter)
      .populate({
        path: "vehicleId",
        select: "make model year image registrationNumber",
      })
      .populate({
        path: "bookingId",
        select: "startDate endDate totalAmount",
      })
      .populate({
        path: "customerId",
        select: "name email",
      })
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limitNumber);

    const totalCount = await payment.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Paid payments fetched successfully for owner.",
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalCount / limitNumber),
        totalItems: totalCount,
        itemsPerPage: limitNumber,
      },
      payments,
    });
  } catch (error) {
    console.error("Error fetching paid payments for owner:", error);
    res.status(500).json({
      success: false,
      message: "Server Side Error.",
      error: error.message,
    });
  }
};

