// Admin role verification middleware
const checkAdminRole = (req, res, next) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. Admin role required.' 
            });
        }

        next();
    } catch (error) {
        console.error('Error in admin middleware:', error);
        res.status(500).json({ success: false, message: 'Authorization error' });
    }
};

module.exports = checkAdminRole;
