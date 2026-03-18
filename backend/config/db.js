const { default: mongoose } = require("mongoose")

const db = async (uri) => {
    try {
        const conn = await mongoose.connect(uri);
        console.log('MongoDB connected');
    } catch (err) {
        console.log(err);
    }
}

module.exports = db