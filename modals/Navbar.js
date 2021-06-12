const mongoose = require('mongoose');
const navbarSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true
   },
   order: {
      type: Number,
      required: true
   }
}, { collection: "navbar" }
);

module.exports = mongoose.model('Navbar', navbarSchema);