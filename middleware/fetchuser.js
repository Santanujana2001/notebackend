const jwt = require("jsonwebtoken");
const jwt_secure = "santanu";
 
const fetchuser=(req,res,next)=>{
    // Get the user from jwt token and add id to req object
    const token = req.header('auth-token');
    if(!token){
        req.status(401).send({error:"Please Authenticate user"})
    }
try {
    const data =jwt.verify(token,jwt_secure);
    req.user=data.user;
    next();
} catch (error) {
    req.status(401).send({error:"Please Authenticate user"})
}
}
module.exports=fetchuser;