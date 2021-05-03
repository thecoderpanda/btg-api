const mongoose = require('mongoose');
const subMenuSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true
   },
   parentId: {
       type: mongoose.Schema.Types.ObjectId,
       required: true,
       ref: 'navbar'
   }
}, { collection: "subMenu" }
);

module.exports = mongoose.model('SubMenu', subMenuSchema);