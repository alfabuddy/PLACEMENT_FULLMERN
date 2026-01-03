import Razorpay from "razorpay";
import crypto from "crypto";
import Ride from "../models/rideModel.js";
import User from "../models/userModel.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateRidePdf } from "../utils/generateRidePdf.js";


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const sendRidePaymentSummaryEmail = async (ride) => {
  const users = await User.find({
    _id: { $in: ride.participants },
  }).select("name email");

  const pdfBuffer = await generateRidePdf(ride, users);

  const rows = ride.payments.map((p) => {
    const user = users.find(
      (u) => u._id.toString() === p.user.toString()
    );

    return `
      <tr>
        <td>${user?.name}</td>
        <td>${user?.email}</td>
        <td>${p.method}</td>
        <td>${p.paymentId || "CASH"}</td>
      </tr>
    `;
  }).join("");

  const html = `
    <h2>Ride Payment Completed ✅</h2>

    <p><strong>From:</strong> ${ride.startLocation.address}</p>
    <p><strong>To:</strong> ${ride.endLocation.address}</p>
    <p><strong>Date & Time:</strong> ${new Date(ride.startTime).toLocaleString()}</p>
    <p><strong>Per Person Fare:</strong> ₹${ride.totalFare}</p>

    <table border="1" cellpadding="8" cellspacing="0">
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Payment Method</th>
        <th>Payment ID</th>
      </tr>
      ${rows}
    </table>

    <p>📎 A detailed PDF receipt is attached.</p>
  `;

  await sendEmail({
    to: users.map((u) => u.email).join(","),
    subject: "Ride Payment Summary",
    html,
    attachments: [
      {
        filename: "ride-summary.pdf",
        content: pdfBuffer,
      },
    ],
  });
};

/* =======================
   CREATE RAZORPAY ORDER
======================= */
export const createOrder = async (req, res) => {
  try {
    const { rideId } = req.body;
    const ride = await Ride.findById(rideId);

    if (!ride || ride.status !== "completed") {
      return res.status(400).json({ message: "Ride not completed" });
    }

    // Prevent duplicate payment
    const alreadyPaid = ride.payments.some(
      (p) => p.user.toString() === req.user._id.toString()
    );
    if (alreadyPaid) {
      return res.status(400).json({ message: "Payment already done" });
    }

    const participantsToPay = ride.participants.filter(
      (p) => p.toString() !== ride.creator.toString()
    );

   const amountPerPerson = ride.totalFare;


    const order = await razorpay.orders.create({
      amount: amountPerPerson * 100,
      currency: "INR",
      receipt: `ride_${rideId}`,
    });

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Order creation failed" });
  }
};

/* =======================
   CASH PAYMENT
======================= */
export const markCashPayment = async (req, res) => {
  const { rideId } = req.body;

  const ride = await Ride.findById(rideId);
  if (!ride) return res.status(404).json({ message: "Ride not found" });

  const alreadyPaid = ride.payments.some(
    (p) => p.user.toString() === req.user._id.toString()
  );
  if (alreadyPaid) {
    return res.status(400).json({ message: "Payment already done" });
  }

  ride.payments.push({
    user: req.user._id,
    paid: true,
    method: "cash",
  });

  await ride.save();

  // 🔥 CHECK IF ALL PAID → SEND EMAIL
  const totalToPay = ride.participants.length - 1;
  const paidCount = ride.payments.filter((p) => p.paid).length;

  if (paidCount === totalToPay) {
    await sendRidePaymentSummaryEmail(ride);
  }

  res.json({ success: true, message: "Cash payment marked" });
};

/* =======================
   VERIFY ONLINE PAYMENT
======================= */
export const verifyPayment = async (req, res) => {
  const { order_id, payment_id, signature, rideId } = req.body;

  const body = order_id + "|" + payment_id;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expected !== signature) {
    return res.status(400).json({ success: false });
  }

  const ride = await Ride.findById(rideId);
  if (!ride) return res.status(404).json({ message: "Ride not found" });

  const alreadyPaid = ride.payments.some(
    (p) => p.user.toString() === req.user._id.toString()
  );
  if (alreadyPaid) {
    return res.status(400).json({ message: "Payment already done" });
  }

  ride.payments.push({
    user: req.user._id,
    paid: true,
    paymentId: payment_id,
    method: "online",
  });

  await ride.save();

  // 🔥 CHECK IF ALL PAID → SEND EMAIL
  const totalToPay = ride.participants.length - 1;
  const paidCount = ride.payments.filter((p) => p.paid).length;

  if (paidCount === totalToPay) {
    await sendRidePaymentSummaryEmail(ride);
  }

  res.json({ success: true });
};
