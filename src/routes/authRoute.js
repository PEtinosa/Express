import { Router } from "express";
import bcrypt from "bcrypt";
import { Users } from "../models/users.js";
// import {smtp} from "..config/smtp.js";
import { generate_code } from "../utils/generate_code.js";
import { verfication } from "../models/verfication.js";
import { send_mail } from "../utils/send_email.js";

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, phone_number, email, password } = req.body;

    // check edge cases
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "email and passoword is required" });

    // check if user exist
    const exist_user = Users.find((u) => u.email === email);
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
      phone_number,
      email,
      password: hashed_password,
    };
    user.id = Users.length + 1;
    Users.push(user);

    // generate code
    const code = generate_code(6);

    // store code for user
    verfication.push({ user_id: user.id, code: code });

    // send email confirmation
    send_mail({
      recipient_email: user.email,
      email_type: "email confirmation",
      template: `welcome ${user.first_name}, your otp for email confirmation code is
        ${verfication.find((v) => v.user_id == user.id).code}`,
    });

    res.status(201).json({ message: "user created successfully", data: Users });
  } catch (error) {
    console.log("error occured: ", error.message);
    return res.status(500).json({ message: error.message });
  }
});

authRouter.post("/verify-email", (req, res) => {
  const { user_id, code } = req.body;
  console.log("user id: ", user_id, "code: ", code);

  const exist_user = Users.find((u) => u.id == user_id);

  if (!exist_user)
    return res.status(400).json({ message: "invalid  user code" });

  const actual_code = verfication.find(
    (v) => v.user_id === exist_user.id,
  )?.code;

  //   if (!code) return res.status(400).json({ message: "invalid code" });
  // compare code sent to user email and the code sent in the request
  const is_match = code === actual_code;

  exist_user.isVerified = is_match;

  if (is_match) {
    // delete code from verfication array
    const index = verfication.findIndex((v) => v.user_id === exist_user.id);
    verfication.splice(index, 1);
  }
  res.status(200).json({ message: "user verified successfully" });
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

//     verfication.push({user_email: user.email, code:code})

//     send_mail({
//         recipient_email: user.email,
//         email_type: "email confirmation",
//         template: `Hi ${user.first_name}, your otp for forgotten password code is
//         ${verfication.find((v) => v.user_id == user.id).code}`,
//     });
// });

authRouter.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "email is required" });

  const user = Users.find((u) => u.email === email);
  if (!user) return res.status(400).json({ error: "user not found" });
  // check and delete existing otp

  const id = user.id;

  verfication.find((v) => v.user_id === id);
  delete verfication.code;
  // create otp
  const code = generate_code(6);

  // store code for user
  verfication.push({ user_id: user.id, code: code });

  if (user)
    send_mail({
      recipient_email: user.email,
      email_type: "forgot password",
      template: `${user.first_name}, your otp for email confirmation code is
        ${verfication.find((v) => v.user_id)}`,
    });
});
