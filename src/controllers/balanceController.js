const { Op } = require("sequelize");
const balanceModel = require("../models/balanceModel");
const userModel = require("../models/userModel");

async function getBalances(req, res) {
    try {
        const { userId } = req.params;

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

            if (!summary[otherUser.userId]) {
                summary[otherUser.userId] = {
                    userId: otherUser.userId,
                    email: otherUser.email,
                    // amount: 0,
                    reasons: []
                };
            }

            summary[otherUser.userId].reasons.push({
                balanceId: balance.balanceId,
                reason: balance.reason,
                amount: Number(balance.amount),
                type: isOwedToMe ? "OWES_YOU" : "YOU_OWE"
            });
        });

        const data = Object.values(summary).map(item => ({
            ...item,
            // amount: Math.abs(item.amount).toFixed(2),
            // type: item.amount >= 0 ? "OWES_YOU" : "YOU_OWE"
        }));

        return res.status(200).json({
            success: true,
            count: data.length,
            data
        });
    } catch (error) {
        console.log("Error in getBalances: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

module.exports = { getBalances };