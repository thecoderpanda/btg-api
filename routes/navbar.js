const router = require('express').Router();
const Navbar = require('../modals/Navbar');
const SubMenu = require('../modals/SubMenu');
const verifyToken = require('./verifyJWT')
const ObjectID = require('mongodb').ObjectID;
const { mainNav, subNavCat } = require('./validation');
const mongoose = require('mongoose');
const Products = require('../modals/Products');
const { indusrtySolutionForSchema } = require('../modals/SubNav')
const { solutionMainCategorySchema } = require('../modals/SubNav')
const { solutionSubCategorySchema } = require('../modals/SubNav')
const { productMainCategorySchema } = require('../modals/SubNav')

// Add Main Navbar and its sub-menu items
/*
    {
        "name": "NAME", *required
        "subMenu": [
            { "name": "SUB-MENU Name" },
            { "name": "SUB-MENU Name" },
            { "name": "SUB-MENU Name" },
        ]
    }

*/
router.post('/add/menu', verifyToken, async (req, res, next) => {
    try {

        // Validate Input Body
        const { error } = mainNav(req.body);
        if (error) return res.status(200).json({ status: false, message: error.details[0].message });


        // Check if Alreay Exists
        const alreadyExists = await Navbar.findOne({ name: req.body.name })
        if (alreadyExists) return res.status(200).json({ status: false, message: `${req.body.name} already exists` })

        // Add New Row
        const navbar = new Navbar({
            name: req.body.name,
        })

        try {
            let navbarData = await navbar.save();

            if (req.body.subMenu != undefined || req.body.subMenu != null) {

                for (let i = 0; i < req.body.subMenu.length; i++) {
                    // console.log(req.body.subMenu[i])
                    const subMenu = new SubMenu({
                        name: req.body.subMenu[i].name,
                        parentId: navbarData._id
                    })

                    try {
                        let subMenuData = await subMenu.save();
                        // console.log("added");
                    } catch (err) {
                        console.log(err)
                        return res.status(200).json({ status: false, error: err.message })
                    }
                }

            }

            return res.status(200).json({ status: true, message: "Added Successful", data: { navbarData } })
        } catch (err) {
            console.log(err)
            return res.status(200).json({ status: false, error: err.message })
        }
    } catch (err) {
        console.log(err)
        return res.status(200).json({ status: false, error: err.message })
    }
})

// Get MAIN NavBar
/*  
    *required: headers: {
        auth-token: "AUTH ACCESS TOKEN"
    }
*/
router.get('/', async (req, res, next) => {
    try {
        Navbar.aggregate([
            {
                $lookup: {
                    from: 'subMenu',
                    localField: '_id',
                    foreignField: 'parentId',
                    as: 'subNav'
                }
            }
        ]).then(resp => {
            // res.send(resp);
            res.status(200).json({ status: true, message: "success", data: resp })
        }).catch(error => {
            res.send(error)
        })
    } catch (err) {
        console.log(err)
        return res.status(200).json({ status: false, error: err.message })
    }
})

// Update Menu
/*
    *required: ID in URL
    {
        "name" : "Name"
    }
*/
router.put('/update/menu/:id', verifyToken, async (req, res, next) => {

    try {
        // Check if Entity Exists
        const menuItemExists = await Navbar.findOne({ _id: ObjectID(req.params.id) })
        if (!menuItemExists) return res.status(200).json({ status: false, message: `Item Not Found` })

        let data = await Navbar.findByIdAndUpdate({ _id: ObjectID(req.params.id) }, {
            $set: {
                name: req.body.name
            }
        }, { upsert: true }).then(resp => {
            return res.status(200).json({ status: true, message: "Updated!" })
        }).catch(error => {
            return res.status(200).json({ status: false, error: error.message })
        })
    } catch (error) {
        return res.status(200).json({ status: false, error: error.message })
    }

})

// Update Sub-Menu
/*
    *required: ID in URL
    {
        "name" : "Name"
    }
*/

