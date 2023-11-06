const express = require("express");
const cors = require("cors");
const db = require('./app/models/index.js');
const swaggerUi = require('swagger-ui-express');
const bodyParser = require('body-parser');
const swaggerSpec = require('./app/config/swagger.config.js');

const app = express();

var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
// parse requests of content-type - application/json
app.use(express.json()); /* bodyParser.json() is deprecated */

// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true })); /* bodyParser.urlencoded() is deprecated */

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

require("./app/routes/forum.routes.js")(app);
require("./app/routes/auth.routes.js")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});