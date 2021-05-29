const mongoose = require('mongoose');
const indusrtySolutionForSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

}, { collection: "industry_solution_for" }
);

const solutionMainCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    }
}, { collection: "solution_main_category" }
);

const solutionSubCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    }
}, { collection: "solution_sub_category" }
);

const productMainCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    }
}, { collection: "product_main_category" }
);

 const indusrtySolutionForSchema_var = mongoose.model('IndusrtySolutionFor', indusrtySolutionForSchema);
 const solutionMainCategorySchema_var = mongoose.model('solution_main_category', solutionMainCategorySchema);
 const solutionSubCategorySchema_var = mongoose.model('solution_sub_category', solutionSubCategorySchema);
 const productMainCategorySchema_var = mongoose.model('product_main_category', productMainCategorySchema);

module.exports = {
    indusrtySolutionForSchema: indusrtySolutionForSchema_var,
    solutionMainCategorySchema: solutionMainCategorySchema_var,
    solutionSubCategorySchema: solutionSubCategorySchema_var,
    productMainCategorySchema: productMainCategorySchema_var,
}