router.put('/update/submenu/:id', verifyToken, async (req, res, next) => {
    console.log('called')
    try {
        // Check if Entity Exists
        const subMenuItemExists = await SubMenu.findOne({ _id: ObjectID(req.params.id) })
        if (!subMenuItemExists) return res.status(200).json({ status: false, message: `Item Not Found` })

        let data = await SubMenu.findByIdAndUpdate({ _id: ObjectID(req.params.id) }, {
            $set: {
                name: req.body.name
            }
        }, { upsert: true }).then(resp => {
            return res.status(200).json({ status: true, message: "Updated!" })
        }).catch(error => {
            return res.status(200).json({ status: false, error: error.message })
        })
    } catch (error) {
        return res.status(200).json({ status: false, error: error.message })
    }

})




// router.get('/subnav', async (req, res, next) => {
//     let data = [];
//     let main = await indusrtySolutionForSchema.find()

//     data.push(main)
//     main.map(async (item, index) => {
//         // main[index].push('a')
//         console.log(main[index])
//     })


//     await Promise.all(main.map(async (item) => {
//         const sub_main = await solutionMainCategorySchema.find({ parentId: ObjectID(item._id) })
//         // console.log(d)
//         main.push(sub_main)

//         await Promise.all(sub_main.map(async item1 => {
//             const sub_sub_main = await solutionSubCategorySchema.find({ parentId: ObjectID(item1._id) })

//             sub_main.push(sub_sub_main)

//             await Promise.all(sub_sub_main.map(async item2 => {
//                 const sub_sub_sub_main = await productMainCategorySchema.find({ parentId: ObjectID(item2._id) })
//                 // sub_sub_main.push({productMainCategoryName : item2.name, data: sub_sub_sub_main})
//                 sub_sub_main.push(sub_sub_sub_main)
//             }))
//         }))
//     }))

//     res.send(data)
// })

router.get('/subnav', async (req, res, next) => {
    // let main = await indusrtySolutionForSchema.find()
    let data = [];

    let main = await indusrtySolutionForSchema.find({ _id: ObjectID('6094d5838c327c48807489c2') });

    data.push(main);



    await Promise.all(main.map(async (item) => {
        const sub_main = await solutionMainCategorySchema.find({ parentId: ObjectID(item._id) })
        // console.log(d)
        data.push(sub_main)
        await Promise.all(sub_main.map(async item1 => {
            const sub_sub_main = await solutionSubCategorySchema.find({ parentId: ObjectID(item1._id) })

            sub_main.push(sub_sub_main)

            await Promise.all(sub_sub_main.map(async item2 => {
                const sub_sub_sub_main = await productMainCategorySchema.find({ parentId: ObjectID(item2._id) })
                // sub_sub_main.push({productMainCategoryName : item2.name, data: sub_sub_sub_main})
                sub_sub_main.push(sub_sub_sub_main)
            }))
        }))

    }))


    res.status(200).json(data)
})


// Add Industry Solution for
router.post('/add/industry-solution-for', verifyToken, async (req, res, next) => {
    try {
        // Validate Input Body
        const { error } = mainNav(req.body);
        if (error) return res.status(200).json({ status: false, message: error.details[0].message });

        // Check if already Exists
        let alreadyExists = await indusrtySolutionForSchema.findOne({ name: req.body.name })
        if (alreadyExists) return res.status(200).json({ status: false, message: `${req.body.name} already exists` })


        // Add New Row
        const industry_solution_for = new indusrtySolutionForSchema({
            name: req.body.name,
        })

        try {
            let data = await industry_solution_for.save();
            return res.status(200).json({ status: true, message: "Added Successful", data: data })
        } catch (err) {
            console.log(err)
            return res.status(200).json({ status: false, error: err.message })
        }

    } catch (error) {
        return res.status(200).json({ status: false, error: error.message })
    }
})



