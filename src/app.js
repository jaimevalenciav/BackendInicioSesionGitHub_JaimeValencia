const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const handlebars = require('express-handlebars');
const MongoStore = require('connect-mongo');
const usersRouter = require('./routes/users.router');
const passport = require("passport")
const initializePassport = require("./config/passport.config")


const app = express();

mongoose.connect('mongodb+srv://jaimevalenciav:Infoadmin08@ecommerce.rt5ptyc.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    store: MongoStore.create({
        mongoUrl: 'mongodb+srv://jaimevalenciav:Infoadmin08@ecommerce.rt5ptyc.mongodb.net/?retryWrites=true&w=majority',
        mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
        ttl: 600,
    }),
    secret: 'coderhouse',
    resave: false,
    saveUninitialized: true,
}));

initializePassport(passport)
app.use(passport.initialize())
app.use(passport.session())


app.engine('handlebars', handlebars.engine())
app.set('views', __dirname + '/views')
app.set('view engine', 'handlebars')


app.use('/api/sessions', usersRouter)

app.get('/', (req, res) => {
    res.send('Express Sessions!')
})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.listen(8080, () => {
    console.log('Servidor en ejecución en el puerto 8080');
});
