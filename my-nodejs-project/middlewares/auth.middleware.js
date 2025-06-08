import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    // console.log("authMiddleware: ");
    const token=req.cookies.tokenAuth;
    // console.log("req.cookies: ");
    // console.log(req.cookies);
    if(!token){
        return res.status(404).json({message:"User not found"});
    }
    try {
        const decoded = jwt.verify(token, 'jsjfioewrnkldifiewrqnmsdrew'); // Use your secret key
        req.user = decoded; // Attach user info to req.user
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export default authMiddleware;
