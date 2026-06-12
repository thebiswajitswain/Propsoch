const express = require("express");
const router = express.Router();
const { registerUser, getUser, updateUser, deleteUser } = require("../controllers/userController");

router.get("/", (req, res) => { res.send("API Working"); });
router.post("/register", registerUser);
router.get('/getUser/:userId', getUser);
router.put('/updateUser/:userId', updateUser);
router.delete('/deleteUser/:userId', deleteUser);

module.exports = router;