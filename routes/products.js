const router = require('express').Router();
const verifyToken = require('./verifyJWT');
const ObjectID = require('mongodb').ObjectID;
const mongoose = require('mongoose');
const Products = require('../modals/Products');

router.post('/add/:id', verifyToken, async (req, res, next) => {
    try {
        // Check if Alreay Exists
        const alreadyExists = await Products.findOne({ name: req.body.heading })
        if (alreadyExists) return res.status(200).json({ status: false, message: `${req.body.heading} already exists` })

        const product = new Products({
            parentId: req.params.id,
            heading: req.body.heading,
            subHeadingOne: req.body.subHeadingOne,
            descriptionOne: req.body.heading,
            subHeadingTwo: req.body.subHeadingTwo,
            descriptionTwo: req.body.descriptionTwo,
            subHeadingThree: req.body.subHeadingThree,
            descriptionThree: req.body.descriptionThree,
            productImage: req.body.productImage,
            productSheetSubHeading: req.body.productSheetSubHeading,
        })

        try {
            let productData = await product.save();
            return res.status(200).json({ status: true, message: "Added Successful", data: productData })
        } catch (err) {
            console.log(err)
            return res.status(200).json({ status: false, error: err.message })
        }

    } catch (err) {
        console.log(err)
        return res.status(200).json({ status: false, error: err.message })
    }
});


module.exports = router;