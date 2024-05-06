const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const quoteSchema = new Schema({
    q: {
        type: String,
        required: true,
    },
    a: {
        type: String,
        required: true,
    },
});

const Quote = mongoose.model("Quote", quoteSchema);

module.exports = Quote;
