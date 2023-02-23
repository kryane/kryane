import {
	USER_LOGIN,
	INIT_USER
} from './mutations_types.js'
export default {
	state: {
		// 登录状态
		loginStatue: false,
		// token
		token: null,
		// 用户信息：用户头像|用户昵称
		userInfo: {

		}

	},
	getters: {},
	mutations: {
		// 设置存储内容
		[USER_LOGIN](state, user) {
			state.loginStatue = true
			state.token = user.token
			state.userInfo = user
			// 持久化存储
			localStorage.setItem('teaUserInfo', JSON.stringify(user))
		},
		// 读取
		[INIT_USER](state, user) {
			let userInfo = JSON.parse(localStorage.getItem('teaUserInfo'))
			if (userInfo) {
				state.loginStatue = true
				state.token = userInfo.token
				state.userInfo = userInfo
			}
		},
		// 退出登录
		loginOut(state) {
			state.loginStatue = false
			state.token = null
			state.userInfo = {}
			localStorage.removeItem('teaUserInfo')
		},
	},
	actions: {},
	modules: {},
}
