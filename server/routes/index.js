var express = require('express');
var router = express.Router();
var connection = require('../db/sql.js');
var user = require('../db/userSql.js');
var QcloudSms = require("qcloudsms_js");
// 解决req.body为空的问题
var bodyParser = require('body-parser')
var jwt = require('jsonwebtoken')

//引入支付宝配置文件
const alipaySdk = require('../db/alipay.js');
const AlipayFormData = require('alipay-sdk/lib/form').default;
//引入axiso
const axios = require('axios');

// 验证token是否是过期的
function getTimeToken(exp) {
	let getTime = parseInt(new Date().getTime() / 1000)
	if (getTime - exp > 60) {
		return true
	}
}

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', { title: 'Express' });
});

//支付状态
router.post('/api/successPayment', function (req, res, next) {
	//token
	let token = req.headers.token;
	let tokenObj = jwt.decode(token);
	//订单号
	let out_trade_no = req.body.out_trade_no;
	let trade_no = req.body.trade_no;
	//支付宝配置
	const formData = new AlipayFormData();
	// 调用 setMethod 并传入 get，会返回可以跳转到支付页面的 url
	formData.setMethod('get');
	//支付时信息
	formData.addField('bizContent', {
		out_trade_no,
		trade_no
	});
	//返回promise
	const result = alipaySdk.exec(
		'alipay.trade.query',
		{},
		{ formData: formData },
	);
	//后端请求支付宝
	result.then(resData => {
		axios({
			method: 'GET',
			url: resData
		}).then(data => {
			let responseCode = data.data.alipay_trade_query_response;
			if (responseCode.code == '10000') {
				switch (responseCode.trade_status) {
					case 'WAIT_BUYER_PAY':
						res.send({
							data: {
								code: 0,
								data: {
									msg: '支付宝有交易记录，没付款'
								}
							}
						})
						break;

					case 'TRADE_CLOSED':
						res.send({
							data: {
								code: 1,
								data: {
									msg: '交易关闭'
								}
							}
						})
						break;

					case 'TRADE_FINISHED':
						connection.query(`select * from user where tel = "${tokenObj.tel}"`, function (error, results) {
							//用户id
							let uId = results[0].id;
							connection.query(`select * from store_order where uid = ${uId} and order_id = ${out_trade_no}`, function (err, result) {
								let id = result[0].id;
								//订单的状态修改掉2==》3
								connection.query(`update store_order set order_status = replace(order_status,'2','3') where id = ${id}`, function () {
									res.send({
										data: {
											code: 2,
											data: {
												msg: '交易完成'
											}
										}
									})
								})
							})
						})
						break;

					case 'TRADE_SUCCESS':
						connection.query(`select * from user where tel = "${tokenObj.tel}"`, function (error, results) {
							//用户id
							let uId = results[0].id;
							connection.query(`select * from store_order where uid = ${uId} and order_id = ${out_trade_no}`, function (err, result) {
								let id = result[0].id;
								//订单的状态修改掉2==》3
								connection.query(`update store_order set order_status = replace(order_status,'2','3') where id = ${id}`, function () {
									res.send({
										data: {
											code: 2,
											data: {
												msg: '交易完成'
											}
										}
									})
								})
							})
						})
						break;
				}
			} else if (responseCode.code == '40004') {
				res.send({
					data: {
						code: 4,
						msg: '交易不存在'
					}
				})
			}
		}).catch(err => {
			res.send({
				data: {
					code: 500,
					msg: '交易失败',
					err
				}
			})
		})
	})
})

// 发起支付
router.post('/api/payment', function (req, res, next) {
	//订单号
	let orderId = req.body.orderId;
	//商品总价
	let price = req.body.price;
	//购买商品的名称
	let name = req.body.name;
	//开始对接支付宝API
	const formData = new AlipayFormData();
	// 调用 setMethod 并传入 get，会返回可以跳转到支付页面的 url
	formData.setMethod('get');
	//支付时信息
	formData.addField('bizContent', {
		outTradeNo: orderId,//订单号
		productCode: 'FAST_INSTANT_TRADE_PAY',//写死的
		totalAmount: price,//价格
		subject: name,//商品名称
		body: '商品详情'
	});
	//支付成功或者失败跳转的链接
	formData.addField('returnUrl', 'http://localhost:8080/payment');
	//返回promise
	const result = alipaySdk.exec(
		'alipay.trade.page.pay',
		{},
		{ formData: formData },
	);
	//对接支付宝成功，支付宝方返回的数据
	result.then(resp => {
		res.send({
			data: {
				code: 200,
				success: true,
				msg: '支付中',
				paymentUrl: resp
			}
		})
	})
})

