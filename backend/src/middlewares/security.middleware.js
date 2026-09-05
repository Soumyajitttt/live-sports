import { httpArcjet } from '../arcjet.js';
import asyncHandler from '../utils/asyncHandler.js';

function securityMiddleware() {
    return asyncHandler(async (req, res, next) => {
        if(!httpArcjet) return next();

        const decision = await httpArcjet.protect(req);

        if(decision.isDenied()) {
            if(decision.reason.isRateLimit()) {
                return res.status(429).json({ error: 'Too many requests.' });
            }

            return res.status(403).json({ error: 'Forbidden.' });
        }

        next();
    });
}

export { securityMiddleware };