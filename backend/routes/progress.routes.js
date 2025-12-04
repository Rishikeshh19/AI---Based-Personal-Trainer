const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Placeholder for progress routes
router.use(protect);

router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Progress routes - Coming soon',
        data: []
    });
});

module.exports = router;
