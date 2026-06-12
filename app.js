require("dotenv").config();
const express = require("express");
const app = express();
const sequelize = require("./src/config/database");

require("./src/models/userModel");
require("./src/models/expenseModel");
require("./src/models/balanceModel");
require("./src/utils/monthlyReport")

const userRoute = require("./src/routes/userRoute");
const expenseRoute = require("./src/routes/expenseRoute");
const balanceRoute = require("./src/routes/balanceRoute");

app.use(express.json());

app.use("/propsoch/api/users", userRoute);
app.use("/propsoch/api/expenses", expenseRoute);
app.use("/propsoch/api/balances", balanceRoute);

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log("✅ MySQL Connected Successfully");

        await sequelize.sync();
        console.log("✅ Tables Synced");

        app.listen(process.env.PORT || 4000, () => {
            console.log(`🚀 Server running on port ${process.env.PORT || 4000}`);
        });
    } catch (error) {
        console.error("❌ Database Connection Failed");
        console.error(error);
    }
}

startServer();