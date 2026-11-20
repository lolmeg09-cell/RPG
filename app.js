const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const argon2 = require("argon2")
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const Food = require("./models/Food");
const User  = require("./models/User");


const app = express();

app.set("view engine", "ejs");

app.use(cookieParser());
app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));



// mongoose.connect("mongodb://mongodb://localhost:27017/RPG_Sjappa");
mongoose.connect(process.env.MONGODB_URI);

app.get("/", async (req, res) => {
  const food = await Food.find();
  console.log(food);

app.get("/profile", (req, res) => {
  res.render("profile")
});

  res.render("index", { food });
});

app.get("/registrer-food", async (req, res) => {
  console.log(req.cookies);

  const token = req.cookies.jwt;


  
const cookie = jwt.verify(token, process.env.SECRET_JWT);
console.log(cookie);
let userId = cookie.userId;
const user = await User.findById(userId);
if (user.role !== "admin") {
  res.redirect("/")
} else {
   res.render("registrerFood");
}
});

app.get("/reset-password", (req, res) => {
  res.render("resetPassword");
});

app.get("/forgotten-password", (req, res) => {
  res.render("forgottenPassword")
});

app.get("/registrer-user", (req, res) => {
  res.render("registrerUser");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/forgotten-password", async (req,res) => {
  const {email} = req.body;

  const user = await User.findOne({email});

  console.log(user);
  if (user) {
    
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
          user: 'alayna.wolf@ethereal.email',
          pass: 'kP8N8j1jaWXMZjmTAa'
      }
    })

    const jwtEmail = jwt.sign({email: user.email}, process.env.SECRET_JWT);

await transporter.sendMail({
  from:"alayna.wolf@ethereal.email",
  to: "alayna.wolf@ethereal.email",
  subject: "Forgotten password",
  // text: "Her er din nye reset passord lenke",
  html: `<p>Her er din nye reset passord lenke</p>
 <a target="_blank" href="http://localhost:4000/reset-password?jwt=${jwtEmail}">Trykk her</a>`
})
  }
});



app.post("/reset-password", async (req,res) => {
  const {password, repetPassword} = req.body;

  const url = req.query;
  console.log("req.query", url);
}) 

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  console.log(user);

  if (!user) {
    res.status(400).send("bruker eksisterer ikke");
  }

  let isPassword = await argon2.verify(user.password, password);

  if (isPassword) {
    const token = jwt.sign({userId:user._id}, process.env.SECRET_JWT);
    console.log("token", token);

    res.cookie("jwt", token);

  }})

app.post("/registrer-user", async (req, res) => {
  console.log(req.body);
  const { password, email, repetPassword } = req.body;

  if (password === repetPassword) {
    const hash = await argon2.hash(password);

    const user = new User({ email, password: hash });

    await user.save();
    res.status(201).redirect("login");
  } else {
    res.send("passord stemmer ikke overens");
  }
});

app.post("/registrer-food", async (req, res) => {
  const { bildeurl, tittel, beskrivelse, ingredienser, kategori, pris } =
    req.body;

  console.log(req.body);

  const food = new Food({
    tittel,
    bildeurl,
    beskrivelse,
    ingredienser,
    kategori,
    pris,
  });

  await food.save();
  res.status(200).redirect("/registrer-food");
});

app.listen(process.env.PORT, () => {
  console.log(`listening on port http://localhost:${process.env.PORT}`);
});
