export const generate_code = (len =5) =>{
    let char = Math.random();
    let strChar = char.toString().split(".")[1];
    let code = strChar.slice(0, len);
    return code;
};

console.log("code: ", generate_code(10));