// 修改订单状态		submitOrder
router.post("/api/submitOrder", function (req, res, next) {
	let token = req.headers.token
	let tokenObj = jwt.decode(token);

	let order_id = req.body.order_id
	let shopArr = req.body.shopArr

	// 查询用户是否存在
	connection.query(`select * from user where tel = "${tokenObj.tel}"`, function (error, results) {
		// 用户id
		let uId = results[0].id
		// 查找订单的数据id
		connection.query(`select * from store_order where uid = ${uId} and order_id = ${order_id}`, function (err, result) {
			let id = result[0].id
			// 修改订单状态		1 ==> 2
			connection.query(`update store_order set order_status = replace(order_status, '1', '2') where id = ${id}`, function (e, r) {
				// 删除购物车的数据
				shopArr.forEach(v => {
					connection.query(`delete from goods_cart where id = ${v}`, function () {

					})
				})
				res.send({
					data: {
						code: 200,
						success: true
					}
				})
			})
		})
	})
})

// 查询订单
router.post("/api/selectOrder", function (req, res, next) {
	// 接收前端给后端的订单号
	let order_id = req.body.order_id
	connection.query(`select * from store_order where order_id = '${order_id}'`, function (e, r) {
		res.send({
			data: {
				code: 200,
				success: true,
				data: r
			}
		})
	})
})

// 生成一个订单
router.post("/api/addOrder", function (req, res, next) {
	//token
	let token = req.headers.token;
	let tokenObj = jwt.decode(token);

	// 前端给后端传递的数据
	let goodsArr = req.body.arr

	// 生成一个订单号	时间戳 + 六位随机数
	function setTimeDateFmt(s) {
		return s < 10 ? '0' + s : s
	}

	function randomNumber() {
		const now = new Date()
		let month = now.getMonth() + 1
		let day = now.getDate()
		let hour = now.getHours()
		let minutes = now.getMinutes()
		let seconds = now.getSeconds()

		month = setTimeDateFmt(month)
		day = setTimeDateFmt(day)
		hour = setTimeDateFmt(hour)
		minutes = setTimeDateFmt(minutes)
		seconds = setTimeDateFmt(seconds)

		let orderCode = now.getFullYear().toString() + month.toString() + day.toString() + hour.toString() + minutes.toString() + seconds.toString() + (Math.round(Math.random() * 1000000)).toString()
		return orderCode
	}

	let goodsName = []
	let goodsPrice = 0
	let goodsNum = 0
	// 订单号
	let orderId = randomNumber()

	goodsArr.forEach(v => {
		goodsName.push(v.goods_name)
		goodsPrice += v.goods_price * v.goods_num
		goodsNum += parseInt(v.goods_num)
	});

	//查询用户
	connection.query(`select * from user where tel = "${tokenObj.tel}"`, function (error, results) {
		//用户id
		let uId = results[0].id;
		connection.query(`insert into store_order (order_id, goods_name, goods_price, goods_num, order_status, uid) values ("${orderId}", '${goodsName}', '${goodsPrice}', '${goodsNum}', '1', ${uId})`, function (err, result) {
			// 返回订单号
			connection.query(`select * from store_order where uid = ${uId} and order_id = '${orderId}'`, function (e, r) {
				res.send({
					data: {
						code: 200,
						success: true,
						data: r
					}
				})
			})
		})
	})
})

// 删除收获地址
router.post("/api/deleteAddress", function (req, res, next) {
	let id = req.body.id
	connection.query(`delete from address where id = ${id}`, function (error, results) {
		res.send({
			data: {
				code: 200,
				success: true,
				msg: '删除成功'
			}
		})
	})
})

