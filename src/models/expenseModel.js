const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Expense = sequelize.define("Expense", {
    expenseId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Expense name is required"
            }
        }
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            notNull: {
                msg: "Amount is required"
            },
            min: {
                args: [0.01],
                msg: "Amount must be greater than 0"
            }
        }
    },
    currency: {
        type: DataTypes.ENUM('INR', 'USD', 'EUR', 'CHF'),
        defaultValue: 'INR',
        validate: {
            isIn: {
                args: [['INR', 'USD', 'EUR', 'CHF']],
                msg: 'Invalid currency selected'
            }
        }
    },
    paidBy: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        validate: {
            notNull: {
                msg: "PaidBy is required"
            }
        }
    },
    members: {
        type: DataTypes.JSON,
        allowNull: false,
        validate: {
            notNull: {
                msg: "Members are required"
            },
            isValidMembers(value) {
                if (!Array.isArray(value) || value.length === 0) {
                    throw new Error("Members must be a non-empty array");
                }
            }
        }
    },
    expenseDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            notNull: {
                msg: "Expense date is required"
            }
        }
    }
}, {
    timestamps: true,
    paranoid: true
});

module.exports = Expense;