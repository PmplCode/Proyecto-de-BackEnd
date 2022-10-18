const express = require('express');
const router = express.Router();

const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

const User = require("../models/User.model");
const Coctel = require("../models/Coctel.model");


/* GET home page */
router.get("/", isLoggedOut, (req, res, next) => {
  res.render("index");
});

router.get("/principal", isLoggedIn, (req, res, next) => {
  
  Coctel.find()
  .then(resp => {
    const data = { 
      coctel: resp,
      usuari: req.session.currentUser
    }
    console.log("req.session.currentUser - principal: ", req.session.currentUser)
    res.render("principal", data);
  })
  .catch(err => {
    console.log("error render principal: ", err)
  })
});

router.get("/profile", isLoggedIn, (req, res, next) => {
  const datado = {usuari:req.session.currentUser}

  res.render("profile",datado);
});

router.get("/crear", isLoggedIn, (req, res, next) => {
  res.render("crear")
})

router.post("/crear", isLoggedIn, (req, res, next) => {
  const { name, alcohol, ingredientes, pais, descripcion, procedimiento } = req.body;

  Coctel.create({ name, alcohol, ingredientes, pais, descripcion, procedimiento })
  .then(resp => {
    res.redirect("/principal")
  })
});

router.get("/logout", isLoggedIn, (req, res, next) => {
  req.session.destroy();
  res.redirect("/")
})

module.exports = router;