// 修改收货地址
router.post('/api/updateAddress', function (req, res, next) {
	//token
	let token = req.headers.token;
	let tokenObj = jwt.decode(token);
	//拿到前端给后端传入的数据
	let body = req.body;
	let [id, name, tel, province, city, county, addressDetail, isDefault, areaCode] = [
		body.id,
		body.name,
		body.tel,
		body.province,
		body.city,
		body.county,
		body.addressDetail,
		body.isDefault,
		body.areaCode
	];
	//查询用户
	connection.query(`select * from user where tel = "${tokenObj.tel}"`, function (error, results) {
		//用户id
		let uId = results[0].id;
		//对应查询到0 或者 1 有没有默认收货地址
		connection.query(`select * from address where uid = ${uId} and isDefault = ${isDefault}`, function (err, result) {
			if (result.length > 0) {
				let addressId = result[0].id;
				connection.query(`update address isDefault = replace(isDefault,'1','0') where id = ${addressId}`, function (e, r) {
					let updateSql = `update address set uId = ? , name = ? , tel = ? , province = ? , city = ? ,county = ? , addressDetail = ? , isDefault = ? , areaCode = ? where id = ${id}`;
					connection.query(updateSql, [uId, name, tel, province, city, county, addressDetail, isDefault, areaCode], function (errors, datas) {
						res.send({
							data: {
								code: 200,
								success: true,
								msg: '修改成功'
							}
						})
					})
				})
			} else {
				let updateSql = `update address set uid = ? , name = ? , tel = ? , province = ? , city = ? ,county = ? , addressDetail = ? , isDefault = ? , areaCode = ? where id = ${id}`;
				connection.query(updateSql, [uId, name, tel, province, city, county, addressDetail, isDefault, areaCode], function (errors, datas) {
					res.send({
						data: {
							code: 200,
							success: true,
							msg: '修改成功'
						}
					})
				})
			}
		})
	})
})

// 查询收货地址
router.post("/api/selectAddress", function (req, res, next) {
	let token = req.headers.token
	let tokenObj = jwt.decode(token);

	// 查询用户是否存在
	connection.query(`select * from user where tel = "${tokenObj.tel}"`, function (error, results) {
		// 用户id
		let uId = results[0].id

		connection.query(`select * from address where uid = ${uId}`, function (err, result) {
			res.send({
				data: {
					code: 200,
					success: true,
					msg: '查询成功',
					data: result
				}
			})
		})

	})
})

// 新增收货地址
router.post("/api/addAddress", function (req, res, next) {

	let token = req.headers.token
	let tokenObj = jwt.decode(token);

	let body = req.body
	let [name, tel, province, city, county, addressDetail, isDefault, areaCode] = [
		body.name,
		body.tel,
		body.province,
		body.city,
		body.county,
		body.addressDetail,
		body.isDefault,
		body.areaCode
	]

	// 查询用户是否存在
	connection.query(`select * from user where tel = "${tokenObj.tel}"`, function (error, results) {
		// 用户id
		let uId = results[0].id
		if (isDefault != 1) {
			// 新增一条收货地址
			connection.query(`insert into address (uid, name, tel, province, city, county, addressDetail, isDefault, areaCode) values (${uId}, "${name}", "${tel}", "${province}", "${city}", "${county}", "${addressDetail}", "${isDefault}", "${areaCode}")`, function (err, result) {
				res.send({
					data: {
						code: 200,
						success: true,
						msg: '收货地址添加成功'
					}
				})
			})
		} else {
			connection.query(`select * from address where uid = ${uId} and isDefault = "${isDefault}"`, function (err, result) {
				if (result.length > 0) {
					let addressId = result[0].id
					connection.query(`update address set isDefault = replace(isDefault, '1', '0') where id = ${addressId}`, function () {
						// 新增一条收货地址
						connection.query(`insert into address (uid, name, tel, province, city, county, addressDetail, isDefault, areaCode) values (${uId}, "${name}", "${tel}", "${province}", "${city}", "${county}", "${addressDetail}", "${isDefault}", "${areaCode}")`, function (err, result) {
							res.send({
								data: {
									code: 200,
									success: true,
									msg: '收货地址添加成功'
								}
							})
						})
					})
				} else {
					connection.query(`insert into address (uid,name,tel,province,city,county,addressDetail,isDefault,areaCode) values (${uId},"${name}","${tel}","${province}","${city}","${county}","${addressDetail}","${isDefault}","${areaCode}")`, function (err, result) {
						res.send({
							data: {
								code: 200,
								success: true,
								msg: '收货地址添加成功'
							}
						})
					})
				}
			})
		}
	})
})

