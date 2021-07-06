const jwt=require("jsonwebtoken")
const users=require("../models/users")

const auth=async(req,res,next)=>{
    try{
        //token given in authorization header
        const token=req.header("Authorization").replace("Bearer ","")
        //check for valid jwt
        const decoded=jwt.verify(token, process.env.JWT_SECRET)
        //search that jwt in database
        const user=await users.findOne({_id:decoded._id,"tokens.token":token})

        if(!user){
            throw new Error()
        }

        req.user=user
        req.token=token
        next()
    }catch(e){
        res.status(401).send({error: "Please authenticate."})
    }
}

module.exports=auth