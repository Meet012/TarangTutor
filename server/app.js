//read .env-cfg
import dotenv from 'dotenv';
dotenv.config();

//define the importable dependencies
import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import ExpressError from './utils/ExpressError.js';
import path from 'path';
import ejsMate from 'ejs-mate';
import methodOverride from 'method-override';
import {createReview} from './controllers/ratingController.js';
import Review from './models/ratingModel.js';
//import {RecaptchaV2} from 'express-recaptcha';

//define the server credentials
const app = express();
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;
const SITE_KEY = process.env.SITE_KEY;
const SECRET_KEY = process.env.SECRET_KEY;
//const recaptcha = new RecaptchaV2(SITE_KEY,SECRET_KEY);

//set directive for static views + ejsMate 
app.set("view engine", "ejs");
//app.set("views", path.join(__dirname, "views"));
app.engine("ejs",ejsMate);

//set the middlewares to be used
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(express.json());
app.use(morgan("combined"));

//importing the routes related to chapter,educatorRoutes,noteRoutes
import educatorRoutes from './routes/educatorRoutes.js';
import notesRoutes from './routes/noteRoutes.js';
import chapterRoutes from './routes/chapterRoutes.js';


app.get('/', async (req, res) => {
    try {
      // Fetch reviews from the database (This part depends on your actual code and database setup)
      const reviews = await Review.find(); // Fetch reviews using Mongoose
  
      res.render('index', { reviews }); // Pass the reviews data to the index.ejs template
    } catch (err) {
      // Handle errors if any occurred during the fetching of reviews
      console.log(err);
      res.status(500).send('Error fetching reviews');
    }
  });

app.post("/reviews",createReview);

app.get('/portfolio',(req,res) => {
    res.render("portfolio.ejs");
});

app.get('/testimonials',(req,res) => {
    res.render("testimonials.ejs");
});

app.post('/reviews',createReview);

app.get('/courses',(req,res)=>{
    res.render("courses.ejs");
});

app.get('/contact',(req,res)=>{
    res.render("contact.ejs");
});

app.get('/admin',(req,res)=>{
    const dat={
        site_key:SITE_KEY,
    };
    res.render("admin.ejs",{site_key:SITE_KEY});
});

app.post('/auth',(req,res)=>{

    if(req.body["entered_pass"]===process.env.PASSKEY){
        res.render("dashboard.ejs");
    }
    else{
        res.render("error.ejs");
    }
});

app.get('/demos',(req,res)=>{
    res.render("demos.ejs");
})


//created middleware to find related route if request comes
app.use('/educator', educatorRoutes);
app.use('/chapters',chapterRoutes);
app.use('/notes',notesRoutes);

//establish MongoDB connection
mongoose.connect(MONGO_URL)
    .then(() => {
        app.listen(PORT,(req, res)=>{
            console.log(`listening @port ${PORT}`);
        })
    })
    .catch((err) => {
        console.log(err)
    });

//this is used to handle the route that doesnot exist
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "page not found"));
}); 

//this middleware will handle the error if comes and pass the message to default error handler
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "something went wrong" } = err;
    res.status(statusCode).send(err.message);  
    next();
});