// 修改购物车的数量
router.post("/api/updateNum", function (req, res, next) {
	let id = req.body.id
	let changeNum = req.body.num

	connection.query(`select * from goods_cart where id = ${id}`, function (error, results) {
		let num = results[0].goods_num
		connection.query(`update goods_cart set goods_num = replace(goods_num, ${num}, ${changeNum}) where id = ${id}`, function (err, result) {
			res.send({
				data: {
					code: 200,
					success: true
				}
			})
		})
	})

})

// 删除购物车数据
router.post("/api/delectCart", function (req, res, next) {
	let arrId = req.body.arrId
	for (let i = 0; i < arrId.length; i++) {
		connection.query(`delete from goods_cart where id = ${arrId[i]}`, function (error, results) {
			res.send({
				data: {
					code: 200,
					success: true,
					msg: '删除成功'
				}
			})
		})
	}
})

// 查询购物车数据
router.post("/api/selectCart", function (req, res, next) {
	let token = req.headers.token
	let tokenObj = jwt.decode(token);
	// 查询用户是否存在
	connection.query(`select * from user where tel = "${tokenObj.tel}"`, function (error, results) {
		// 用户id
		let uId = results[0].id
		// 查询购物车
		connection.query(`select * from goods_cart where uid = ${uId}`, function (err, result) {
			res.send({
				data: {
					code: 200,
					success: true,
					data: result
				}
			})
		})
	})
})

// 添加购物车数据
router.post('/api/addCart', function (req, res, next) {
	let goodsId = req.body.goodsId
	let token = req.headers.token
	let tokenObj = jwt.decode(token);

	// 如果执行，就说明token过期了
	// if (getTimeToken(tokenObj.exp)) {
	// 	res.send({
	// 		data: {
	// 			code: 1000
	// 		}
	// 	})
	// }

	// 查询用户是否存在
	connection.query(`select * from user where tel = "${tokenObj.tel}"`, function (error, results) {
		// 用户id
		let uId = results[0].id
		// 查询商品
		connection.query(`select * from goods where id = ${goodsId}`, function (err, result) {
			let goodsName = result[0].name
			let goodsPrice = result[0].price
			let goodsImgUrl = result[0].imgUrl

			// 查询当前用户在之前是否添加过本商品
			connection.query(`select * from goods_cart where uid = ${uId} and goods_id = ${goodsId}`, function (e, r) {
				// 用户之前添加过商品
				if (r.length > 0) {
					let num = r[0].goods_num
					connection.query(`update goods_cart set goods_num = replace(goods_num, ${num}, ${parseInt(num) + 1}) where id = ${r[0].id}`, function (e1, r1) {
						if (e1) throw e1
						res.send({
							data: {
								code: 200,
								success: true,
								msg: "添加成功"
							}
						})
					})
				} else {
					// 添加数据
					connection.query(`insert into goods_cart (uid, goods_id, goods_name, goods_price, goods_num, goods_imgUrl) values ("${uId}", "${goodsId}", "${goodsName}", "${goodsPrice}", "1", "${goodsImgUrl}")`, function (e, r) {
						res.send({
							data: {
								code: 200,
								success: true,
								msg: "添加成功"
							}
						})
					})
				}
			})
		})
	})
})

