const express = require('express');
const router = express.Router();

const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

const User = require("../models/User.model");
const Coctel = require("../models/Coctel.model");
const fileUploader = require('../config/cloudinary.config');

const path = require("path");



/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

router.get("/profile", (req, res, next) => {
  res.render("profile");
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
router.get("/crear", (req, res, next) => {
  res.render("crear")
})


router.post("/crear",fileUploader.single('coctel-cover-image'), (req, res) => {
  const { name, alcohol, ingredientes } = req.body;
    console.log("req.file", req.file);


  Coctel.create({ name, alcohol, ingredientes, imageUrl: req.file.path })
    .then(newlyCreatedCoctelFromDB => {
        console.log("newlyCreatedCoctelFromDB: ", newlyCreatedCoctelFromDB);
    
    res.redirect("/principal")
  })
  .catch(error => console.log(`Error while creating a new coctel: ${error}`));
})



module.exports = router;