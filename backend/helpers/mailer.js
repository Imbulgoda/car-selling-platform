import "dotenv/config";
import nodemailer from "nodemailer";

const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

console.log("MAILER user:", user);
console.log("MAILER pass length:", pass?.length);

 //Single transporter for entire project
 
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user, pass },
});

 //Common email template

const generateEmailTemplate = ({ title, message, details }) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f9f9f9; border-radius: 8px;">
  <h2 style="color:#0d6efd;text-align:center">${title}</h2>
  <p>${message}</p>
  ${details ? `<hr/><div>${details}</div>` : ""}
  <hr/>
  <p style="text-align:center;font-size:14px">
    Thank you for using <strong>Rent My Car</strong>
  </p>
</div>
`;

 //EMAIL VERIFICATION 

export async function sendVerifyEmail(to, verifyUrl) {
  return transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: "Verify your email",
    html: `
      <h3>Email Verification</h3>
      <p>Please verify your email by clicking the button below: (Link expire with in 10 minutes)</p>
      <a href="${verifyUrl}"
         style="display:inline-block;padding:10px 16px;background:#2563eb;color:white;text-decoration:none;border-radius:6px">
         Verify Email
      </a>
      <p>If you didn’t request this, ignore this email.</p>
      <p>Thank you for your understanding,<br/>
      Rent My Car Team</p><br/>
      <pstyle="font-size: 12px; color: #666;">
      (Please do not reply to this automated email.)</p>
    `,
  });
}

//OTP mail
export async function sendOtpEmail(to, firstName, otp) {
  return transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: "Your Rent My Car OTP Code",
    html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <h2 style="margin: 0 0 10px;">Rent My Car – Password Reset Code</h2>

      <p>Hi ${firstName},</p>

      <p>We received a request to reset your Rent My Car account password.</p>

      <p style="margin: 16px 0;">Your OTP code is:</p>

      <div style="
        display: inline-block;
        padding: 12px 18px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 22px;
        letter-spacing: 4px;
        font-weight: bold;
      ">
        ${otp}
      </div>

      <p style="margin-top: 16px;">
        This OTP code will expire in <b>10 minutes</b>.
      </p>

      <p>If you didn’t request this, you can ignore this email.</p>

      <p style="margin-top: 24px;">Thanks,<br/>Rent My Car Team</p>

      <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />

      <p style="font-size: 12px; color: #666;">
        (Please do not reply to this automated email.)
      </p>
    </div>
    `
  });
}

//common email for suspended accounts.
export async function suspendOwner(to, name, Date) {
  return transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: "Suspension Notice.",
    html: `
    <p>Hi ${name},</p>
    <p>We're writing to inform you that your <b>Rent My Car</b> account has been <b>suspended</b> due to a <b>violation of our Terms and Conditions.</b></p>
    <p>During the suspension period, you won't be able to access certain features of the platform.</p>
    <p><b>What happens next</b></p>
    <ul>
      <li>Your account will remain suspended <b>until ${Date}.</b></li>
      <li>After <b>${Date},</b> you can <b>verify your account again</b> and request reactivation through the app/website.</li>
    </ul>
    <p>If you'd like to review our rules, please check the Terms and Conditions within the Rent My Car platform.<br/><br/>
    Thank you for your understanding,<br/>
    Rent My Car Team</p><br/>
    <p>(Please do not reply to this automated email.)</p>
    `
  })
  
}

/**
 * BOOKING EMAIL
 * type = approved | rejected | updated | cancelled
 */
export async function sendBookingEmail({ type, booking, customer, owner, vehicle }) {

  let title = "Booking Update - Rent My Car";
  let message = "";
  let statusText = "";

  switch (type) {
    case "approved":
      title = "Booking Approved - Rent My Car";
      message = `Dear ${customer.first_name}, your booking has been approved.`;
      statusText = "Approved";
      break;

    case "rejected":
      title = "Booking Rejected - Rent My Car";
      message = `Dear ${customer.first_name}, your booking has been rejected.`;
      statusText = "Rejected";
      break;

    case "updated":
      title = "Booking Updated - Rent My Car";
      message = `Dear ${owner.first_name}, a booking has been updated by the customer.`;
      statusText = "Updated";
      break;

    case "cancelled":
      title = "Booking Cancelled - Rent My Car";
      message = `Dear ${owner.first_name}, a booking has been cancelled by the customer.`;
      statusText = "Cancelled";
      break;
  }

  const details = `
    <h3>Booking Details</h3>
    <p><strong>Vehicle:</strong> ${vehicle.title} (${vehicle.numberPlate})</p>
    <p><strong>Booking Dates:</strong> ${booking.startingDate.toDateString()} to ${booking.endDate.toDateString()}</p>
    <p><strong>Status:</strong> ${statusText}</p>
  `;

  // Decide receiver
  const toEmail =
    type === "approved" || type === "rejected"
      ? customer.email     // customer emails
      : owner.email;       // owner emails

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: toEmail,
    subject: title,
    html: generateEmailTemplate({ title, message, details }),
  });
}

