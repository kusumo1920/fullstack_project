const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(403).json({
      code: 403,
      message: "Forbidden access to secured resources.",
      data: null,
    });
  }

  jwt.verify(token, process.env.TOKEN_SECRET, async (err, user) => {
    console.log(err);

    if (err) {
      return res.status(403).json({
        code: 403,
        message: "Forbidden access to secured resources.",
        data: null,
      });
    }

    let userFromDb = null;

    try {
      userFromDb = await prisma.user.findFirst({
        where: {
          username: user.username,
        },
      });
    } catch (err) {
      return res
        .status(403)
        .json({
          code: 403,
          message: "Forbidden access to secured resources.",
          data: null,
        });
    }

    req.user = userFromDb;

    next();
  });
}

module.exports = {
  authenticateToken,
};
