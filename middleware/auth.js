const jwt = require("jsonwebtoken");
const { secretKey } = require("../config/db"); 


//it verifies the token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Token is required" });
  }
//   console.log(token.split(" ")[1])   
  console.log("token->", token);
  jwt.verify(token.split(" ")[1], secretKey, { expiresIn: '1h' },(err, decoded) => {
    if (err) {
        console.log("err:",err)
      return res.status(403).json({ message: "Invalid token" });
    }

    req.user = decoded; // Add decoded user information to the request object
    next();
  });
};


//it will check if admin then only it will allow to login
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin" ) {
    return res.status(403).json({ message: "Unauthorized" });
  }
  next();
};


const hasRole = (roles) => {
  return (req, res, next) => {
    const userRole = req.user.role; 
    if (roles.includes(userRole)) {
      return next();
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }
  };
};


module.exports = {
  verifyToken,
  isAdmin,
  hasRole
};