// 修改密码
router.post('/api/recovery', function (req, res, next) {

	let params = {
		userTel: req.body.phone,
		userPwd: req.body.pwd
	}
	// 查询用户是否存在
	connection.query(user.queryUserTel(params), function (error, results) {
		let id = results[0].id
		let pwd = results[0].pwd
		// update '表名()' set 要修改字段名 = replace (要修改字段名,'被替换的特定字符','替换成的字符')
		connection.query(`update user set pwd = replace(pwd, "${pwd}", "${params.userPwd}") where id = ${id}`, function (err, result) {
			res.send({
				code: 200,
				data: {
					success: true,
					msg: '修改成功'
				}
			})
		})
	})
})

// 查询用户是否存在
router.post('/api/selectUser', function (req, res, next) {

	let params = {
		userTel: req.body.phone
	}
	// 查询用户是否存在
	connection.query(user.queryUserTel(params), function (error, results) {
		if (error) throw error
		if (results.length > 0) {
			res.send({
				code: 200,
				data: {
					success: true
				}
			})
		} else {
			res.send({
				code: 0,
				data: {
					success: false,
					msg: '此用户不存在'
				}
			})
		}
	})
})

// 注册
router.post('/api/register', function (req, res, next) {
	let params = {
		userTel: req.body.phone,
		pwd: req.body.pwd
	}
	// 查询用户是否存在
	connection.query(user.queryUserTel(params), function (error, results) {
		// if (error) throw error
		if (results.length > 0) {
			res.send({
				code: 200,
				data: {
					success: true,
					msg: '注册成功',
					data: results[0]
				}
			})
		} else {
			// 不存在，就添加一条用户数据
			connection.query(user.insertData(params), function (err, result) {
				connection.query(user.queryUserTel(params), function (e, r) {
					res.send({
						code: 200,
						data: {
							success: true,
							msg: '注册成功',
							data: r[0]
						}
					})
				})
			})
		}
	})
})

// 添加用户
router.post("/api/addUser", function (req, res, next) {
	let params = {
		uesrTel: req.body.phone
	}
	// console.log(params, '1')
	// 查询用户是否存在
	connection.query(user.queryUserTel(params), function (error, results) {
		// if (error) throw error
		if (results.length > 0) {
			res.send({
				code: 200,
				data: {
					success: true,
					msg: '登录成功',
					data: results[0]
				}
			})
		} else {
			// 不存在，就添加一条用户数据
			connection.query(user.insertData(params), function (err, result) {
				connection.query(user.queryUserTel(params), function (e, r) {
					res.send({
						code: 200,
						data: {
							success: true,
							msg: '登录成功',
							data: r[0]
						}
					})
				})
			})
		}
	})
})

// 发送短信验证码
router.post('/api/code', function (req, res, next) {

	let tel = req.body.phone;

	// 短信应用SDK AppID
	var appid = 1400187558;  // SDK AppID是1400开头

	// 短信应用SDK AppKey
	var appkey = "dc9dc3391896235ddc2325685047edc7";

	// 需要发送短信的手机号码
	var phoneNumbers = [tel];

	// 短信模板ID，需要在短信应用中申请
	var templateId = 285590;  // NOTE: 这里的模板ID`7839`只是一个示例，真实的模板ID需要在短信控制台中申请

	// 签名
	var smsSign = "三人行慕课";  // NOTE: 这里的签名只是示例，请使用真实的已申请的签名, 签名参数使用的是`签名内容`，而不是`签名ID`

	// 实例化QcloudSms
	var qcloudsms = QcloudSms(appid, appkey);

	// 设置请求回调处理, 这里只是演示，用户需要自定义相应处理回调
	function callback(err, ress, resData) {
		if (err) {
			console.log("err: ", err);
		} else {
			res.send({
				code: 200,
				data: {
					success: true,
					data: ress.req.body.params[0]
				}
			})
		}
	}

	var ssender = qcloudsms.SmsSingleSender();
	//这个变量：params 就是往手机上，发送的短信
	var params = [Math.floor(Math.random() * (9999 - 1000)) + 1000];
	ssender.sendWithParam(86, phoneNumbers[0], templateId,
		params, smsSign, "", "", callback);  // 签名参数不能为空串

})

