const jwt = require('jsonwebtoken');

// comment
module.exports = function(req, res, next) {
    const token = req.header('auth-token');
 
    if(!token){
        return res.status(200).json({status: false,message : 'Access Denied!'})
    }

    try{
        const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.admin = verified;
        next();
    } catch(err){
        res.status(200).json({status: false,message : 'Invalid Token', error: err})
    }
}