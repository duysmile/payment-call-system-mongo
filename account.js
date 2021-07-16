const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    balance: {
        type: Number,
        min: 0,
        max: 1000,
    },
    estimate: {
        type: Number,
        min: 0,
        max: 1000,
    },
}, {
    timestamps: true,
});

const AccountModel = mongoose.model('Account', accountSchema);
module.exports = AccountModel;
