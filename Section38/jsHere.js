const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');

const Product =require('./models/product');

mongoose.connect('mongodb://127.0.0.1:27017/farmStore', { useNewUrlParser: true,  useUnifiedTopology: true})
    .then(() => {
        console.log('mongo connection successful') 
    })
    .catch((err) => {
        console.log('Error connecting to mongo database')
        console.log(err)
    })



app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}))

const categories = ['fruit', 'vegetable', 'dairy'];

app.get('/products', async (req, res) => {
    const products = await Product.find({})
    // console.log(products)//It will show in shell
    res.render('products/index.ejs', { products})
})

app.get('/products/newProduct', (req,res) => {
    res.render('products/newProduct.ejs')
})

app.post('/products',async (req, res) => {
    const newProductAdded = new Product(req.body);
    await newProductAdded.save();
    res.redirect(`/products/${newProductAdded._id}`)
})

app.get('/products/:id', async (req,res) => {
    const { id } = req.params;
    const product = await Product.findById(id)
    res.render('products/show.ejs', { product })
})

app.listen(3000, () => {
    console.log('App Is Listening On Port 3000')
})