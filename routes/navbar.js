const router = require('express').Router();
const Navbar = require('../modals/Navbar');
const SubMenu = require('../modals/SubMenu');
const verifyToken = require('./verifyJWT')
const ObjectID = require('mongodb').ObjectID;
const { mainNav, subNavCat } = require('./validation');

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
            res.send(resp);
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




router.get('/subnav', async (req, res, next) => {
    let data = [];
    let main = await indusrtySolutionForSchema.find()

    data.push(main)
    main.map(async (item, index) => {
        // main[index].push('a')
        console.log(main[index])
    })


    await Promise.all(main.map(async (item) => {
        const sub_main = await solutionMainCategorySchema.find({ parentId: ObjectID(item._id) })
        // console.log(d)
        main.push(sub_main)

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

    res.send(data)
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
            return res.status(200).json({ status: true, message: "Added Successful", data: data })
        } catch (err) {
            console.log(err)
            return res.status(200).json({ status: false, error: err.message })
        }

    } catch (error) {
        return res.status(200).json({ status: false, error: error.message })
    }
})

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


