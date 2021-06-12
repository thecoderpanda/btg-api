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
    sectionOne:{
        type: String
    },
    sectionTwo: {
        type: String
    },
    sectionThree: {
        type: String
    },
    sectionFour: {
        type: String
    },
    sectionFive: {
        type: String
    },
    sectionSix: {
        type: String
    },
    sectionSeven: {
        type: String
    },
    sectionEight: {
        type: String
    },
    sectionNine: {
        type: String
    },
    sectionTen: {
        type: String
    },
    sectionEleven: {
        type: String
    },
    sectionTwelve: {
        type: String
    },
},
    { collection: "products" },
    { strict: false }
);


module.exports = mongoose.model('Products', navbarSchema);