// 登录接口
router.post("/api/login", function (req, res, next) {
	// 后端要接口前端传过来的值
	let params = {
		userTel: req.body.userTel,
		userPwd: req.body.userPwd
	}

	let userTel = params.userTel
	// console.log(userTel, '2')
	let userPwd = params.pwd || '666666'

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

	connection.query(user.queryUserTel(params), function (error, results) {
		// if (error) throw error
		if (results.length > 0) {
			let id = results[0].id
			// 电话号码存在
			connection.query(user.queryUserPwd(params), function (err, result) {
				// if (err) throw err
				if (result.length > 0) {
					connection.query(`update user set token = "${token}" where id = ${id}`, function () {
						// 密码存在
						res.send({
							code: 200,
							data: {
								success: true,
								msg: '登录成功',
								data: result[0]
							}
						})
					})
				} else {
					// 密码不存在
					res.send({
						code: 302,
						data: {
							success: false,
							msg: '密码不对'
						}
					})
				}
			})
		} else {
			// 手机号不存在
			res.send({
				code: 301,
				data: {
					success: false,
					msg: '手机号不对'
				}
			})
		}
	})
})

// 查询商品id的数据
router.get("/api/goods/id", function (req, res, next) {
	let id = req.query.id
	connection.query("select * from goods where id=" + id + ';', function (error, results) {
		// if (error) throw error
		res.json({
			code: 0,
			data: results[0]
		})
	})
})

// 分类的数据接口
router.get('/api/goods/list', function (req, res, next) {
	res.send({
		code: 0,
		data: [
			{
				//一级
				id: 0,
				name: 'nova系列',
				data: [
					{
						//二级
						id: 0,
						name: 'nova系列',
						list: [
							//三级
							{
								id: 0,
								name: 'nova 10 SE',
								imgUrl: '/images1/nova1.jpg'
							},
							{
								id: 1,
								name: 'nova 10',
								imgUrl: '/images1/nova2.jpg'
							},
							{
								id: 3,
								name: 'nova 10 Pro',
								imgUrl: '/images1/nova3.jpg'
							},
							{
								id: 4,
								name: 'nova 10z',
								imgUrl: '/images1/nova4.jpg'
							},
							{
								id: 5,
								name: 'nova 9 SE',
								imgUrl: '/images1/nova5.jpg'
							},
						]
					}
				]
			},
			{
				//一级
				id: 1,
				name: 'Mate系列',
				data: [
					{
						//二级
						id: 0,
						name: 'Mate系列',
						list: [
							//三级
							{
								id: 0,
								name: 'HUAWEI Mate 50 Pro',
								imgUrl: '/images1/mate1.jpg'
							},
							{
								id: 1,
								name: 'HUAWEI Mate 50',
								imgUrl: '/images1/mate2.jpg'
							},
							{
								id: 3,
								name: 'HUAWEI Mate Xs 2',
								imgUrl: '/images1/mate3.jpg'
							},
							{
								id: 4,
								name: 'HUAWEI Mate 50 RS 保时捷设计',
								imgUrl: '/images1/mate4.jpg'
							},
							{
								id: 5,
								name: 'HUAWEI Mate 50E',
								imgUrl: '/images1/mate5.jpg'
							}
						]
					}
				]
			},
			{
				//一级
				id: 2,
				name: 'MateBook系列',
				data: [
					{
						//二级
						id: 0,
						name: 'MateBook系列',
						list: [
							//三级
							{
								id: 0,
								name: 'HUAWEI MateBook 14s 12代',
								imgUrl: '/images1/matebook1.jpg'
							},
							{
								id: 1,
								name: 'HUAWEI MateBook 14',
								imgUrl: '/images1/matebook2.jpg'
							},
							{
								id: 3,
								name: 'HUAWEI MateBook 16/16s',
								imgUrl: '/images1/matebook3.jpg'
							},
							{
								id: 4,
								name: 'HUAWEI MateBook 13/13s',
								imgUrl: '/images1/matebook4.jpg'
							}
						]
					}
				]
			},
			{
				//一级
				id: 3,
				name: '台式机',
				data: [
					{
						//二级
						id: 0,
						name: '台式机',
						list: [
							//三级
							{
								id: 0,
								name: 'HUAWEI MateStation X 2023款',
								imgUrl: '/images1/tsj1.jpg'
							},
							{
								id: 1,
								name: 'HUAWEI MateStation S',
								imgUrl: '/images1/tsj2.jpg'
							},
							{
								id: 3,
								name: 'HUAWEI MateView SE',
								imgUrl: '/images1/tsj3.jpg'
							},
							{
								id: 4,
								name: 'HUAWEI MateView GT 27英寸',
								imgUrl: '/images1/tsj4.jpg'
							},
							{
								id: 5,
								name: 'HUAWEI MateStation S 12代酷睿',
								imgUrl: '/images1/tsj5.jpg'
							},
							{
								id: 6,
								name: 'HUAWEI MateView',
								imgUrl: '/images1/tsj6.jpg'
							},
							{
								id: 6,
								name: 'HUAWEI MateView GT 34英寸',
								imgUrl: '/images1/tsj7.jpg'
							},
						]
					}
				]
			},
			{
				//一级
				id: 4,
				name: 'MatePad Pro 系列',
				data: [
					{
						//二级
						id: 0,
						name: 'MatePad Pro 系列',
						list: [
							//三级
							{
								id: 0,
								name: 'HUAWEI MatePad Pro 12.6英寸 2022',
								imgUrl: '/images1/matepad1.jpg'
							},
							{
								id: 1,
								name: 'HUAWEI MatePad Pro 11英寸 2022',
								imgUrl: '/images1/matepad2.jpg'
							},
							{
								id: 3,
								name: 'HUAWEI MatePad Pro 10.8英寸',
								imgUrl: '/images1/matepad3.jpg'
							},
							{
								id: 4,
								name: 'HUAWEI MatePad Pro 12.6英寸',
								imgUrl: '/images1/matepad4.jpg'
							},
						]
					}
				]
			},
			{
				//一级
				id: 5,
				name: '华为 Vision 智慧屏',
				data: [
					{
						//二级
						id: 0,
						name: '华为 Vision 智慧屏',
						list: [
							//三级
							{
								id: 0,
								name: '华为 Vision 智慧屏 电竞版',
								imgUrl: '/images1/vision1.jpg'
							},
							{
								id: 1,
								name: '华为Vision智慧屏 86/75/65 英寸',
								imgUrl: '/images1/vision2.jpg'
							}
						]
					}
				]
			}
		]
	})
})

