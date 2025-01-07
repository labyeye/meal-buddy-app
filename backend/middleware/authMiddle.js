
const decodeToken = async (req, res, next) => {
    let token;
    if (req.headers.authorization?.startsWith("Bearer")) {
      try {
        token = req.headers.authorization?.split(" ")[1];
        if (!token) {
          res.status(401).send({ message: "Not Authorized,No token" });
        }
  
        const decoded = jwt.verify(token, appConfig.jwtSecret);
  
        if (decoded) {
          return decoded;
        }
  
        next();
      } catch (error) {
        res.status(401).send({ message: "Not Authorized" });
      }
    }
    if (!token) {
      res.status(401).send({ message: "Not Authorized,No token" });
    }
  };


const verifyToken = async (req, res, next) => {
    const decoded = await decodeToken(req, res, next);
  
    if (decoded) {
      req.user = decoded;
      return next();
    }
  }


export {verifyToken};