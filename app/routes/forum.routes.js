module.exports = app => {
  const forums = require("../controllers/forum.controller");
  const verifyToken = require('../controllers/auth.controller');
  var router = require("express").Router();

  // Create a new Forum
  router.post("/", verifyToken.VerifyToken, forums.create);

  // Retrieve all Tutorials
  router.get("/", verifyToken.VerifyToken, forums.findAll);

  // Retrieve a single Tutorial with id
  router.get("/:id", verifyToken.VerifyToken, forums.findOne);

  // Update a Tutorial with id 
  router.put("/:id", verifyToken.VerifyToken, forums.update);

  // Delete a Tutorial with id
  router.delete("/:id", verifyToken.VerifyToken, forums.delete);

  app.use('/api/forum', router);
}