const jwt = require('jsonwebtoken');
const createError = require('../utils/createError');

function requireAuth(req, res, next) {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");
    if (type !== "Bearer" || !token) {
        return next(createError(401, "Not logged in"));
    }
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        next(createError(401, "Invalid or expired token"));
    }
}
module.exports = { requireAuth };