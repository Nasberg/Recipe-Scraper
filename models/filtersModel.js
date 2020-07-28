const mongoose = require('mongoose');

// keyword schema
const filtersSchema = mongoose.Schema({
  filterCode: Number
});

const FiltersModel = module.exports = mongoose.model('filters', filtersSchema);
