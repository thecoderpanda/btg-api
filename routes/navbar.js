const router = require('express').Router();
const Navbar = require('../modals/Navbar');
const SubMenu = require('../modals/SubMenu');
const verifyToken = require('./verifyJWT')
const ObjectID = require('mongodb').ObjectID;

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


module.exports = router;