// Add solution_main_category
router.post('/add/solution-main-category/:id', verifyToken, async (req, res, next) => {
    try {
        // Validate Input Body
        const { error } = subNavCat(req.body);
        if (error) return res.status(200).json({ status: false, message: error.details[0].message });

        // Check if already Exists
        let alreadyExists = await solutionMainCategorySchema.findOne({ name: req.body.name, parentId: ObjectID(req.params.id) })
        if (alreadyExists) return res.status(200).json({ status: false, message: `${req.body.name} already exists` })


        // Add New Row
        const solution_main_category = new solutionMainCategorySchema({
            name: req.body.name,
            parentId: req.params.id
        })

        try {
            let data = await solution_main_category.save();
            return res.status(200).json({ status: true, message: "Added Successful", data: data })
        } catch (err) {
            console.log(err)
            return res.status(200).json({ status: false, error: err.message })
        }

    } catch (error) {
        return res.status(200).json({ status: false, error: error.message })
    }
})

// Add solution_sub_category
router.post('/add/solution-sub-category/:id', verifyToken, async (req, res, next) => {
    try {
        // Validate Input Body
        const { error } = subNavCat(req.body);
        if (error) return res.status(200).json({ status: false, message: error.details[0].message });

        // Check if already Exists
        let alreadyExists = await solutionSubCategorySchema.findOne({ name: req.body.name, parentId: ObjectID(req.params.id) })
        if (alreadyExists) return res.status(200).json({ status: false, message: `${req.body.name} already exists` })


        // Add New Row
        const solution_sub_category = new solutionSubCategorySchema({
            name: req.body.name,
            parentId: req.params.id
        })

        try {
            let data = await solution_sub_category.save();
            return res.status(200).json({ status: true, message: "Added Successful", data: data })
        } catch (err) {
            console.log(err)
            return res.status(200).json({ status: false, error: err.message })
        }

    } catch (error) {
        return res.status(200).json({ status: false, error: error.message })
    }
})

