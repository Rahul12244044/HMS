import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    const token=req.cookies.tokenAuth;
    if(!token){
        return res.status(404).json({message:"User not found"});
    }
    try {
        const decoded = jwt.verify(token, 'jsjfioewrnkldifiewrqnmsdrew'); 
        req.user = decoded; 
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export default authMiddleware;
