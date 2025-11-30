module.exports = function requireRole(...allowedRoles) {
  return (req, res, next) => {
    // Falls jwtAuth nicht vorher gelaufen ist
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        message: "Zugriff verweigert – keine Rolle im Token gefunden",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Zugriff verweigert – Rolle nicht ausreichend",
      });
    }

    next();
  };
};