/**
 * VEHICLE EMAIL
 * type = approved | rejected
 */
export async function sendVehicleEmail({ type, vehicle, owner }) {
  const title =
    type === "approved"
      ? "Vehicle Approved - Rent My Car"
      : "Vehicle Rejected - Rent My Car";

  const message =
    type === "approved"
      ? `Dear ${owner.first_name}, your vehicle has been approved and is now visible to customers.`
      : `Dear ${owner.first_name}, your vehicle has been rejected. Please check the details and resubmit if needed.`;


  const details = `
    <h3>Vehicle Details</h3>
    <p><strong>Title:</strong> ${vehicle.title}</p>
    <p><strong>Model:</strong> ${vehicle.model} (${vehicle.year})</p>
    <p><strong>Number Plate:</strong> ${vehicle.numberPlate}</p>
    <p><strong>Status:</strong> ${type === "approved" ? "Approved" : "Rejected"}</p>
  `;

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: owner.email,
    subject: title,
    html: generateEmailTemplate({ title, message, details }),
  });
}

// Notify owner of new booking request
export async function sendNewBookingRequestEmail({ booking, owner, customer, vehicle }) {
  const title = "New Booking Request - Rent My Car";
  const message = `Dear ${owner.first_name}, ${customer.first_name} requested to book your vehicle.`;

  const details = `
    <h3>Booking Details</h3>
    <p><strong>Customer:</strong> ${customer.first_name} ${customer.last_name} (${customer.email})</p>
    <p><strong>Vehicle:</strong> ${vehicle.title} (${vehicle.numberPlate})</p>
    <p><strong>Booking Dates:</strong> ${booking.startingDate.toDateString()} to ${booking.endDate.toDateString()}</p>
    <p><strong>Status:</strong> Pending</p>
  `;

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: owner.email,
    subject: title,
    html: generateEmailTemplate({ title, message, details }),
  });
}

// Notify admin of vehicle changes (new, updated, deleted)
export async function sendAdminVehicleNotificationEmail({ vehicle, owner, adminEmail, type }) {
  let title = "";
  let message = "";

  switch(type) {
    case "new":
      title = "New Vehicle Approval Request - Rent My Car";
      message = `Dear Admin, a new vehicle has been submitted by ${owner.first_name} and requires your approval.`;
      break;

    case "updated":
      title = "Vehicle Updated - Rent My Car";
      message = `Dear Admin, ${owner.first_name} updated their vehicle "${vehicle.title}". Please review the changes.`;
      break;

    case "deleted":
      title = "Vehicle Deleted - Rent My Car";
      message = `Dear Admin, ${owner.first_name} deleted their vehicle "${vehicle.title}" (${vehicle.numberPlate}).`;
      break;
  }

  const details = `
    <h3>Vehicle Details</h3>
    <p><strong>Owner:</strong> ${owner.first_name} ${owner.last_name} (${owner.email})</p>
    <p><strong>Title:</strong> ${vehicle.title}</p>
    <p><strong>Model:</strong> ${vehicle.model} (${vehicle.year})</p>
    <p><strong>Number Plate:</strong> ${vehicle.numberPlate}</p>
    <p><strong>Status:</strong> ${type === "new" ? "Pending Approval" : type === "updated" ? "Updated" : "Deleted"}</p>
  `;

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: adminEmail,
    subject: title,
    html: generateEmailTemplate({ title, message, details }),
  });
}

/**
 * PAYMENT EMAIL
 * type = initiated | owner_initiated | received | success | failed | refunded
 */
