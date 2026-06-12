import { Router } from "express";
import bcrypt from "bcrypt";
import { Users } from "../models/users.js";
// import {smtp} from "..config/smtp.js";
import { generate_code } from "../utils/generate_code.js";
import { verification } from "../models/verification.js";
import { send_mail } from "../utils/send_email.js";
import { Prisma} from "../config/db.js";

export const authRouter = Router();



authRouter.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    // check edge cases
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "email and passoword is required" });

    // check if user exist
    // const exist_user = Users.find((u) => u.email === email);
    const exist_user = await Prisma.user.findUnique({
      where:{
        email: email
      }
    }); 

    if (exist_user)
      return res
        .status(400)
        .json({ message: "email taken, try another email" });

    // hash password
    const hashed_password = await bcrypt.hash(password, 5);

    // save user to DB

    const user = {
      first_name,
      last_name,
      email,
      password: hashed_password,
    };

    const created_user = await Prisma.user.create({
      data: user
    });

    // generate code
    const code = generate_code(6);

    // store code for user
    const verify = await Prisma.verification.create({
      data: {user_id: created_user.id, code: code }
    });

    // send email confirmation
    send_mail({
      recipient_email: user.email,
      email_type: "email confirmation",
      template: `welcome ${user.first_name}, your otp for email confirmation code is
        ${verify.code}`,
    });

    res.status(201).json({ message: "user created successfully", data: user });
  } catch (error) {
    console.log("error occured: ", error.message);
    return res.status(500).json({ message: error.message });
  }
});

authRouter.post("/verify-email/", async(req, res) => {

  try {

    const { id, code } = req.body;
    console.log("id: ", id, "code: ", code);

    // const exist_user = Users.find((u) => u.id == id);
    const exist_user = await Prisma.user.findUnique({
      where:{
        id: Number(id) 
      }
    }); 

    if (!exist_user)
    return res.status(400).json({ message: "invalid  user code" });

  const actual_code = verification.find(
    (v) => v.id === exist_user.id,
  )?.code;

  //   if (!code) return res.status(400).json({ message: "invalid code" });
  // compare code sent to user email and the code sent in the request
  const is_match = code === actual_code;

  exist_user.isVerified = is_match;


  if (is_match) {
    // delete code from verification array
    const index = verification.findIndex((v) => v.id === exist_user.id);
    verification.splice(index, 1);
  }
  res.status(200).json({ message: "user verified successfully" });

  } catch (error) {
    console.log("error occured: ", error.message);
    return res.status(500).json({ message: error.message });
  }
  

  

  
});

// "/login" {email, password}

// export default router
authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // check edge cases
  if (!email || password)
    return res.status(400).json({ message: "email and password is required" });

  // check if user exist
  const exist_user = Users.find((u) => u.email === email);
  if (!exist_user)
    return res.status(400).json({ message: "wrong credentials" });

  // compare password
  const is_match = await bcrypt.compare(password, exist_user.password);

  // edge cases
  if (!is_match) return res.status(401).json({ message: "wrong credentials" });

  // return user
  return res.status(200).json({ message: "success", data: exist_user });
});

// authRouter.post('/forgot_password',(req,res)=>{
//     const email = req.body
//     const user = Users.find(u=>u.email ===email)

//     if(!email)
//         return res.status(400).json({message: "email sent"});

//     const code = generate_code(6);

//     verification.push({user_email: user.email, code:code})

//     send_mail({
//         recipient_email: user.email,
//         email_type: "email confirmation",
//         template: `Hi ${user.first_name}, your otp for forgotten password code is
//         ${verification.find((v) => v.user_id == user.id).code}`,
//     });
// });

authRouter.post("/forgot-password", async (req, res) => {
  
  // console.log("email: ", email)
  try {

    const { email} = req.body;
    const code = generate_code(6);

    if (!email) return res.status(400).json({ error: "email is required" });


      const exist_user = await Prisma.user.findUnique({
        where:{
          email: email
        }
      }); 
    console.log("existing user:", exist_user);

    if (!exist_user) return res.status(400).json({ error: "user not found" });
    // check and delete existing otp

    const actual_code = verification.find(
      (v) => v.user_id === exist_user.id
    )?.code;

    const is_match = code === actual_code;

    exist_user.isVerified = is_match;

    if (is_match) {
    // delete code from verification array
    const index = verification.findIndex((v) => v.user_id === exist_user.id);
    verification.splice(index, 1);
  }
  // create otp
  // const code = generate_code(6);

  // store code for user
  // verification.push({ user_id:exist_user.id, code: code });

  const verify = await Prisma.verification.create({
      data: {user_id: exist_user.id, code: code }
    });

  if (exist_user)
    send_mail({
      recipient_email: exist_user.email,
      email_type: "forgot password",
      template: `${exist_user.first_name}, your otp for email confirmation code is
        ${verify.code}`,
    });
    res.status(200).json({ message: "OTP sent"});
  } catch (error) {
    console.log("error occured: ", error.message);
    return res.status(500).json({ message: error.message });
  }
    
  
});

authRouter.post("/reset-password", async (req,res)=>{
  const {email, code, password, id}= req.body

  try {
    const exist_user = await Prisma.user.findUnique({
      where:{
        email: email
      }
    }); 

     if (!exist_user)
    return res.status(400).json({ message: "invalid  user" });

      const old_password = verification.find(
    (v) => v.id === exist_user.id,
  )?.password;
    const is_match = password === old_password;

    exist_user.isVerified = is_match;

     if (is_match) {
    // delete code from verification array
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: { password },
    });
  }
  res.status(200).json({ message: "password reset" });

  } catch (error) {
    console.log("error occured: ", error.message);
    return res.status(500).json({ message: error.message });
  }

});
