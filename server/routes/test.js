// const jwt = require('jsonwebtoken');
 
// const secretKey = 'xiaoluxian'   //secret
// const expiresIn = 60 * 60 * 24 * 30;    //时效 (秒)
 
// //生成jwt
// function generateToken(uid) {
//     const token = jwt.sign({
//         uid
//     }, secretKey)
//     return token
// }
 
// //解析jwt
// function verifyToken(token) {
//     return jwt.verify(token, secretKey)
// }
 
 
// //计算剩余时间
// function tokenExp(token) {
//     let verify = verifyToken(token);
//     let time = parseInt((new Date().getTime()) / 1000);
//     return `剩余${verify.exp - time}秒`
// }
 
// let token = generateToken('15207109573');
 
// console.log(token);                //输出token
// console.log(verifyToken(token));   //输出token内容
// console.log(tokenExp(token))        //输出token剩余时间


let jwt = require("jsonwebtoken")
// 用户信息
let payload = {
	tel: 12345612345
}
// 口令
let secret = 'xiaoluxian'
// 生成token
let token = jwt.sign(payload, secret)

console.log(token)
console.log(jwt.decode(token))