const router = require('express').Router();
const Admin = require('../modals/Admin');
const { adminRegister, adminLogin } = require('./validation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.get('/', (req, res, next) => {
    return res.status(200).json({
        title: "Admin Auth. Module",
        description: "Login & Register"
    })
})

router.post('/register', async(req, res, next) => {

    // Validate Input Body
    const { error } = adminRegister(req.body);
    if (error) return res.status(200).json({ status: false, messgae: error.details[0].message });

    // Check if Email/Mobile already exists
    
    const emailExists = await Admin.findOne({ email: req.body.email })

    if (emailExists) return res.status(200).json({ status: false, message: `${req.body.email}, This email already exists` })
    

    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    // Create New User
    const user = new Admin({
        role: req.body.role,
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    });

    try {
        let userData = await user.save();
        
        return res.status(200).json({ status: true, message: "Registration Successful", data: { id: user._id } })
    } catch (err) {
        console.log(err)
        return res.status(200).json({ status: false, message: err })
    }
    
})

router.post('/login', async(req, res, next) => {

    // Validate Input Body
    const { error } = adminLogin(req.body);
    if (error) return res.status(200).json({ status: false, messgae: error.details[0].message });

    // Check if email exists
    const emailExists = await Admin.findOne({ email : req.body.email })
    if (!emailExists) return res.status(200).json({ status: false, message: 'Email not found!' })
    
    // Passowrd is correct
    const validPassowrd = await bcrypt.compare(req.body.password, emailExists.password)
    if (!validPassowrd) return res.status(200).json({ status: false, message: 'Invalid Passowrd!' })

    // JWT ACCESS TOKEN
    let payload = { user_id : emailExists._id }

    //create the access token with the shorter lifespan
    let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        algorithm: "HS256"
    })

    //send the access token to the client inside a cookie
    return res.status(200).header("auth-token", accessToken).json({
        status: true,
        message: 'Login Successful',
        data: {
            id: emailExists._id,
            name: emailExists.name,
            email: emailExists.email,
            accessToken
        }
    })
    
})


module.exports = router;