module.exports = app => {
  const auth = require("../controllers/auth.controller");
  const verifyToken = require('../controllers/auth.controller');
  var router = require("express").Router();

  // Create a new Forum
  router.post("/signup", auth.SignUp);

  // Retrieve all Tutorials
  router.post("/verify", auth.Verify);

  // Update a Tutorial with id
  router.post("/signin", auth.SignIn);
  router.get("/login-google", auth.SignInGoogle)

  router.get("/verify-token", auth.VerifyToken);
  
  router.post("/change-password", auth.ChangePassword);
  
  router.post("/renew", auth.RefreshToken);
  
  router.post("/forgot-password", auth.ForgotPassword);
  
  router.post("/reset-password", auth.ResetPassword);
  
  router.get("/user", auth.getUser);
  
  router.post("/user/update", verifyToken.VerifyToken, auth.updateUsers);

  app.use('/api', router);
}