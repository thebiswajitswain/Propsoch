const router = require("express").Router();
const { createExpense, getExpense, getAllExpenses, updateExpense, deleteExpense, getActivityLogs } = require("../controllers/expenseController");

router.post("/createExpense", createExpense);
router.get("/getAllExpenses", getAllExpenses);
router.get("/getExpense/:expenseId", getExpense);
router.put("/updateExpense/:expenseId", updateExpense);
router.delete("/deleteExpense/:expenseId", deleteExpense);
router.get('/getActivityLogs', getActivityLogs)

module.exports = router;