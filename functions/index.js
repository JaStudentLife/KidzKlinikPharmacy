const functions = require("firebase-functions");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(functions.config().sendgrid.key);

exports.sendPickupNotification = functions.https.onRequest(async (req, res) => {
  const { to, name } = req.body;

  const msg = {
    to,
    from: "shavyt.morgan@gmail.com", 
    subject: "Your Medication is Ready",
    text: `Hi ${name},\n\nYour medication is ready for pickup.\n\nThanks,\nKidz Klinik Pharmacy`,
  };

  try {
    await sgMail.send(msg);
    res.status(200).send("Email sent");
  } catch (error) {
    console.error("SendGrid error:", error);
    res.status(500).send("Email failed to send");
  }
});