const express = require('express');
const router = express.Router();

const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

const User = require("../models/User.model");
const Coctel = require("../models/Coctel.model");


/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

router.get("/principal", (req, res, next) => {
  Coctel.find()
  .then(resp => {
    const data = { coctel: resp}
    res.render("principal", data);
  })
  .catch(err => {
    console.log("error render principal: ", err)
  })
});

router.get("/profile", (req, res, next) => {
  res.render("profile");
});

router.get("/crear", (req, res, next) => {
  res.render("crear")
})

router.post("/crear", (req, res, next) => {
  const { name, alcohol, ingredientes, pais, descripcion, procedimiento } = req.body;

  Coctel.create({ name, alcohol, ingredientes, pais, descripcion, procedimiento })
  .then(resp => {
    res.redirect("/principal")
  })
})

module.exports = router;