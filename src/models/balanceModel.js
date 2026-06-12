const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Balance = sequelize.define("Balance", {
    balanceId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.BIGINT.UNSIGNED,
        defaultValue: null
    },
    expenseId: {
        type: DataTypes.BIGINT.UNSIGNED,
        defaultValue: null
    },
    paidTo: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    currency: {
        type: DataTypes.ENUM('INR', 'USD', 'EUR', 'CHF'),
        defaultValue: 'INR',
        validate: {
            isIn: {
                args: [['INR', 'USD', 'EUR', 'CHF']],
                msg: 'Currency must be one of INR, USD, EUR, or CHF'
            }
        }
    },
    reason: {
        type: DataTypes.STRING,
        defaultValue: null,
    },
}, {
    timestamps: true
});

module.exports = Balance;