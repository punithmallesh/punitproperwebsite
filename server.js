 const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://127.0.0.1:27017/bangaloreCollegeDB')
    .then(function() {
        console.log("Database connected successfully to bangaloreCollegeDB!");
    })
    .catch(function(error) {
        console.log("Database connection error: " + error);
    });

const UserSchema = new mongoose.Schema({
    username: String,
    email: { type: String, unique: true },
    password: String
});
const User = mongoose.model('User', UserSchema);

const OrderSchema = new mongoose.Schema({
    jacketStyle: String,
    size: String,
    customNotes: String
});
const Order = mongoose.model('Order', OrderSchema);

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/register', async function(req, res) {
    try {
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        });
        await newUser.save();
        res.redirect('/main.html'); 
    } catch (error) {
        res.status(400).send("Registration failed. Email might already exist.");
    }
});

app.post('/login', async function(req, res) {
    const userFound = await User.findOne({ email: req.body.email, password: req.body.password });
    if (userFound != null) {
        res.redirect('/main.html');
    } else {
        res.status(401).send("Invalid email or password parameters.");
    }
});

app.post('/add-order', async function(req, res) {
    const newOrder = new Order({
        jacketStyle: req.body.jacketStyle,
        size: req.body.size,
        customNotes: req.body.customNotes
    });
    await newOrder.save();
    res.redirect('/main.html');
});

app.get('/view-orders', async function(req, res) {
    const allOrders = await Order.find();
    res.json(allOrders); 
});

app.post('/update-order/:id', async function(req, res) {
    await Order.findByIdAndUpdate(req.params.id, { customNotes: req.body.newNotes });
    res.redirect('/main.html');
});

app.post('/delete-order/:id', async function(req, res) {
    await Order.findByIdAndDelete(req.params.id);
    res.redirect('/main.html');
});

app.listen(3000, function() {
    console.log("App server listening at address channel: http://localhost:3000");
});