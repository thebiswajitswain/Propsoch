const express = require("express");
const router = express.Router();
const { getBalances } = require("../controllers/balanceController");

router.get('/getBalances/:userId', getBalances);    

module.exports = router;