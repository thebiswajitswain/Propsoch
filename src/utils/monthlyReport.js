const { Op } = require("sequelize");
const balanceModel = require("../models/balanceModel");
const userModel = require("../models/userModel");
const transporter = require("./nodemailer");
const cron = require("node-cron");

async function sendMonthlyBalanceReport(userId) {
    try {
        const user = await userModel.findByPk(userId);

        if (!user) {
            console.log(`User ${userId} not found`);
            return;
        }

        const balances = await balanceModel.findAll({
            where: {
                [Op.or]: [
                    { userId },
                    { paidTo: userId }
                ]
            },
            include: [
                {
                    model: userModel,
                    as: "user",
                    attributes: ["userId", "email"]
                },
                {
                    model: userModel,
                    as: "paidToUser",
                    attributes: ["userId", "email"]
                }
            ]
        });

        const summary = {};

        balances.forEach(balance => {
            const isOwedToMe = Number(balance.paidTo) === Number(userId);

            const otherUser = isOwedToMe
                ? balance.user
                : balance.paidToUser;

            if (!otherUser) return;

            if (!summary[otherUser.userId]) {
                summary[otherUser.userId] = {
                    email: otherUser.email,
                    amount: 0
                };
            }

            summary[otherUser.userId].amount += isOwedToMe
                ? Number(balance.amount)
                : -Number(balance.amount);
        });

        const rows = Object.values(summary)
            .map(item => `
                <tr>
                    <td>${item.email}</td>
                    <td>${Math.abs(item.amount).toFixed(2)}</td>
                    <td>${item.amount >= 0 ? "Owes You" : "You Owe"}</td>
                </tr>
            `)
            .join("");

        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: 'biswajit@alleshealth.com',
            subject: "Monthly Balance Report",
            html: `
                <h2>Monthly Balance Report</h2>
                <table border="1" cellpadding="8" cellspacing="0">
                    <tr>
                        <th>User</th>
                        <th>Amount</th>
                        <th>Status</th>
                    </tr>
                    ${rows}
                </table>
            `
        });

        console.log(`✅ Mail sent to ${user.email}`);
        console.log(info.response);

    } catch (error) {
        console.error("❌ Error sending report:", error);
    }
}

cron.schedule("0 0 1 * *", async () => {
    try {
        console.log("🚀 Running cron");

        const users = await userModel.findAll();

        for (const user of users) {
            await sendMonthlyBalanceReport(user.userId);
        }

    } catch (error) {
        console.error("❌ Cron Error:", error);
    }
});

console.log("✅ Cron registered");