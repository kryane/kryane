<template>
	<div class="login container">
		<Header></Header>
		<section>
			<div class="login-tel">
				<input 
					type="text" 
					v-model="userTel" 
					@click="selectValue($event)"
					placeholder="请输入手机号" 
					pattern="[0-9]*"
				>
			</div>
			<div class="login-code">
				<input 
					type="text" 
					v-model="userCode" 
					@click="selectValue($event)"
					placeholder="请输入短信验证码" 
					pattern="[0-9]*"
				>
				<button 
					:disabled="disabled"
					@click="sendCode"
				>{{ codeMsg }}</button>
			</div>
			<div class="login-btn" @click='login'>登  录</div>
			<div class="tab">
				<span @click="gouserLogin">密码登录</span>
				<span @click="goRegister">快速注册</span>
			</div>
		</section>
		<Tabbar></Tabbar>
	</div>
</template>

<script>
import Tabbar from '@/components/common/Tabbar.vue'
import Header from './Header.vue'
import { Toast } from 'mint-ui'
import { mapMutations } from 'vuex'
import http from '@/common/api/request'
export default{
	data(){
		return {
			codeMsg: '获取短信验证码',
			disabled: false,
			userTel: '',
			userCode:'',
			rules:{
				// 手机号验证
				userTel: {
					rule: /^1[23456789]\d{9}$/,
					msg: '手机号不能为空，并且是11位有效数字'
				}
			},
			codeNum: 6,
			code: ''
		}
	},
	components:{
		Tabbar,
		Header
	},
	methods:{
		...mapMutations(['USER_LOGIN']),
		gouserLogin(){
			this.$router.push("/userLogin")
			this.userTel = ''
			this.userCode = ''
		},
		// 点击获取短信验证码
		sendCode(){
			if (!this.validate("userTel")) return;
			
			http.$axios({
				url:'/api/code',
				method:'POST',
				data:{
					phone:this.userTel
				}
			}).then(res=>{
				if( res.success ){
					this.code = res.data;
				}
			})
			
			this.disabled = true
			
			let timer = setInterval(() => {
				--this.codeNum
				this.codeMsg = `${this.codeNum}s后重新发送`
			}, 1000)
			setTimeout(() => {
				clearInterval(timer)
				this.codeNum = 6
				this.disabled = false
				this.codeMsg = '获取短信验证码'
			}, 6000)
		},
		// 验证信息提示
		validate(key){
			let bool = true
			if (!this.rules[key].rule.test(this[key])){
				Toast(this.rules[key].msg)
				bool = false
				return false
			}return bool
		},
		// 点击登录
		login(){
			// 如果验证码和用户输入的验证码相等时，就发送添加用户的请求
			if (this.code == this.userCode) {
				// console.log(this.userTel)
				http.$axios({
					url:'/api/addUser',
					method:'POST',
					data:{
						phone:this.userTel
					}
				}).then(res=>{
					if( !res.success ) return;
					// console.log( res );
					this.USER_LOGIN(res.data)
					this.$router.push('/my')
				})
			}
		},
		// 使input在vue里可以双击全选
		selectValue(e){
			e.currentTarget.select();
		},
		// 跳转注册页面
		goRegister(){
			this.$router.push('/register')
		}
	}
}
	
</script>

<style scoped lang="scss">
	section{
		display: flex;
		flex-direction: column;
		align-items: center;
		font-size: 12px;
		background-color: #f5f5f5;
		
		div{
			margin: 10px 0;
			height: 44px;
			width: 335px;
		}
		
		.login-tel{
			margin-top: 30px;
			input{
				width: 335px;
			}
		}
		
		input{
			// 如果你将一个元素的 width 设为 100px，那么这 100px 会包含它的 border 和 padding，内容区的实际宽度是 width 减去 (border + padding) 的值。
			box-sizing: border-box;
			border-radius: 6px;
			padding: 0 10px;
			border: 1px solid #ccc;
			line-height: 44px;
			background-color: #FFFFFF;
		}
		
		.login-code{
			display: flex;
			input{
				flex: 1;
				margin-right: 10px;
			}
			
			button{
				padding: 0 20px;
				line-height: 44px;
				color: #fff;
				background-color: #b0352f;
				// 取消默认样式
				border: 0;
				border-radius: 6px;
			}
		}
		
		.login-btn{
			line-height: 44px;
			color: #fff;
			text-align: center;
			background-color: #b0352f;
			font-size: 18px;
			border-radius: 6px;
		}
		
		.tab{
			display: flex;
			justify-content: space-between;
			font-size: 16px;
		}
	}
</style>