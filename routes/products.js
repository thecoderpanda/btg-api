const router = require('express').Router();
const verifyToken = require('./verifyJWT');
const ObjectID = require('mongodb').ObjectID;
const mongoose = require('mongoose');
const Products = require('../modals/Products');
const multer = require('multer');
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 1024 * 1024 * 1024
    }
});

var cpUpload = upload.fields([{ name: 'productImage', maxCount: 1 }, { name: 'dataSheets', maxCount: 8 }])
router.post('/add/:id', verifyToken, cpUpload, async (req, res, next) => {
    try {
        // Check if Alreay Exists
        // const alreadyExists = await Products.findOne({ parentId : ObjectID(req.params.id) })
        // if (alreadyExists) return res.status(200).json({ status: false, message: `${req.body.heading} already exists` })
        console.log(req.files)
        return res.json(req.body)

        const product = new Products({
            parentId: req.params.id,
            heading: req.body.heading,
            subHeadingOne: req.body.subHeadingOne,
            descriptionOne: req.body.descriptionOne,
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


router.get('/get/:id', async (req, res, next) => {
    try {
        const data = await Products.findOne({ parentId: ObjectID(req.params.id) });

        return res.status(200).json({ status: true, message: "success", data })

    } catch (err) {
        console.log(err)
        return res.status(200).json({ status: false, error: err.message })
    }
})

module.exports = router;