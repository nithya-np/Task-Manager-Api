const express=require("express")
require("./db/mongoose")
const userRouter=require("./routers/users")
const taskRouter=require("./routers/tasks")

const app=express()
const port=process.env.PORT // || 3000

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port,()=>{
    console.log("Server is up on port "+port)
})

// --------------------- middleware to disable GET request
// app.use((req,res,next)=>{
//     if(req.method==="GET"){
//         res.send("GET requests are disabled!")
//     }else{
//         next()
//     }
// })

// --------------------- middleware to disable all requests
// app.use((req,res,next)=>{
//     res.status(503).send("Site is currently down. Check back soon!")
// })