// Add product_main_category
router.post('/add/product-main-category/:id', verifyToken, async (req, res, next) => {
    try {
        // Validate Input Body
        const { error } = subNavCat(req.body);
        if (error) return res.status(200).json({ status: false, message: error.details[0].message });

        // Check if already Exists
        let alreadyExists = await productMainCategorySchema.findOne({ name: req.body.name, parentId: ObjectID(req.params.id) })
        if (alreadyExists) return res.status(200).json({ status: false, message: `${req.body.name} already exists` })


        // Add New Row
        const product_main_category = new productMainCategorySchema({
            name: req.body.name,
            parentId: req.params.id
        })

        try {
            let data = await product_main_category.save();
            const prod_data =  new Products({
                parentId: data._id,
                heading: `Enter Product Name Here...`,
                subHeadingOne: `Sub Heading Here`,
                descriptionOne: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`,
                subHeadingTwo: `Sub Heading Here`,
                descriptionTwo: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`,
                subHeadingThree: `Sub Heading Here`,
                descriptionThree: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.`,
                productImage: `https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/600px-No_image_available.svg.png`,
                productSheetSubHeading: `Lorem Ipsum is simply dummy text of the printing`,
                productDataSheets: [{}]
            })

            await prod_data.save();
            return res.status(200).json({ status: true, message: "Added Successful", data: data })
        } catch (err) {
            console.log(err)
            return res.status(200).json({ status: false, error: err.message })
        }

    } catch (error) {
        return res.status(200).json({ status: false, error: error.message })
    }
})


// GET Indurstry Solution For
router.get('/industry-solution-for', async (req, res, next) => {
    try {
        let main = await indusrtySolutionForSchema.find()

        return res.status(200).json({ status: true, message: "success", data: main })
    } catch (error) {
        return res.status(200).json({ status: false, error: error.message })
    }
})

// GET Solution Main Category
router.get('/solution-main-category/:id', async (req, res, next) => {
    try {
        let data = await solutionMainCategorySchema.find({ parentId: ObjectID(req.params.id) })

        return res.status(200).json({ status: true, message: "success", data: data })
    } catch (error) {
        return res.status(200).json({ status: false, error: error.message })
    }
})

// GET Solution SUB Category
router.get('/solution-sub-category/:id', async (req, res, next) => {
    try {
        let data = await solutionSubCategorySchema.find({ parentId: ObjectID(req.params.id) })

        return res.status(200).json({ status: true, message: "success", data: data })
    } catch (error) {
        return res.status(200).json({ status: false, error: error.message })
    }
})

// GET Solution Procduct Main Category
router.get('/product-main-category/:id', async (req, res, next) => {
    try {
        let data = await productMainCategorySchema.find({ parentId: ObjectID(req.params.id) })

        return res.status(200).json({ status: true, message: "success", data: data })
    } catch (error) {
        return res.status(200).json({ status: false, error: error.message })
    }
})

// Update Industry Solution For
/*
    Headers: auth-token
    body:   {
        "name": "Pulp"
    }
*/
router.put('/update/industry-solution-for/:id', verifyToken, async (req, res, next) => {

    try {
        const { error } = mainNav(req.body);
        if (error) return res.status(200).json({ status: false, message: error.details[0].message });
        // Check if Entity Exists
        const ItemExists = await indusrtySolutionForSchema.findOne({ _id: ObjectID(req.params.id) })
        if (!ItemExists) return res.status(200).json({ status: false, message: `Item Not Found` })

        let data = await indusrtySolutionForSchema.findByIdAndUpdate({ _id: ObjectID(req.params.id) }, {
            $set: {
                name: req.body.name
            }
        }, { upsert: true }).then(resp => {
            return res.status(200).json({ status: true, message: "Updated!" })
        }).catch(error => {
            return res.status(200).json({ status: false, error: error.message })
        })
    } catch (error) {
        return res.status(200).json({ status: false, error: error.message })
    }

})

// Update Solution Main Category
/*
    Headers: auth-token
    body:   {
        "name": "Pulp"
    }
*/
router.put('/update/solution-main-category/:id', verifyToken, async (req, res, next) => {

    try {
        const { error } = mainNav(req.body);
        if (error) return res.status(200).json({ status: false, message: error.details[0].message });
        // Check if Entity Exists
        const ItemExists = await solutionMainCategorySchema.findOne({ _id: ObjectID(req.params.id) })
        if (!ItemExists) return res.status(200).json({ status: false, message: `Item Not Found` })

        let data = await solutionMainCategorySchema.findByIdAndUpdate({ _id: ObjectID(req.params.id) }, {
            $set: {
                name: req.body.name
            }
        }, { upsert: true }).then(resp => {
            return res.status(200).json({ status: true, message: "Updated!" })
        }).catch(error => {
            return res.status(200).json({ status: false, error: error.message })
        })
    } catch (error) {
        return res.status(200).json({ status: false, error: error.message })
    }

})

// Update Solution Sub Category
/*
    Headers: auth-token
    body:   {
        "name": "Pulp"
    }
*/
router.put('/update/solution-sub-category/:id', verifyToken, async (req, res, next) => {

    try {
        const { error } = mainNav(req.body);
        if (error) return res.status(200).json({ status: false, message: error.details[0].message });
        // Check if Entity Exists
        const ItemExists = await solutionSubCategorySchema.findOne({ _id: ObjectID(req.params.id) })
        if (!ItemExists) return res.status(200).json({ status: false, message: `Item Not Found` })

        let data = await solutionSubCategorySchema.findByIdAndUpdate({ _id: ObjectID(req.params.id) }, {
            $set: {
                name: req.body.name
            }
        }, { upsert: true }).then(resp => {
            return res.status(200).json({ status: true, message: "Updated!" })
        }).catch(error => {
            return res.status(200).json({ status: false, error: error.message })
        })
    } catch (error) {
        return res.status(200).json({ status: false, error: error.message })
    }

})

// Update Product Main Category
/*
    Headers: auth-token
    body:   {
        "name": "Pulp"
    }
*/
router.put('/update/product-main-category/:id', verifyToken, async (req, res, next) => {

    try {
        const { error } = mainNav(req.body);
        if (error) return res.status(200).json({ status: false, message: error.details[0].message });
        // Check if Entity Exists
        const ItemExists = await productMainCategorySchema.findOne({ _id: ObjectID(req.params.id) })
        if (!ItemExists) return res.status(200).json({ status: false, message: `Item Not Found` })

        let data = await productMainCategorySchema.findByIdAndUpdate({ _id: ObjectID(req.params.id) }, {
            $set: {
                name: req.body.name
            }
        }, { upsert: true }).then(resp => {
            return res.status(200).json({ status: true, message: "Updated!" })
        }).catch(error => {
            return res.status(200).json({ status: false, error: error.message })
        })
    } catch (error) {
        return res.status(200).json({ status: false, error: error.message })
    }

})



// Delete Industry Solution For 
router.delete('/industry-solution-for/:id', verifyToken, async (req, res, next) => {

    try {
        // Check if already Exists
        let alreadyExists = await indusrtySolutionForSchema.findOne({ _id: ObjectID(req.params.id) })
        if (!alreadyExists) return res.status(200).json({ status: false, message: `Item does not exists` })

        var solutionMainCategory = await getSolutionMainCategory(req.params.id);
        var solutionSubCategory = await getSolutionSubCategory(solutionMainCategory);
        var productMainCategory = await getProductsMainCategory(solutionSubCategory);

        let gen = await deleteSubNavElement(solutionMainCategory, solutionSubCategory, productMainCategory);

        while (true) {

            if (gen.next().value !== undefined)
                console.log("called")
            else if (gen.next().value === undefined)
                break;
        }

        indusrtySolutionForSchema.findByIdAndDelete({ _id: ObjectID(req.params.id) }).then(resp => {
            return res.status(200).json({ status: true, message: "Deleted!" })
        }).catch(error => {
            return res.status(200).json({ status: false, error: error.message })
        })
    } catch (error) {
        return res.status(200).json({ status: false, error: error.message })
    }


})

// Delete Solution Main For 
router.delete('/solution-main-category/:id', verifyToken, async (req, res, next) => {

    try {
        // Check if already Exists
        let alreadyExists = await solutionMainCategorySchema.findOne({ _id: ObjectID(req.params.id) })
        if (!alreadyExists) return res.status(200).json({ status: false, message: `Item does not exists` })
        // console.log([alreadyExists])
        var solutionMainCategory = [];
        var solutionSubCategory = await getSolutionSubCategory([alreadyExists]);
        var productMainCategory = await getProductsMainCategory(solutionSubCategory);

        let gen = await deleteSubNavElement(solutionMainCategory, solutionSubCategory, productMainCategory);

        while (true) {

            if (gen.next().value !== undefined)
                console.log("called")
            else if (gen.next().value === undefined)
                break;
        }

        solutionMainCategorySchema.findByIdAndDelete({ _id: ObjectID(req.params.id) }).then(resp => {
            return res.status(200).json({ status: true, message: "Deleted!" })
        }).catch(error => {
            return res.status(200).json({ status: false, error: error.message })
        })
    } catch (error) {
        return res.status(200).json({ status: false, error: error.message })
    }


})

// Delete Solution Sub For 
router.delete('/solution-sub-category/:id', verifyToken, async (req, res, next) => {

    try {
        // Check if already Exists
        let alreadyExists = await solutionSubCategorySchema.findOne({ _id: ObjectID(req.params.id) })
        if (!alreadyExists) return res.status(200).json({ status: false, message: `Item does not exists` })

        var solutionMainCategory = [];
        var solutionSubCategory = [];
        var productMainCategory = await getProductsMainCategory([alreadyExists]);

        let gen = await deleteSubNavElement(solutionMainCategory, solutionSubCategory, productMainCategory);

        while (true) {

            if (gen.next().value !== undefined)
                console.log("called")
            else if (gen.next().value === undefined)
                break;
        }

        solutionSubCategorySchema.findByIdAndDelete({ _id: ObjectID(req.params.id) }).then(resp => {
            return res.status(200).json({ status: true, message: "Deleted!" })
        }).catch(error => {
            return res.status(200).json({ status: false, error: error.message })
        })
    } catch (error) {
        return res.status(200).json({ status: false, error: error.message })
    }


})

// Delete Product Main Category
router.delete('/product-main-category/:id', verifyToken, async (req, res, next) => {
    try {
        // Check if already Exists
        let alreadyExists = await productMainCategorySchema.findOne({ _id: ObjectID(req.params.id) })
        if (!alreadyExists) return res.status(200).json({ status: false, message: `Item does not exists` })

        productMainCategorySchema.findByIdAndDelete({ _id: ObjectID(req.params.id) }).then(resp => {

            Products.findOneAndDelete({ parentId: ObjectID(req.params.id) }).then(respp => {
                console.log('deleted page')
            })
            return res.status(200).json({ status: true, message: "Deleted!" })
        }).catch(error => {
            return res.status(200).json({ status: false, error: error.message })
        })

    } catch (error) {
        return res.status(200).json({ status: false, error: error.message })
    }
})


function* deleteSubNavElement(solutionMainCategory, solutionSubCategory, productMainCategory) {
    if (!Array.isArray(productMainCategory[0]) || productMainCategory[0].length > 0) {
        console.log("prod")
        productMainCategory.forEach(elem => {
            elem.forEach(item => {
                // console.log(item?._id)

                productMainCategorySchema.deleteOne({ _id: ObjectID(item?._id) })
                
                Products.findOneAndDelete({ parentId: ObjectID(item?._id) }).then(resp => {
                    console.log(resp)
                }).catch(error => {
                    console.log(error)
                })

            })

        })

        yield true;
    }

    if (solutionSubCategory != null || solutionSubCategory != undefined) {
        console.log("Sol Main")
        solutionSubCategory.forEach(elem => {
            console.log(elem?._id)
            solutionSubCategorySchema.deleteOne({ _id: ObjectID(elem?._id) })
        })
        yield true;
    }

    if (solutionMainCategory != null || solutionMainCategory != undefined) {
        console.log("Sol Sub")
        solutionMainCategory.forEach(elem => {
            console.log(elem?._id)
            solutionMainCategorySchema.deleteOne({ _id: ObjectID(elem?._id) })
        })
        yield true;
    }


}

async function getSolutionMainCategory(levelOneId) {
    let data = await solutionMainCategorySchema.find({ parentId: ObjectID(levelOneId) })
    return data;
}

async function getSolutionSubCategory(levelTwoData) {
    let data = [];
    await Promise.all(levelTwoData.map(async item => {

        if (item != null) {
            await solutionSubCategorySchema.findOne({ parentId: ObjectID(item._id) }).then(resp => {
                // console.log(resp)
                data.push(resp)
            })
        }

    }))

    return data;

}

async function getProductsMainCategory(levelThreeData) {
    let data = [];
    // console.log(levelThreeData)
    await Promise.all(levelThreeData.map(async item => {

        if (item != null) {
            await productMainCategorySchema.find({ parentId: ObjectID(item._id) }).then(resp => {
                // console.log(resp)
                data.push(resp)
            })
        }
    }))

    return data;
}


module.exports = router;

/*
    collection: industry_solution_for
    {
        _id: 608fc90b85911ef127dcd11e
        name: Pulp
        _v: 0
    }

    collection: solution_main_category
    {
        _id: 608fc95785911ef127dcd11f
        name:
        parentId: industry_solution_for._id
    }

    collection: solution_sub_category
    {
        _id: 608fc9c485911ef127dcd120
        name:
        parentId: main_category._id
    }

    collection: product_main_category
    {
        _id:
        name:
        parentId: solution_sub_category._id
    }
*/


