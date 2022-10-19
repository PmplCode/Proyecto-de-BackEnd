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
  const userId = req.params.idUser

  Coctel.find()
  .then(resp => {
    const data = { 
      coctel: resp,
      usuario: req.session.currentUser
    }
   
    console.log("req.session.currentUser - principal: ", req.session.currentUser)
    res.render("principal", data);
  })
  .catch(err => {
    console.log("error render principal: ", err)
  })
});



router.get("/editarPerfil", (req, res, next) => {
  const data = { 
    usuario: req.session.currentUser
  }
  res.render("editarPerfil", data)
})

router.post("/editarPerfil", isLoggedIn, fileUploader.single("perfil-cover-image"), (req, res, next) => {
  const { username, descripcion } = req.body;
  
  req.session.currentUser.username = req.body.username
  req.session.currentUser.descripcion = req.body.descripcion
  req.session.currentUser.fotoPerfil = req.file.path
  
  User.findByIdAndUpdate(req.session.currentUser._id,{username, descripcion, fotoPerfil:req.file.path})
  .then(userEditedFromDB => {
    console.log("userEditedFromDB: ", userEditedFromDB);
    
    res.redirect("/profile/"+req.session.currentUser._id)
  })
  .catch(err=>{
    console.log("error actualitzar foto perfil: ",err)
  })
})


router.get("/crear", isLoggedIn, (req, res, next) => {
  const data = { 
    usuario: req.session.currentUser
  }
  res.render("crear", data)
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

router.get("/search", isLoggedIn, (req, res, next) => {
    
    console.log("req.query search: ", req.query.alcohol)
    
    const paraula = capitalize(req.query.alcohol)
    
    const filtre = { alcohol: {$regex : `${paraula}`}};
    console.log("filtre regex: ", filtre)
    
    Coctel.find(filtre)
    .then(resp => {
      const data = { 
        coctel: resp,
        usuario: req.session.currentUser,
        palab: req.query
      }
      res.render("principal", data);
    })
  })

router.get("/logout", isLoggedIn, (req, res, next) => {
  req.session.destroy();
  res.redirect("/")
})

router.get("/profile/:idUser", isLoggedIn, (req, res, next) => {
  const user = req.session.currentUser
  const userId = req.params.idUser
  const userImg = req.session.currentUser.fotoPerfil;

  console.log("userId: ", userId)
  
  console.log("USERRRRR :",req.session.currentUser)
  Coctel.find({ creador: userId })
    .populate("creador")
    .then(results => {
      const data = {
        coctelUser: results,
        usuario: req.session.currentUser
      }
      console.log("results profile: ", results)
      
      if (req.session.currentUser._id == userId) {
        data.user = req.session.currentUser
      }else {data.user = results[0].creador}

    res.render("profile", data);
  })

});

//NO FA RES, PEL QUE SEMBLA, ESPERAR A BORRAR!!!!
// router.get("/informacion/:coctelId", isLoggedIn, (req, res, next) => {
//   const coctelId = req.params.coctelId
//   Coctel.findById(coctelId)
//   .populate("creador")
//   .then(result => {
//     const data = {
//       coctel: result,
//       usuario: req.session.currentUser
//     }
//     res.render("informacion", data)
//   })
// })


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
  .catch(err => {
    console.log("err: ", err)
  })
})


  router.post("/delete/:coctelId", isLoggedIn, (req,res)=>{
  console.log("req.params.coctelId: ", req.params.coctelId)
  Coctel.findByIdAndDelete(req.params.coctelId)
   .then(() => {
    res.redirect("/profile/" + req.session.currentUser._id)
   })
   .catch((error) => console.log(error));
 })
  
  module.exports = router;