export async function sendPaymentEmail({ type, payment, customer, owner, vehicle, booking }) {
  // Defensive checks
  if (!payment || !payment.amount) {
    console.error("sendPaymentEmail: Invalid payment object");
    return;
  }

  // Use currency from payment (LKR or USD)
  const currencySymbol = payment.amount.currency === 'LKR' ? 'Rs.' : '$';
  
  let title = "Payment Update - Rent My Car";
  let message = "";
  let statusText = "";
  let toEmail = "";

  switch (type) {
    case "initiated":
      if (!customer || !vehicle) {
        console.error("sendPaymentEmail: Missing customer or vehicle for initiated payment");
        return;
      }
      title = "Payment Processing - Rent My Car";
      message = `Dear ${customer.first_name}, your payment of ${currencySymbol}${payment.amount.amount} for ${vehicle.title} is being processed.`;
      statusText = "Processing";
      toEmail = customer.email;
      break;
      
    case "owner_initiated":
      if (!owner || !customer || !vehicle) {
        console.error("sendPaymentEmail: Missing owner, customer or vehicle for owner_initiated");
        return;
      }
      title = "Payment Initiated by Customer - Rent My Car";
      message = `Dear ${owner.first_name}, ${customer.first_name} has initiated a payment of ${currencySymbol}${payment.amount.amount} for your vehicle ${vehicle.title}.`;
      statusText = "Payment Initiated";
      toEmail = owner.email;
      break;

    case "received":
      if (!owner || !customer) {
        console.error("sendPaymentEmail: Missing owner or customer for received payment");
        return;
      }
      title = "Payment Received - Rent My Car";
      message = `Dear ${owner.first_name}, you have received a payment of ${currencySymbol}${payment.amount.amount} for your vehicle.`;
      statusText = "Payment Received";
      toEmail = owner.email;
      break;

    case "success":
      if (!customer) {
        console.error("sendPaymentEmail: Missing customer for success payment");
        return;
      }
      title = "Payment Successful - Rent My Car";
      message = `Dear ${customer.first_name}, your payment of ${currencySymbol}${payment.amount.amount} was successful. Your booking is confirmed.`;
      statusText = "Paid";
      toEmail = customer.email;
      break;

    case "failed":
      if (!customer) {
        console.error("sendPaymentEmail: Missing customer for failed payment");
        return;
      }
      title = "Payment Failed - Rent My Car";
      message = `Dear ${customer.first_name}, your payment of ${currencySymbol}${payment.amount.amount} failed. Please try again with a different payment method.`;
      statusText = "Payment Failed";
      toEmail = customer.email;
      break;

    case "refunded":
      if (!owner || !customer) {
        console.error("sendPaymentEmail: Missing owner or customer for refunded payment");
        return;
      }
      title = "Payment Refunded - Rent My Car";
      message = `Dear ${owner.first_name}, a payment of ${currencySymbol}${payment.amount.amount} from ${customer.first_name} has been refunded.`;
      statusText = "Refunded";
      toEmail = owner.email;
      break;
      
    default:
      console.error(`sendPaymentEmail: Unknown payment type: ${type}`);
      return;
  }

  // Build email details
  let details = `
    <h3>Payment Details</h3>
    <p><strong>Amount:</strong> ${currencySymbol}${payment.amount.amount}</p>
    <p><strong>Platform Fee:</strong> ${currencySymbol}${payment.amount.platformFee}</p>
    <p><strong>Currency:</strong> ${payment.amount.currency}</p>
    <p><strong>Payment Method:</strong> ${payment.amount.paymentMethod}</p>
    <p><strong>Status:</strong> ${statusText}</p>
    <p><strong>Payment Date:</strong> ${new Date(payment.paymentDate).toDateString()}</p>
  `;

  // Add vehicle details if available
  if (vehicle) {
    details += `
      <h3>Vehicle Details</h3>
      <p><strong>Vehicle:</strong> ${vehicle.title || 'N/A'}</p>
      <p><strong>Number Plate:</strong> ${vehicle.numberPlate || 'N/A'}</p>
    `;
  }

  // Add booking details if available
  if (booking) {
    details += `
      <h3>Booking Details</h3>
      <p><strong>Booking Dates:</strong> ${new Date(booking.startingDate).toDateString()} to ${new Date(booking.endDate).toDateString()}</p>
    `;
  }

  // Add customer information for owner notifications
  if (type === "received" || type === "refunded" || type === "owner_initiated") {
    const customerName = customer.last_name 
      ? `${customer.first_name} ${customer.last_name}`
      : customer.first_name;
      
    details += `
      <h3>Customer Information</h3>
      <p><strong>Name:</strong> ${customerName}</p>
      <p><strong>Email:</strong> ${customer.email}</p>
    `;
  }

  // Send email using transporter and template
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: toEmail,
      subject: title,
      html: generateEmailTemplate({ title, message, details }),
    });
    console.log(`✅ Payment email sent: ${type} to ${toEmail}`);
  } catch (error) {
    console.error(`❌ Failed to send payment email: ${error.message}`);
  }
}


