const { createMollieClient } = require("@mollie/api-client");
const { Resend } = require("resend");

const mollieClient = createMollieClient({
  apiKey: process.env.MOLLIE_API_KEY,
});

const resend = new Resend(process.env.RESEND_API_KEY);
const TEST_EMAIL = "intesar.hogent@gmail.com";

module.exports = async (req, res) => {
  const { id } = req.query;
  if (!id) {
    res.status(400).json({ error: "id is required" });
    return;
  }

  try {
    const payment = await mollieClient.payments.get(id);

    if (payment.status === "paid" && process.env.RESEND_API_KEY) {
      const md = payment.metadata || {};
      const realUserEmail = md.userEmail || md.email || "unknown";
      const amountValue = payment.amount && payment.amount.value ? payment.amount.value : "0.00";
      const desc = payment.description || "HAWC booking";

      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: TEST_EMAIL,
        subject: "HAWC booking payment paid",
        html: `
          <h2>Payment paid</h2>
          <p>Your payment for <strong>${desc}</strong> was paid.</p>
          <p>Amount: <strong>€${amountValue}</strong></p>
          <p>Original user email: <strong>${realUserEmail}</strong></p>
          <p>Payment ID: <strong>${payment.id}</strong></p>
        `,
      });
    }

    res.status(200).json({
      id: payment.id,
      status: payment.status,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch payment status" });
  }
};
