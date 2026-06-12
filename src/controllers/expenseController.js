const { Op } = require('sequelize')
const sequelize = require('../config/database')
const expenseModel = require("../models/expenseModel");
const balanceModel = require("../models/balanceModel")

async function generateBalances({ expenseId, name, amount, currency, paidBy, members, transaction = null }) {
    const uniqueMembers = [...new Set(members)];
    const shareAmount = Number((amount / uniqueMembers.length).toFixed(2));

    const balances = uniqueMembers
        .filter(memberId => memberId !== Number(paidBy))
        .map(memberId => ({
            expenseId,
            userId: memberId,
            paidTo: paidBy,
            amount: shareAmount,
            currency,
            reason: name
        }));

    if (balances.length) {
        await balanceModel.bulkCreate(balances, { transaction });
    }
}

async function createExpense(req, res) {
    const transaction = await sequelize.transaction();
    try {
        const { name, amount, currency, paidBy, members, expenseDate } = req.body;
        const uniqueMembers = [...new Set(members)];

        if (!uniqueMembers.includes(Number(paidBy))) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: "PaidBy user must be included in members" });
        }

        const expense = await expenseModel.create({ name, amount, currency, paidBy, members: uniqueMembers, expenseDate }, { transaction });

        await generateBalances({ expenseId: expense.expenseId, name, amount, currency, paidBy, members: uniqueMembers, transaction });
        await transaction.commit();

        return res.status(201).json({ success: true, message: "Expense created successfully", data: expense });
    } catch (error) {
        console.log("Error in createExpense: ", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.errors.map(err => err.message).join(", ") });
    }
}

async function getExpense(req, res) {
    try {
        const { expenseId } = req.params;

        const expense = await expenseModel.findByPk(expenseId);

        if (!expense) {
            return res.status(404).json({ success: false, message: "Expense not found" });
        }

        return res.status(200).json({ success: true, data: expense });
    } catch (error) {
        console.log("Error in getExpense: ", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.errors.map(err => err.message).join(", ") });
    }
}

async function getAllExpenses(req, res) {
    try {
        const expenses = await expenseModel.findAll({ order: [["expenseId", "ASC"]] });
        return res.status(200).json({ success: true, count: expenses.length, data: expenses });
    } catch (error) {
        console.log("Error in getExpenses: ", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.errors.map(err => err.message).join(", ") });
    }
}

async function updateExpense(req, res) {
    const transaction = await sequelize.transaction();
    try {
        const { expenseId } = req.params;

        const expense = await expenseModel.findByPk(expenseId);
        if (!expense) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: "Expense not found" });
        }

        const updatedData = {
            name: req.body.name ?? expense.name,
            amount: req.body.amount ?? expense.amount,
            currency: req.body.currency ?? expense.currency,
            paidBy: req.body.paidBy ?? expense.paidBy,
            members: req.body.members ?? expense.members,
            expenseDate: req.body.expenseDate ?? expense.expenseDate
        };

        updatedData.members = [...new Set(updatedData.members)];
        if (!updatedData.members.includes(Number(updatedData.paidBy))) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: "PaidBy user must be included in members" });
        }

        await balanceModel.destroy({ where: { expenseId }, transaction });
        await expense.update(updatedData, { transaction });
        await generateBalances({ expenseId: expense.expenseId, ...updatedData, transaction });
        await transaction.commit();

        return res.status(200).json({ success: true, message: "Expense updated successfully", data: expense });
    } catch (error) {
        console.log("Error in updateExpense: ", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.errors.map(err => err.message).join(", ") });
    }
}

async function deleteExpense(req, res) {
    try {
        const { expenseId } = req.params;
        const expense = await expenseModel.findByPk(expenseId);

        if (!expense) {
            return res.status(404).json({ success: false, message: "Expense not found" });
        }

        await balanceModel.destroy({ where: { expenseId } })
        await expense.destroy();
        return res.status(200).json({ success: true, message: "Expense deleted successfully" });
    } catch (error) {
        console.log("Error in deleteExpense: ", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.errors.map(err => err.message).join(", ") });
    }
}

async function getActivityLogs(req, res) {
    try {
        const { userId, type, startDate, endDate } = req.query;

        if (!userId) {
            return res.status(400).json({ success: false, message: "userId is required" });
        }

        let where = {};

        if (type === "currentMonth") {
            const start = new Date();
            start.setDate(1);
            start.setHours(0, 0, 0, 0);

            where.expenseDate = { [Op.gte]: start };
        } else if (type === "lastMonth") {
            const start = new Date();
            start.setMonth(start.getMonth() - 1);
            start.setDate(1);

            const end = new Date();
            end.setDate(0);

            where.expenseDate = { [Op.between]: [start, end] };
        } else if (startDate && endDate) {
            where.expenseDate = { [Op.between]: [startDate, endDate] };
        }

        const expenses = await expenseModel.findAll({ where, order: [["expenseDate", "DESC"]] });
        const activities = expenses.filter(expense => expense.paidBy == userId || expense.members.includes(Number(userId)));

        return res.status(200).json({ success: true, count: activities.length, data: activities });
    } catch (error) {
        console.log("Error in getActivityLogs: ", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.errors.map(err => err.message).join(", ") });
    }
}

module.exports = {
    createExpense,
    getExpense,
    getAllExpenses,
    updateExpense,
    deleteExpense,
    getActivityLogs
}