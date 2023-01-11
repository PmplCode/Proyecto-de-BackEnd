const express = require("express");
const router = express.Router();

// ℹ️ Handles password encryption
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

// How many rounds should bcrypt run the salt (default - 10 rounds)
const saltRounds = 10;

// Require the User model in order to interact with the database
const User = require("../models/User.model");
const Coctel = require("../models/Coctel.model");

// Require necessary (isLoggedOut and isLiggedIn) middleware in order to control access to specific routes
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

const isPremium = require("../middleware/isPremium");

// GET /auth/signup
router.get("/signup", isLoggedOut, (req, res) => {
  res.render("auth/signup");
});

// POST /auth/signup
router.post("/signup", isLoggedOut, (req, res) => {
  const { username, password } = req.body;

  let premiumCheck = false;

  const arrayPremium = ["jaja", "coctel"];
  if (arrayPremium.includes(`${req.body.isPremium}`)) {
    premiumCheck = true;
  }

  // Check usuario y contraseñas se pasan
  if (username === "" || password === "") {
    res.status(400).render("auth/signup", {
      errorMessage: "Todos los campos son obligatorios!",
    });

    return;
  }

  if (password != req.body.passwordRepeat) {
    res.status(400).render("auth/signup", {
      errorMessage: "Contraseñas no coincidentes.",
    });

    return;
  }

  if (password.length < 6) {
    res.status(400).render("auth/signup", {
      errorMessage: "La contraseña debe contener al menos 6 carácteres!",
    });

    return;
  }

  //   ! This regular expression checks password for special characters and minimum length
  /*
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!regex.test(password)) {
    res
      .status(400)
      .render("auth/signup", {
        errorMessage: "Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter."
    });
    return;
  }
  */

  bcrypt
    .genSalt(saltRounds)
    .then((salt) => bcrypt.hash(password, salt))
    .then((hashedPassword) => {
      return User.create({
        username,
        password: hashedPassword,
        isPremium: premiumCheck,
      });
    })
    .then((user) => {
      req.session.currentUser = user;

      res.redirect("/principal");
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(500).render("auth/signup", { errorMessage: error.message });
      } else if (error.code === 11000) {
        res.status(500).render("auth/signup", {
          errorMessage: "Este nombre de usuario ya está en uso, elige otro!",
        });
      } else {
        next(error);
      }
    });
});

// GET /auth/login
router.get("/", isLoggedOut, (req, res) => {
  res.render("index");
});

// POST /auth/
router.post("/", isLoggedOut, (req, res, next) => {
  const { username, password } = req.body;

  // Check that username, email, and password are provided
  if (username === "" || password === "") {
    res.status(400).render("index", {
      errorMessage: "Rellene todos los campos, por favor!",
    });

    return;
  }

  // Here we use the same logic as above
  // - either length based parameters or we check the strength of a password
  if (password.length < 6) {
    return res.status(400).render("index", {
      errorMessage: "La contraseña debe contener al menos 6 carácteres!",
    });
  }

  // Search the database for a user with the email submitted in the form
  User.findOne({ username })
    .then((user) => {
      // If the user isn't found, send an error message that user provided wrong credentials

      if (!user) {
        res
          .status(400)
          .render("index", { errorMessage: "Credenciales incorrectas!" });
        return;
      }

      // If user is found based on the username, check if the in putted password matches the one saved in the database
      bcrypt
        .compare(password, user.password)
        .then((isSamePassword) => {
          if (!isSamePassword) {
            res
              .status(400)
              .render("index", { errorMessage: "Credenciales incorrectas!" });
            return;
          }
          req.session.currentUser = user;
          res.redirect("/principal");
        })
        .catch((err) => next(err)); // In this case, we send error handling to the error handling middleware.
    })
    .catch((err) => next(err));
});

// GET /auth/logout
// router.get("/logout", isLoggedIn, (req, res) => {
//   req.session.destroy((err) => {
//     if (err) {
//       res.status(500).render("auth/logout", { errorMessage: err.message });
//       return;
//     }

//     res.redirect("/");
//   });
// });

module.exports = router;
