
const express = require('express');
const router = express.Router();
const usuario = require('../models/User');
const { createHash, isValidatePassword } = require('../../utils');
const passport = require("passport")
const jwt = require('jsonwebtoken')


router.get("/login", async (req, res) => {
    res.render("login")
})

router.get("/logout", async (req, res) => {
    delete req.session.user
    res.redirect("login")
})

router.get("/faillogin", async (req, res) => {
    console.log("Hubo un error en la autenticación")
    res.send({ error: "Error en la autenticación" })
})

router.get("/github", passport.authenticate("github", { scope: ["user:email"] }), async (req, res) => { })

router.get("/githubcallback", passport.authenticate("github", { failureRedirect: "/login" }), async (req, res) => {
    req.session.user = req.user
    res.redirect("/api/sessions/profile")
})

router.get("/profile", async (req, res) => {
    if (!req.session.user) {
        return res.redirect("login")
    }

    const { first_name, last_name, email, age } = req.session.user

    res.render("profile", { first_name, last_name, age, email })
})

/* router.post("/login", async (req, res) => {
    const { email, password} = req.body
    if(!email || !password) 
     return res.status
}) */

router.post('/register', passport.authenticate("register", { failureRedirect: "/failregister" }), async (req, res) => {
    const { first_name, last_name, email, age, password } = req.body;


    if (!first_name || !last_name || !email || !age || !password) {
        return res.status(400).send('Faltan datos.');
    }

    const hashedPassword = createHash(password);

    const user = await usuario.create({
        first_name,
        last_name,
        email,
        age,
        password: hashedPassword
    });

    res.send({ status: "success", payload: user });
    console.log('Usuario registrado con éxito.' + user);
    res.redirect('/login');
});

router.post("/login", passport.authenticate("login", { failureRedirect: "/faillogin" }), async (req, res) => {
    if (!req.session.user) {
        return res.status(400).send("Usuario no encontrado")
    }
    req.session.user = {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email,
        age: req.user.age
    }
    res.send({ status: "success", payload: req.user })
    }
)


module.exports = router;


