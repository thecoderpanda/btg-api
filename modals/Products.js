const mongoose = require('mongoose');


const navbarSchema = new mongoose.Schema({
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'solution_sub_category'
    },
    heading: {
        type: String,
        required: true
    },
    subHeadingOne: {
        type: String,
        required: true,
    },
    descriptionOne: {
        type: String,
        required: true,
    },
    subHeadingTwo: {
        type: String,
        required: true,
    },
    descriptionTwo: {
        type: String,
        required: true,
    },
    subHeadingThree: {
        type: String,
        required: true,
    },
    descriptionThree: {
        type: String,
        required: true,
    },
    productImage: {
        type: String,
        // required: true,
    },
    productSheetSubHeading: {
        type: String,
    }, 
    productDataSheets: [{}]
},
    { collection: "products" },
    { strict: false }
);


module.exports = mongoose.model('Products', navbarSchema);