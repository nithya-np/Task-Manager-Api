
const express=require("express")
const tasks=require("../models/tasks.js")
const auth=require("../middleware/authentication")
const taskRouter=new express.Router()

taskRouter.post("/tasks", auth, async(req,res)=>{
    //const task=new tasks(req.body)
    const task=new tasks({
        ...req.body,
        owner: req.user._id
    })
    try{
        await task.save()
        res.status(201).send(task)
    }catch(e){
        res.status(400).send(e)
    }
})

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=0 -- pagination
// GET /tasks?sortBy=createdAt:desc -- sorting  
taskRouter.get("/tasks", auth, async(req,res)=>{
    const match={} 
    const sort={}

    if(req.query.completed){
        match.completed= req.query.completed === "true"
    }

    if(req.query.sortBy){
        const parts=req.query.sortBy.split(":")
        //console.log(parts)
        sort[parts[0]] = (parts[1] === "desc"? -1 : 1)
    }

    try{
        await req.user.populate({
            path: "tasks",
            match,
            options:{
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
                // {createdAt:-1}      --> 1 for createdAt:asc
            }
        }).execPopulate()
        res.send(req.user.tasks)
    }catch(e){
        res.status(500).send()
    }
})

taskRouter.get("/tasks/:id",auth, async(req,res)=>{
    const _id=req.params.id

    try{
        const task=await tasks.findOne({ _id, owner: req.user._id})

        if(!task){
            return res.status(404).send("Task not found!")
        }

        res.send(task)
    }catch(e){
        res.status(500).send()
    }
})

taskRouter.patch("/tasks/:id", auth, async(req,res)=>{
    const updates=Object.keys(req.body)
    const allowedUpdates=["description","completed"]
    const isValidOperation=updates.every((update)=>allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({error:"Invalid Updates!"})
    }

    const _id=req.params.id
    try{
        //const task=await tasks.findById(req.params.id)
        const task=await tasks.findOne({_id, owner: req.user._id})
        
        if(!task){
            return res.status(404).send("Task not found!")
        }

        updates.forEach((update)=>task[update]=req.body[update])
        await task.save()
        res.send(task)
    }catch(e){
        res.status(400).send(e)
    }
})

taskRouter.delete("/tasks/:id", auth, async(req,res)=>{
    try{
        //const task=await tasks.findByIdAndDelete(req.params.id)
        const task=await tasks.findOneAndDelete({_id: req.params.id , owner: req.user._id})
        if(!task){
            return res.status(404).send("Task not found!")
        }
        res.send(task)
    }catch(e){
        res.status(400).send()
    }
})

module.exports=taskRouter