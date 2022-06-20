const mongoose=require('mongoose');



const usersSchema=new mongoose.Schema({
    name : String,
    email : String,
    balance : Number,
    accountNo : Number,
    date : {
        type:Date,
        default: new Date(),
    }
    
})


module.exports=mongoose.model('User',usersSchema);
