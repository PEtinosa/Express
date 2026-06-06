import express from "express";
import cors from "cors";
import { Users } from "./models/users.js";
import { logger } from "./middleware/logger.js";
import { errorHandler } from "./middleware/errorhandler.js";
import { authRouter } from "./routes/authRoute.js";


const app = express();
app.use (cors());
app.use(express.json());
app.use(express.urlencoded({ extended:true}));



app.use(logger);

// route handlers
/*the users is now included in the route because 
the middleware is now a route handler, hence the app.use*/ 
app.use("/auth", authRouter)

// this is the route
// the routes can be many
// app.get   ("/", (req, res) => {
//   return res.send("Home Page");
// });

// app.get("/users/:id", async (req, res) => {
//   try {
//     const userId = req.params.id;
//     const user = Users.find((u) => u.id == 6);
//     if(!user) {
//       return res.status(404);
//     }
//     return res.status(200).json({ message: "error", data: user });
//   } catch (error) {
//     console.log(e.message);
//     return res
//       .status(500)
//       .json({ message: "error getting users", error: e.message });
//   }
// });



// app.get("/*", async function fallback(req,res) {
//   return res.status(404).json({message: `requested page not found`})
// })

app.use(errorHandler);

app.listen(5006, ()=>console.log("server started at port:", 5006))


  
