import rateLimit from 'express-rate-limit';

const limiter = (windowM, max) => rateLimit({
    windowMs: windowM * 60 * 1000,
    max,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

export default limiter;
