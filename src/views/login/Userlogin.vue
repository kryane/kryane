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
			<div class="login-tel">
				<input 
					type="password" 
					v-model="userPwd" 
					@click="selectValue($event)"
					placeholder="请输入密码"
				>
			</div>
			<div class="login-btn" @click="login">登  录</div>
			<div class="tab">
				<span @click="goLogin">短信验证码登录</span>
				<span @click="goRecovery">找回密码</span>
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
			rules:{
				// 手机号验证
				userTel: {
					rule: /^1[23456789]\d{9}$/,
					msg: '手机号不能为空，并且是11位有效数字'
				},
				userPwd:{
					rule: /^\w{6,12}$/,
					msg: '密码不能为空，并且得是6到12位有效数字'
				}
			},
			userTel: '',
			userPwd: ''
		}
	},
	components:{
		Tabbar,
		Header
	},
	methods:{
		...mapMutations(['USER_LOGIN']),
		goLogin(){
			this.$router.push("/login")
			this.userTel = ''
			this.userPwd = ''
		},
		login(){
			if (!this.validate("userTel")) return;
			if (!this.validate("userPwd")) return;
			http.$axios({
				url: '/api/login',
				method:"POST",
				data: {
					userTel: this.userTel,
					userPwd: this.userPwd,
				}
			}).then(res => {
				Toast(res.msg)
				// 登录失败
				if (!res.success) return ;
				// 登录成功，跳转页面，存储用户细信息
				// console.log(res)
				this.USER_LOGIN(res.data)
				this.$router.push('/my')
			})
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
		// 使input在vue里可以双击全选
		selectValue(e){
			e.currentTarget.select();
		},
		// 跳转注册页面
		goRegister(){
			this.$router.push('/register')
		},
		// 跳转到找回密码页面
		goRecovery(){
			this.$router.push('/recovery')
		}
	}
}
	
</script>

<style scoped lang="scss">
	section{
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: #f5f5f5;
		
		div{
			margin: 10px 0;
			height: 44px;
			width: 335px;
		}
		
		.login-tel{
			margin-top: 30px;
			input{
				font-size: 12px;
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
			border-radius: 6px;
		}
		
		.tab{
			display: flex;
			justify-content: space-between;
			font-size: 16px;
		}
	}
</style>