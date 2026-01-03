const mongoose = require('mongoose');
module.exports.connect = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connect successsssss");
    } catch(err) {
        console.log(err);
    }
}
