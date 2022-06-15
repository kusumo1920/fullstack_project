var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
// const { promisePool } = require("../services/db");

router.post("/register", async function (req, res, next) {
  const requestBody = req.body;
  let hashedPassword = bcrypt.hashSync(requestBody.password, 5);

  try {
    // const [rows, fields] = await promisePool.query(
    //   `INSERT INTO users (username, email, password) VALUES ('${requestBody.username}', '${requestBody.email}', '${hashedPassword}')`
    // );
    const user = await prisma.user.create({
      data: {
        username: requestBody.username,
        email: requestBody.email,
        password: hashedPassword,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ code: 500, message: "Internal server error.", data: null });
  }

  return res.status(200).json({
    code: 200,
    message: "Successfully registering new user.",
    data: null,
  });
});

router.post("/login", async function (req, res, next) {
  const requestBody = req.body;
  let user = null;

  try {
    // const [rows, fields] = await promisePool.query(
    //   `SELECT * FROM users WHERE username = '${requestBody.username}'`
    // );
    const userFromDb = await prisma.user.findFirst({
      where: {
        username: requestBody.username,
      },
    });
    user = userFromDb;
  } catch (err) {
    return res
      .status(500)
      .json({ code: 500, message: "Internal server error.", data: null });
  }

  if (!user) {
    return res
      .status(401)
      .json({ code: 401, message: "Invalid username/password.", data: null });
  }

  const passwordVerification = bcrypt.compareSync(
    requestBody.password,
    user.password
  );

  if (!passwordVerification) {
    return res
      .status(401)
      .json({ code: 401, message: "Invalid username/password.", data: null });
  }

  const jwtToken = jwt.sign(
    { username: user.username, email: user.email },
    process.env.TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  return res.status(200).json({
    code: 200,
    message: "Successfully authenticating user.",
    data: {
      access_token: jwtToken,
    },
  });
});

module.exports = router;
