const router = require('express').Router();

const Navbar = require('../modals/Navbar');
const SubMenu = require('../modals/SubMenu');
const verifyToken = require('./verifyJWT')

router.post('/add/menu', verifyToken ,async (req, res, next) => {
    const navbar = new Navbar({
        name: req.body.name,
    })

    try {
        let navbarData = await navbar.save();

        if(req.body.subMenu != undefined || req.body.subMenu != null){
            
            for(let i = 0; i < req.body.subMenu.length; i++){
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
                    return res.status(200).json({ status: false, message: err.message })
                }
            }

        }

        return res.status(200).json({ status: true, message: "Added Successful", data: { navbarData } })
    } catch (err) {
        console.log(err)
        return res.status(200).json({ status: false, message: err })
    }
})

// router.post('/add/submenu', async (req, res, next) => {

//     const subMenu = new SubMenu({
//         name: req.body.name,
//         parentId: req.body.parentId
//     })

//     try {
//         let subMenuData = await subMenu.save();
//         return res.status(200).json({ status: true, message: "Added Successful", data: { subMenuData } })
//     } catch (err) {
//         console.log(err)
//         return res.status(200).json({ status: false, message: err.message })
//     }
// })

router.get('/', verifyToken , async (req, res, next) => {
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
})



module.exports = router;