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

const {
    BlobServiceClient,
    StorageSharedKeyCredential,
    newPipeline
} = require('@azure/storage-blob');
const containerName = 'btg-data';
const inMemoryStorage = multer.memoryStorage();
const getStream = require('into-stream');
// import intoStream from 'into-stream';

const ONE_MEGABYTE = 1024 * 1024 * 100;
const uploadOptions = { bufferSize: 4 * ONE_MEGABYTE, maxBuffers: 20 };
const ONE_MINUTE = 60 * 1000;

const sharedKeyCredential = new StorageSharedKeyCredential(
    process.env.AZURE_STORAGE_ACCOUNT_NAME,
    process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY);
const pipeline = newPipeline(sharedKeyCredential);

const blobServiceClient = new BlobServiceClient(
    `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
    pipeline
);

const getBlobName = originalName => {
    // Use a random number to generate a unique file name, 
    // removing "0." from the start of the string.
    const identifier = Math.random().toString().replace(/0\./, '');
    return `${identifier}-${originalName}`;
};

var cpUpload = upload.fields([{ name: 'productImage', maxCount: 1 }, { name: 'dataSheets', maxCount: 8 }])
router.put('/:id', verifyToken, cpUpload, async (req, res, next) => {
    try {
        let productImgURL = '';
        let dataSheetsArray = [];
        const alreadyExists = await Products.findOne({ parentId: ObjectID(req.params.id) })
        if (!alreadyExists) return res.status(200).json({ status: false, message: `${req.body.heading} doesn't exists` })

        if (req.files['productImage'] != null) {
            console.log(req.files)

            const blobName = getBlobName(req.files['productImage'][0].originalname);
            const stream = getStream(req.files['productImage'][0].buffer);
            const containerClient = blobServiceClient.getContainerClient(containerName);;
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);

            try {
                await blockBlobClient.uploadStream(stream,
                    uploadOptions.bufferSize, uploadOptions.maxBuffers,
                    { blobHTTPHeaders: { blobContentType: "file/*" } });
                productImgURL = `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${containerName}/${blobName}`

                // console.log(productImgURL)

            } catch (err) {
                return res.json({ status: false, message: err.message });
            }
        }

        if (req.files['dataSheets'] != null) {
            datasheetURL = ''
            await Promise.all(req.body.dataSheetsName.map(async (element, index) => {

                let url = await uploadDataSheet(req.files['dataSheets'][index])

                dataSheetsArray.push({ name: element, url: url })
                // console.log('fucntion ke bad')x  
                console.log(dataSheetsArray)
            }))

        }
        await Products.findOneAndUpdate({ parentId: ObjectID(req.params.id) }, {
            $set: {
                parentId: req.params.id,
                heading: req.body.heading,
                subHeadingOne: req.body.subHeadingOne,
                descriptionOne: req.body.descriptionOne,
                subHeadingTwo: req.body.subHeadingTwo,
                descriptionTwo: req.body.descriptionTwo,
                subHeadingThree: req.body.subHeadingThree,
                descriptionThree: req.body.descriptionThree,
                productImage: productImgURL || req.body.productImage,
                productSheetSubHeading: req.body.productSheetSubHeading,
                productDataSheets: dataSheetsArray.length != 0 ? dataSheetsArray : JSON.parse(req.body.productDataSheets)
            }
        }, { upsert: true }).then(resp => {
            console.log(dataSheetsArray)
            // console.log('query exeuctipjn')
            return res.status(200).json({ status: true, message: "Updated!" })

        }).catch(error => {
            return res.status(200).json({ status: false, error: error.message })
        })
    } catch (err) {
        console.log(err)
        return res.status(200).json({ status: false, error: err.message })
    }
})


router.get('/get/:id', async (req, res, next) => {
    try {
        const data = await Products.findOne({ parentId: ObjectID(req.params.id) });

        return res.status(200).json({ status: true, message: "success", data })

    } catch (err) {
        console.log(err)
        return res.status(200).json({ status: false, error: err.message })
    }
})

async function uploadDataSheet(file) {

    const blobName = getBlobName(file.originalname);
    const stream = getStream(file.buffer);
    const containerClient = blobServiceClient.getContainerClient(containerName);;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    try {
        await blockBlobClient.uploadStream(stream,
            uploadOptions.bufferSize, uploadOptions.maxBuffers,
            { blobHTTPHeaders: { blobContentType: "file/*" } });
        datasheetURL = `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${containerName}/${blobName}`
        return datasheetURL;
        // dataSheetsArray.push({ name: element, url: datasheetURL })
        console.log(dataSheetsArray)
    } catch (err) {
        return res.json({ status: false, message: err.message });
    }
    // dataSheetsArray.push({ name: element, url: "Fuck" })

}
module.exports = router;