const multer = require('multer');
const path = require('path');
const fs = require('fs');

fs.mkdirSync('uploads', { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename:(req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${req.user.id}${ext}`);
    },
});

const ALLOWED = ['application/pdf', 'image/png', 'image/jpeg'];
function fileFilter(req, file, cb) {
    if (ALLOWED.includes(file.mimetype)) return cb(null, true);
    const err = new Error('Only PDF, PNG, JPG are allows');
    err.status = 400;
    cb(err);
}
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2* 1024 * 1024 },
});

module.exports = upload;