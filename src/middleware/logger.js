// this is a logger middleware
export function logger(req, res, next){
  const {method, url, ip} = req;
  console.log(`${method} ${url} ${ip}`)
  next()
};