const db = require("../models");
const AwsService = require("../cognito-service/index");
const Forum = db.forums;
const Op = db.Sequelize.Op;

exports.create = (req, res) => {
  // Validate request
  if (!req.body.title) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a Forum
  const forum = {
    title: req.body.title,
    description: req.body.description,
    published: req.body.published ? req.body.published : false
  };

  // Save Tutorial in the database
  Forum.create(forum)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Tutorial."
      });
    });
};

exports.findAll = (req, res) => {
  const title = req.query.title;
  var condition = title ? { title: { [Op.iLike]: `%${title}%` } } : null;

  Forum.findAll({ where: condition })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials."
      });
    });
};

exports.findOne = (req, res) => {
  const id = req.params.id;

  Forum.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Tutorial with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Tutorial with id=" + id
      });
    });
};

exports.update = (req, res) => {
  const id = req.params.id;

  Forum.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Forum was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Forum with id=${id}. Maybe Forum was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Forum with id=" + id
      });
    });
};


exports.delete = (req, res) => {
  const id = req.params.id;

  Forum.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Forum was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Forum with id=${id}. Maybe Forum was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Forum with id=" + id
      });
    });
};
