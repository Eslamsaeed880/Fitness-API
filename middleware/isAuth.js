import jwt from 'jsonwebtoken';

const isAuth = async (req, res, next) => {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
        return res.status(401).json({ message: 'Not authenticated.' });
    }

    const token = authHeader.split(' ')[1];
    let decodedToken;

    try {
        decodedToken = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
        return res.status(500).json({ message: 'Token verification failed.', error: err.message });
    }
    req.user = { id: decodedToken.userId };
    next();
};

export default isAuth;