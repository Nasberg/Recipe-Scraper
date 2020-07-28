const mongoose = require('mongoose');

// keyword schema
const keywordsSchema = mongoose.Schema({
  keyword: String
});

const KeywordsModel = module.exports = mongoose.model('keywords', keywordsSchema);
