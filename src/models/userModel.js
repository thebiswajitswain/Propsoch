const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const balanceModel = require("./balanceModel")

const User = sequelize.define("User", {
    userId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        // unique: true,
        allowNull: false,
        validate: {
            isEmail: {
                msg: "Invalid email address"
            }
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        // validate: {
        //     len: {
        //         args: [8, 20],
        //         msg: "Password must be between 8 and 20 characters"
        //     }
        // }
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
    }
}, {
    timestamps: true,
    paranoid: true
});

module.exports = User;


balanceModel.belongsTo(User, { foreignKey: "userId", as: "user" });
balanceModel.belongsTo(User, { foreignKey: "paidTo", as: "paidToUser" })