const express = require("express");
const router = express.Router();
const { userRegister, userLogin, userLogout } = require("../controllers/authControllers");

router.post("/user-register", userRegister);
router.post("/user-login", userLogin);
router.post("/user-logout", userLogout);

module.exports = router;
