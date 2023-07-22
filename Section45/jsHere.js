const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const AppError =require('./appError');


const Product =require('./models/product');
const Farm = require('./models/farm')

mongoose.connect('mongodb://127.0.0.1:27017/farmStore2', { useNewUrlParser: true,  useUnifiedTopology: true})
    .then(() => {
        console.log('mongo connection successful') 
    })
    .catch((err) => {
        console.log('Error connecting to mongo database')
        console.log(err)
    })


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

// FARM ROUTES

app.get('/farms', async (req, res) => {
    const farms = await Farm.find({});
    res.render('farms/index',{farms})
})

app.get('/farms/new', (req,res) => {
    res.render('farms/new')
})

app.post('/farms', async(req, res) => {
    const farm = new Farm(req.body);
    await farm.save();
    res.redirect('/farms')
})




// PRODUCT ROUTES   

const categories = ['fruit', 'vegetable', 'dairy'];

app.get('/products', wrapAsync(async (req, res, next) => {
        const { category } = req.query;
    if (category) {
        const products = await Product.find({ category })
        res.render('products/index.ejs', { products, category })
    }
    else {
        const products = await Product.find({})
        res.render('products/index.ejs', { products, category: 'All'})
    }
    // console.log(products)//It will show in shell
}))

app.get('/products/newProduct', (req,res) => {
    // throw new AppError('Not Allowed', 401);
    res.render('products/newProduct', { categories })
})

app.post('/products', wrapAsync(async (req, res, next) => {
        const newProductAdded = new Product(req.body);
        await newProductAdded.save();
        res.redirect(`/products/${newProductAdded._id}`) 
}))

function wrapAsync(fn) {
    return function (req,res,next) {
        fn(req,res,next).catch(e => next(e))
    }
}

app.get('/products/:id', wrapAsync( async (req, res, next) => {
        const {id} = req.params;
        // if (!ObjectID.isValid(id)) {
        //     throw new AppError('Invalid Id', 400);
        // }
        const product = await Product.findById(id)
        if (!product) {
            throw new AppError('Product Not Found', 404);
        }
        res.render('products/show', {product})
}))

app.get('/products/:id/edit', wrapAsync(async (req, res, next) => {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) {
            throw new AppError('Product Not Found', 404)
        }
        res.render('products/edit', { product, categories })    
}))

app.put('/products/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, { runValidators: true, new: true})
    res.redirect(`/products/${product._id}`)
}))

app.delete('/products/:id', wrapAsync(async (req, res, next) => {
        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);
        res.redirect('/products');   
}))

const handleValidationErr = err => {
    console.dir(err)
    return new AppError(`Validation Falied...${err.message}`, 400)
}

app.use((err,req,res,next) => {
    console.log('err.name')
    if (err.name = ' ValidationError') err = handleValidationErr(err)
    next(err);
})

app.use((err,req,res,next) => {
    const { status = 500, message = 'Something Went Wrong'} = err;
    res.status(status).send(message)
})

app.listen(3000, () => {
    console.log('App Is Listening On Port 3000')
})