import express from "express";
const app = express();
//  const port = 5000;

const Users = [
    {id: 1, name: "Abc", age :'3'},
     {id: 2, name: "Def", age :'5'}
]
// where RH - Route handler and SRH- specific route handler
async function RH(req, res) {
  try {
    const user = Users;
    return res.status(200).json({message: "OK", data: users});

  } catch (error) {
    res.status(500).json({error:"error message"});
  }
};

app.get("/users",RH);


async function SRH(req,res) {
  try {
    const age = req.body ['age'];
    const userId = req.params.userId;
    const user = User.find((u)=>u.id===Users.id);

    if(!user){
      return res.status(404);
    }
    user.age = age;
    return res.status(200);
  } catch (error) {
    return res.status(500);
  }
};

app.patch("/users/:userId", SRH );


app.listen(5000, () => console.log("server started"));
//  app.listen(port, () => console.log("server started"));