// 查询商品的数据接口
router.get('/api/goods/shopList', function (req, res, next) {
	// 前端给后端的数据
	let [searchName, orderName] = Object.keys(req.query);
	let [name, order] = Object.values(req.query);

	// console.log(req.query)

	connection.query('select * from goods where name like "%' + name + '%" order by ' + orderName + ' ' + order + '', function (error, results) {
		res.send({
			code: 0,
			data: results
		})
	})
})

// 大红袍的数据
router.get("/api/index_list/1/data/1", function (req, res, next) {
	res.send({
		code: 0,
		data: [
			{
				id: 1,
				type: 'adList',
				data: [
					{
						id: 1,
						imgUrl: '/images1/shouji.jpg'
					}
				]
			},
			{
				id: 2,
				type: 'likeList',
				data: [
					{
						id: 1,
						imgUrl: '/images1/like1.jpg',
						name: 'HUAWEI Mate 50 Pro',
						price: 6799
					},
					{
						id: 2,
						imgUrl: '/images1/like2.jpg',
						name: 'HUAWEI P50 Pro',
						price: 4988
					},
					{
						id: 3,
						imgUrl: '/images1/like3.jpg',
						name: 'nova 10',
						price: 2499
					},
					{
						id: 4,
						imgUrl: '/images1/like4.jpg',
						name: 'nova 10 SE',
						price: 1949
					},
				]
			},
		]
	})
})

