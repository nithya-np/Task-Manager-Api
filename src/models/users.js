const mongoose=require("mongoose")
const validator=require("validator")
const bcrypt=require("bcryptjs")
const jwt=require("jsonwebtoken")
const tasks=require("./tasks")

const userSchema=new mongoose.Schema({  
    name:{
        type: String,
        required: true,
        trim:true
    },
    email:{
        type: String,
        required:true,
        trim:true,
        lowercase:true,
        unique: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Email is invalid!")
            }
        }
    },
    password:{
        type: String,
        required: true,
        minlength: 6,
        trim:true,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    age:{
        type: Number,
        default:0,
        validate(value){
            if(value<0){
                throw new Error("Age must be a positive number!")
            }
        }
    },
    tokens: [{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type: Buffer
    }
}, {
    timestamps: true
})

// FK
userSchema.virtual("tasks",{
    ref: "Task",
    localField: "_id",
    foreignField: "owner"
})

// Hiding private details of user
userSchema.methods.toJSON=function(){
    const user=this
    const userObject=user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject

}

userSchema.methods.generateAuthToken=async function(){
    const user=this
    const Token=jwt.sign({ _id:user._id.toString() }, process.env.JWT_SECRET)
    
    user.tokens=user.tokens.concat({token:Token})
    await user.save()

    return Token
}

userSchema.statics.findByCredentials=async(Email,Password)=>{
    const user=await users.findOne({email:Email})

    if(!user){
        throw new Error("Unable to login!")
    }

    const isMatch=await bcrypt.compare(Password, user.password)

    if(!isMatch){
        throw new Error("Unable to login!")
    }

    return user
}

// Middleware to hash the plain text password before saving
userSchema.pre("save",async function(next){
    const user=this
    
    if(user.isModified("password")){
        user.password=await bcrypt.hash(user.password, 8)
    }

    next()
})

// Middleware to delete user tasks when user is removed
userSchema.pre("remove",async function(next){
    const user=this
    await tasks.deleteMany({owner: user._id})
    next()
})

const users=mongoose.model("User", userSchema)

module.exports=users


