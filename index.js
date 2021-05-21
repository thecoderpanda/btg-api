const express       = require('express');
const app           = express();
const cors          = require('cors');
const dontenv       = require('dotenv');
const _PORT         = process.env.PORT || 3000;
const mongoose      = require('mongoose');

dontenv.config();

mongoose.connect(process.env.DB_CONNECT,
    { useNewUrlParser: true, useUnifiedTopology: true, },
    (err) => {  
        if (!err) console.log('MongoDB Connection')
        else console.log(err)
    })



app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ limit: '1mb', extended: false }));

// CORS
app.options('*', cors())
app.use(cors({
    origin: '*', //192.168.43.121,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE"
}))


// Root Route
app.get('/', (req, res) => {
    res.json({ status: true, message: "BTG: MongoDB, Express,Angualr, Node.js", developedBy: "NyctoNid, Procohat Pvt. Ltd" })
})


const authAdmin = require('./routes/authAdmin'); 
const navbar = require('./routes/navbar')
const product = require('./routes/products')

app.use('/api/auth', authAdmin)
app.use('/api/navbar', navbar)
app.use('/api/product', product)


// Server Configuration
app.listen(_PORT, () => {
    console.log(`App started and Listening on port ${_PORT}`)
})