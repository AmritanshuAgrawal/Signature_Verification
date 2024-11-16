const mongoose=require("mongoose")
mongoose.connect("mongodb://0.0.0.0:27017/signature_verification")
.then(()=>{
    console.log("mongodb connected");
})
.catch(()=>{
    console.log('failed');
})


const newSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

const collection = mongoose.model("Admin",newSchema)

module.exports=collection
