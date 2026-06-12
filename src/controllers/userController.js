const bcrypt = require("bcrypt");
const { Op } = require('sequelize')
const userModel = require("../models/userModel");

async function registerUser(req, res) {
    try {
        const { email, password, currency = "INR" } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const existingUser = await userModel.findOne({ where: { email } });

        if (existingUser) {
            return res.status(409).json({ success: false, message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await userModel.create({ email, password: hashedPassword, currency });

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            data: { userId: user.userId, email: user.email, currency: user.currency }
        });
    } catch (error) {
        console.log("Error in registerUser: ", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.errors.map(err => err.message).join(", ") });

    }
}

async function getUser(req, res) {
    try {
        const { userId } = req.params;

        const user = await userModel.findByPk(userId, { attributes: ["userId", "email", "currency", "createdAt"] });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.log("Error in getProfile: ", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.errors.map(err => err.message).join(", ") });

    }
}

async function updateUser(req, res) {
    try {
        const { userId } = req.params;
        const { email, currency } = req.body;

        const user = await userModel.findByPk(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (email && email !== user.email) {
            const existingUser = await userModel.findOne({ where: { email } });

            if (existingUser) {
                return res.status(409).json({ success: false, message: "Email already exists" });
            }
        }

        await user.update({ email: email || user.email, currency: currency || user.currency });

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: {
                userId: user.userId,
                email: user.email,
                currency: user.currency
            }
        });
    } catch (error) {
        console.log("Error in updateProfile: ", error);
        return res.status(500).json({ success: false, message: "Internal server error", error });
    }
}

async function deleteUser(req, res) {
    try {
        const { userId } = req.params;

        const user = await userModel.findByPk(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        await user.destroy();

        return res.status(200).json({
            success: true,
            message: "Account deleted successfully"
        });
    } catch (error) {
        console.log("Error in deleteUser: ", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.errors.map(err => err.message).join(", ") });

    }
}

module.exports = {
    registerUser,
    getUser,
    updateUser,
    deleteUser
};