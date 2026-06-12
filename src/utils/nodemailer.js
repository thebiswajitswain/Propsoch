const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Mail Config Error:", error);
    } else {
        console.log("✅ Mail Server Ready");
    }
});

module.exports = transporter;