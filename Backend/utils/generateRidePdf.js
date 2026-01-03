import PDFDocument from "pdfkit";

export const generateRidePdf = (ride, users) => {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    doc.fontSize(18).text("Ride Payment Summary", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`From: ${ride.startLocation.address}`);
    doc.text(`To: ${ride.endLocation.address}`);
    doc.text(`Date: ${new Date(ride.startTime).toLocaleString()}`);
    doc.text(`Per Person Fare: ₹${ride.totalFare}`);
    doc.moveDown();

    doc.text("Participants & Payments:");
    doc.moveDown(0.5);

    ride.payments.forEach((p, index) => {
      const user = users.find(u => u._id.toString() === p.user.toString());
      doc.text(
        `${index + 1}. ${user?.name} | ${user?.email} | ${p.method} | ${p.paymentId || "CASH"}`
      );
    });

    doc.end();
  });
};
