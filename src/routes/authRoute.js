import { Router } from "express";
import bcrypt from 'bcrypt';
import { Users } from "../models/users.js";
// import {smtp} from "..config/smtp.js";
import { generate_code } from "../utils/generate_code.js";
import { verfication } from "../models/verfication.js";
import { send_mail } from "../utils/send_email.js";

export const authRouter = Router();

// router.post("/", async (req, res)=>{

//   try {
//     const {name, age } = req.body;
//     console.log("name and age is: ", name, age );
    
//     if(!name || !age) return res.status(400).json({message: "name and age field is required"});
//       // this is to handle what happens when the fields are empty

//     const existing_user = Users.find((u) => u.name === name);
//     if (existing_user)
//       return res
//       .status(409)
//       .json({message:"name already exist"});

//       return res.staus(201).json({message:"user created"});
//       // the ":" beside the message is highly neccessary
//   } catch (error) {
//     console.log("error occured: ", error .message);
//     return res.status(500)
//     .json({message: error.message});
//   }
// });

// export default handler

 

authRouter.post("/register", async (req, res)=>{
    const {first_name, last_name, phone_number, email, password} = req.body;
// "/register"

    // check edge cases
    if (!email || !password)
        return res.status (400).json({message:"email and passoword is required"});

    // check if user exist
    const exist_user = Users.find(u=>u.email === email)
    if (exist_user)return res.status(400).json({message: "email taken, try another email"})

    // hash password
    const hashed_password = await bcrypt.hash(password, 5)
   
    // save user to DB

    const user = {first_name, last_name, phone_number, email, password: hashed_password};
    user.id = Users.length + 1;
    Users.push(user);

    // generate code
    const code = generate_code(6);

    // store code for user
    verfication.push({user_id: user.id, code:code})

    // send email confirmation
    send_mail({
        recipient_email: user.email,
        email_type: "email confirmation",
        template: `welcome ${user.first_name}, your otp for email confirmation code is
        ${verfication.find((v) => v.user_id == user.id).code}`,
    });
    

    res.status (201).json({message: "user created successfully", data: user});
});

authRouter.post('/verify-email', (req, res)=>{
    const {id} = req.body
    const exist_user = Users.find(u=>u.id===id);

    if(!exist_user)  return res.status(400).json({message: "invalid  user code"});

    const code = verfication;
    verfication(user.id);

    if(!code) return res.status(400).json({message: "invalid code"});

    if (verfication.find((v) => v.user_id == user.id)){
        delete verfication[code];
        res.status (200).json({message: "user verified successfully"});
    };
    
});



// "/login" {email, password}

// export default router
authRouter.post("/login", async (req,res)=>{
    const {email, password} = req.body


        // check edge cases
    if(!email || password)
        return res.status(400).json({ message: "email and password is required"}
    )

    // check if user exist
    const exist_user = Users.find(u=>u.email === email)
        if (!exist_user)return res.status(400).json({message: "wrong credentials"});

    // compare password
    const is_match = await bcrypt.compare(password, exist_user.password);

    // edge cases
    if(!is_match)return res.status(401).json({message: "wrong credentials"});

    // return user
    return res.status(200).json({ message: "success", data: exist_user});

});

// authRouter.post('/forgot_password',(req,res)=>{
//     const email = req.body
//     const user = Users.find(u=>u.email ===email)
    
//     if(!email)
//         return res.status(400).json({message: "email sent"});

    
//     const code = generate_code(6);

   

//     verfication.push({user_email: user.email, code:code})

//     send_mail({
//         recipient_email: user.email,
//         email_type: "email confirmation",
//         template: `Hi ${user.first_name}, your otp for forgotten password code is
//         ${verfication.find((v) => v.user_id == user.id).code}`,
//     });
// });


authRouter.post("/forgot-password", async (req,res) =>{
    const {email} = req.body 

    if(!email) return res.status(400).json({error: "email is required"});

    const user = Users.find((u)=>u.email===email)
    if(!user) return res.status(400).json({error: "user not found"});
    // check and delete existing otp

    
    const id= user.id

    verfication.find((v) => v.user_id === id)
    delete verfication.code
    // create otp
    const code = generate_code(6);

    // store code for user
    verfication.push({user_id: user.id, code:code})

    if (user)  send_mail({
        recipient_email: user.email,
        email_type: "forgot password",
        template: `${user.first_name}, your otp for email confirmation code is
        ${verfication.find((v)=>v.user_id)}`,
    });
    
})