import axios from 'axios'
import store from '@/store/index.js'
import router from '@/router'
import {
	Indicator
} from 'mint-ui'

// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

export default {
	common: {
		data: {},
		params: {},
		method: "GET",
		headers: {}
	},

	$axios(options = {}) {
		// method首先赋给传过来的method，其次再是设置的common的method
		options.method = options.method || this.common.method
		options.data = options.data || this.common.data
		options.params = options.params || this.common.params
		options.headers = options.headers || this.common.headers
		// 请求前显示加载中
		Indicator.open({
			text: "加载中...."
		})
		
		// 判断是否是登录状态
		if (options.headers.token) {
			options.headers.token = store.state.user.token
			if (!options.headers.token) {
				router.push('/login')
			}
		}

		return axios(options).then(v => {
			let data = v.data.data
			// 如果token过期，那么就重新登录
			if (data.code == 1000){
				Indicator.close()
				return router.push("/login")
			}
			return new Promise((res, rej) => {
				if (!v) {
					return rej()
				}
				setTimeout(() => {
					Indicator.close()
				}, 500)
				res(data)
			})
		})
	}
}
