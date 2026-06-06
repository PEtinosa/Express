// middleware that acts as error handler
export const errorHandler = ((req,res,next) =>{
  console.log(`${req.method} ${req.url} not found`)
  next()
});