// 铁观音的数据
router.get("/api/index_list/2/data/1", function (req, res, next) {
	res.send({
		code: 0,
		data: [
			{
				id: 1,
				type: 'adList',
				data: [
					{
						id: 1,
						imgUrl: '/images1/diannao.jpg'
					}
				]
			},
			{
				id: 2,
				type: 'likeList',
				data: [
					{
						id: 1,
						imgUrl: '/images1/diannao1.jpg',
						name: 'HUAWEI MateBook 16/16s',
						price: 8499
					},
					{
						id: 2,
						imgUrl: '/images1/diannao2.jpg',
						name: 'HUAWEI MateBook 14',
						price: 5399
					},
					{
						id: 3,
						imgUrl: '/images1/diannao3.jpg',
						name: 'HUAWEI MateBook X Pro',
						price: 9999
					},
					{
						id: 4,
						imgUrl: '/images1/diannao4.jpg',
						name: 'HUAWEI MateBook D 14/D 14 SE',
						price: 3999
					},
					
				]
			},
		]
	})
})

// 首页推荐的数据
router.get('/api/index_list/0/data/1', function (req, res, next) {
	res.send({
		code: 0,
		data: {
			topBar: [
				{ id: 0, label: '推荐' },
				{ id: 1, label: '手机' },
				{ id: 2, label: '电脑' },
				{ id: 3, label: '平板' },
				{ id: 4, label: '耳机' },
				{ id: 5, label: '手表' },
				{ id: 6, label: '手环' },
			],
			data: [
				// 这是swiper
				{
					id: 0,
					type: 'swiperList',
					data: [
						{ id: 0, imgUrl: '/images1/lunbo1.jpg' },
						{ id: 1, imgUrl: '/images1/lunbo2.jpg' },
						{ id: 2, imgUrl: '/images1/lunbo3.jpg' },
						{ id: 3, imgUrl: '/images1/lunbo4.jpg' },
					]
				},
				// 这是icons
				{
					id: 1,
					type: 'iconsList',
					data: [
						{
							id: 1,
							title: '自饮茶',
							imgUrl: './images/icons1.png'
						},
						{
							id: 2,
							title: '茶具',
							imgUrl: './images/icons2.png'
						},
						{
							id: 3,
							title: '茶礼盒',
							imgUrl: './images/icons3.png'
						},
						{
							id: 4,
							title: '领福利',
							imgUrl: './images/icons4.png'
						},
						{
							id: 5,
							title: '官方验证',
							imgUrl: './images/icons5.png'
						}
					]
				},
				// 这是爆款推荐
				{
					id: 2,
					type: 'recommendList',
					data: [
						{
							id: 1,
							name: 'HUAWEI Mate 50',
							content: '最高省200 | 12期0分期利息',
							price: '4799',
							imgUrl: '/images1/baokuan1.jpg'
						},
						{
							id: 2,
							name: 'HUAWEI MateBook 16s',
							content: '限时最高省1500元 | 12期享0分期利息',
							price: '8499',
							imgUrl: '/images1/baokuan2.jpg'
						},
						{
							id: 3,
							name: 'MatePad Pro 11英寸',
							content: '限时优惠300元 | 享12期0分期利息',
							price: '3199',
							imgUrl: '/images1/baokuan3.jpg'
						},
					]
				},
				// 这是猜你喜欢
				{
					id: 3,
					type: 'likeList',
					data: [
						{
							id: 1,
							imgUrl: '/images1/like1.jpg',
							name: 'HUAWEI Mate 50 Pro',
							price: 6799
						},
						{
							id: 2,
							imgUrl: '/images1/like2.jpg',
							name: 'HUAWEI P50 Pro',
							price: 4988
						},
						{
							id: 3,
							imgUrl: '/images1/like3.jpg',
							name: 'nova 10',
							price: 2499
						},
						{
							id: 4,
							imgUrl: '/images1/like4.jpg',
							name: 'nova 10 SE',
							price: 1949
						},
						{
							id: 5,
							imgUrl: '/images1/like5.jpg',
							name: 'MateBook D 14 SE',
							price: 3999
						},
						{
							id: 6,
							imgUrl: '/images1/like6.jpg',
							name: 'MateBook X Pro',
							price: 9999
						},
						{
							id: 7,
							imgUrl: './images1/like7.jpg',
							name: 'MateBook E Go',
							price: 5199
						},
						{
							id: 8,
							imgUrl: '/images1/like8.jpg',
							name: 'MatePad SE 10.4英寸',
							price: 1199
						},
					]
				},
			]
		}
	})
});

module.exports = router;
