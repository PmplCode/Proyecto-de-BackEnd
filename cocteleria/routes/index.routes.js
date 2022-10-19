const express = require('express');
const router = express.Router();

const capitalize = require("../utils/capitalize");

const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

const User = require("../models/User.model");
const Coctel = require("../models/Coctel.model");
const fileUploader = require('../config/cloudinary.config');

const path = require("path");
const { handlebars } = require('hbs');



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


router.get("/profile",isLoggedIn, fileUploader.single("perfil-cover-image"), (req, res, next) => {
  const user = req.session.currentUser
  const userId = req.session.currentUser._id;
  const userImg = req.session.currentUser.fotoPerfil;
  console.log("USERRRRR :",req.session.currentUser)
  Coctel.find({creador: userId})
  .then(results =>{
    const dady = {
      coctelUser: results,
      user:req.session.currentUser
    }
    console.log("proba based: ",results)
    res.render("profile",dady);
  })
});



router.post("/profile", isLoggedIn, fileUploader.single("perfil-cover-image"), (req, res, next)=>{
  req.session.currentUser.fotoPerfil= req.file.path
  User.findByIdAndUpdate(req.session.currentUser._id,{fotoPerfil:req.file.path})
  .then(result =>{
    res.redirect("/profile")
  })
  .catch(err=>{
    console.log("error actualitzar foto perfil: ",err)
  })
})


router.get("/crear", isLoggedIn, (req, res, next) => {
  res.render("crear")
})

router.post("/crear", isLoggedIn, fileUploader.single('coctel-cover-image'), (req, res) => {
  const { name, alcohol, ingredientes, procedimiento, descripcion, origen } = req.body;
  console.log("req.body", req.body);
  // const elAlcohol = capitalize(alcohol)

  let paraules = [];

  alcohol.forEach((paraula, k) => {
    if(paraula.length > 0)
    paraules.push(capitalize(paraula))
  })
  console.log("paraules: ", paraules)
  Coctel.create({ name, alcohol: paraules, ingredientes, procedimiento, descripcion,origen, imageUrl: req.file.path , creador: req.session.currentUser._id})
    .then(newlyCreatedCoctelFromDB => {
        console.log("newlyCreatedCoctelFromDB: ", newlyCreatedCoctelFromDB);
    
    res.redirect("/principal")
  })
});

router.get("/logout", isLoggedIn, (req, res, next) => {
  req.session.destroy();
  res.redirect("/")
})

router.get("/search", isLoggedIn, (req, res, next) => {

  console.log("req.query search: ", req.query.alcohol)

  const paraula = capitalize(req.query.alcohol)

  const filtre = { alcohol: {$regex : `${paraula}`}};
  console.log("filtre regex: ", filtre)

  Coctel.find(filtre)
  .then(resp => {
    const data = { 
      coctel: resp,
      usuari: req.session.currentUser,
      palab: req.query
    }
    res.render("principal", data);
  })
})

router.get("/informacion/:coctelId/edit", isLoggedIn, (req, res, next) => {
  Coctel.findById(req.params.coctelId)
    .populate("creador")
    .then(result => {
      console.log("resultado entar editar: ", result)
      const data = {
      coctel: result
    }
    res.render("editCoctel", data)
  })
})

router.post("/informacion/:coctelId/edit", isLoggedIn, (req, res, next) => {
  console.log("req.body edit: ", req.body)

  const { name, alcohol, ingredientes, procedimiento, descripcion, origen } = req.body;
 
  let paraules = [];

  alcohol.forEach((paraula) => {
    if(paraula.length > 0)
    paraules.push(capitalize(paraula))
  })

  Coctel.findByIdAndUpdate(req.params.coctelId, {name, alcohol: paraules, ingredientes, procedimiento, descripcion, origen}, {new: true})
  .then(resp => {
    res.redirect("/informacion/"+req.params.coctelId)
  })
  .catch(err => {
    console.log("err: ", err)
  })
})

router.get("/informacion/:coctelId", isLoggedIn, (req, res, next) => {
  const coctelId = req.params.coctelId
  Coctel.findById(coctelId)
    .populate("creador")
    .then(result => {
      console.log("result ", result)
      console.log("req.session.currentUser._id ", req.session.currentUser._id)
      console.log("result.creador._id ", result.creador._id)


      const data = {
        coctel: result,
        usuario: req.session.currentUser
      }

      // if(`new ObjectId("${req.session.currentUser._id}")` == `result.creador._id`) {
      //   data.esCreador = true;
      // }
      let whatever = `${result.creador._id}`
      if(whatever.includes(req.session.currentUser._id)){
        data.esCreador = true;
      }

    res.render("informacion", data)
  })
})


module.exports = router;