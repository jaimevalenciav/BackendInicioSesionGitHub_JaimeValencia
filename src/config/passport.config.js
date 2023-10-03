const passport = require("passport")
const local = require("passport-local")
const userService = require("../models/User")
const { createHash, isValidatePassword } = require("../../utils")
const GitHubStrategy = require("passport-github2")

const localStrategy = local.Strategy

const initializePassport = () => {
    passport.use("github", new GitHubStrategy({
        clientID: "Iv1.b27af36c8fa37b39",
        clientSecret: "f5a8fa217e33f58cbc896c8778d81559fe8c46b2",
        callbackURL: "http://localhost:8080/api/sessions/githubcallback"
    }, async(accessToken, refreshToken, profile, done) => {
        try {
            console.log(profile)
            let user = await userService.findOne({email: profile._json.email})
            if (!user) {
                let newUser = {
                    first_name : profile._json.name,
                    last_name : "",
                    age: 27,
                    email: profile._json.email,
                    password: ""
                }
                let result = await userService.create(newUser)
                done(null, result)
            } else {
                done(null, user)
            }
        } catch (error) {
            return done(error)
        }
    }
    ))
}

passport.serializeUser(async(user, done) =>{
    done(null, user.id)
  })  

passport.deserializeUser(async (id, done) => {
    let user = await userService.findById(id)
    done(null, user)
})

passport.use(
    "login",
    new localStrategy({ usernameField: "email" }, async (username, password, done) => {
        try {
            const user = await userService.findOne({ email: username });
            if (!user) {
                return done(null, false)
            }
            if (!isValidatePassword(password, user.password)) { 
                return done(null, false)
            }
            return done(null, user)
        } catch (error) {
            return done(error)
        }
    })
);

passport.use(
    "register",
    new localStrategy(
      { usernameField: "email", passReqToCallback: true },
      async (req, email, password, done) => {
        try {
          const existingUser = await userService.findOne({ email });
          if (existingUser) {
            return done(null, false, req.flash("error", "El usuario ya existe en nuestra base de datos"));
          }

          const newUser = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            age: req.body.age,
            email: email,
            password: hashPassword(password),
          }

          const result = await userService.create(newUser)
          return done(null, result, req.flash("success", "Usuario registrado exitosamente"))
        } catch (error) {
          return done(error)
          console.log(error)
        }
      }
    )
  )

module.exports = initializePassport
