const jwt = require("jsonwebtoken");

module.exports = function jwtAuth(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Fehlender oder ungültiger Authorization-Header",
    });
  }

  const token = authHeader.substring(7); // "Bearer ".length = 7

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Nutzer-Infos aus dem Token an die Request hängen
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Ungültiges oder abgelaufenes JWT",
    });
  }
};
