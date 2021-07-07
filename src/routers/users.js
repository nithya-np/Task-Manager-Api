const express=require("express")
const multer=require("multer")
const sharp=require("sharp")
const users=require("../models/users.js")
const auth=require("../middleware/authentication")
// const { sendWelcomeEmail, sendCancelationEmail }=require("../emails/account")
const userRouter=new express.Router()

// route for signing up
userRouter.post("/users", async(req,res)=>{
    const user=new users(req.body)
    
    try{
        await user.save()
        // sendWelcomeEmail(user.email, user.name)
        const token=await user.generateAuthToken()
        res.status(201).send({user,token})
    }catch(e){
        res.status(400).send(e)
    }
})

// route for logging in
userRouter.post("/users/login", async(req,res)=>{
    try{
        const user=await users.findByCredentials(req.body.email, req.body.password)
        const token=await user.generateAuthToken()
        res.send( {user,token} )

    }catch(e){
        res.status(400).send("Unable to login!")
    }
})

// route for logging out
userRouter.post("/users/logout",auth,async(req,res)=>{
    try{
        req.user.tokens=req.user.tokens.filter((t)=>{
            return t.token !== req.token
        })
        await req.user.save()

        res.send("Logged out!")
    }catch(e){
        res.status(500).send("Unable to logout!")
    }
})


// route for logging out from all the devices
userRouter.post("/users/logoutAll",auth,async(req,res)=>{
    try{
        req.user.tokens=[]
        await req.user.save()

        res.send("Logged out from all the devices!")
    }catch(e){
        res.status(500).send("Unable to logout from all the devices!")
    }
})

// route to read profile
userRouter.get("/users/me", auth , async(req,res)=>{
    res.send(req.user)
    // console.log(req.method,req.path)
})

// route to update profile
userRouter.patch("/users/me",auth, async(req,res)=>{
    // if updating property not in database
    const updates=Object.keys(req.body)
    const allowedUpdates=['name','email','password','age']
    const isValidOperation=updates.every((update)=>allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({error:"Invalid Updates!"})
    }

    try{
        //const user=await users.findByIdAndUpdate(req.params.id, req.body, {new:true, runValidators:true}) 
        updates.forEach((update)=>req.user[update]=req.body[update])
        await req.user.save()
        res.send(req.user)
    }catch(e){
        res.status(400).send(e)
    }
})

// route to delete profile
userRouter.delete("/users/me",auth, async(req,res)=>{
    try{
        await req.user.remove()
        // sendCancelationEmail(req.user.email, req.user.name)
        res.send(req.user)
    }catch(e){
        res.status(400).send("Can't delete user!")
    }
})

// route to upload avatar
const upload=multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error("Please upload an image"))
        }
        cb(undefined,true)
    }
})

userRouter.post("/users/me/avatar", auth, upload.single("avatar"), async(req,res)=>{
    const buffer=await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar=buffer

    await req.user.save()
    res.send("Avatar uploaded!")
},(error,req,res,next)=>{
    res.status(400).send({error: error.message})
})

// route to delete avatar
userRouter.delete("/users/me/avatar", auth, async (req,res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send("Avatar deleted!")
})

// route for fetching avatar - using browser
userRouter.get("/users/:id/avatar", async(req,res)=>{
    try{
        const user=await users.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error("error in fetching")
        }

        res.set("Content-Type","image/png")
        res.send(user.avatar)


    }catch(e){
        res.status(404).send()
    }
})

module.exports=userRouter