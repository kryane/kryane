// 验证数据库相关内容
const User ={
	// 查询用户手机号
	queryUserTel( option ){
		return 'select * from user where tel="' + option.userTel + '";'
	},
	// 查询用户密码
	queryUserPwd( option ){
		return 'select * from user where (tel="' + option.userTel + '") and pwd ="' + option.userPwd + '";'
	},
	// 新增用户
	insertData(option){
		let userTel = option.userTel
		// console.log(userTel, '2')
		let userPwd = option.pwd || '666666'
		
		let jwt = require("jsonwebtoken")
		// 用户信息
		let payload = {
			tel: userTel
		}
		// 口令
		let secret = 'xiaoluxian'
		// 生成token
		let token = jwt.sign(payload, secret, {
			// 设置token的过期时间为60s
			expiresIn: 60
		})
		
		return 'insert into user (tel,pwd,imgUrl,nickName,token) values ("'+userTel+'","'+ userPwd + '","/images/user.jpeg","admin","'+token+'")';
	}
}

exports = module.exports = User