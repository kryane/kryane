<template>
	<div class="login container">
		<Header>
			<span>找回密码</span>
		</Header>
		<section>
			<div class="login-tel">
				<input 
					type="text" 
					v-model="userPwd"
					@click="selectValue($event)"
					placeholder="请确认新的密码" 
				>
			</div>
			<div class="login-btn" @click="submitBtn">确认</div>
		</section>
		<Tabbar></Tabbar>
	</div>
</template>

<script>
import Tabbar from '@/components/common/Tabbar.vue'
import Header from '@/views/login/Header.vue'
import { Toast } from 'mint-ui'
import http from '@/common/api/request'
export default{
	data(){
		return {
			userPwd: '',
			rules:{
				// 密码验证
				userTel: {
					rule: /^\w{6,12}$/,
					msg: '密码不能为空，并且是6到12位有效数字'
				}
			},
		}
	},
	components:{
		Tabbar,
		Header
	},
	methods:{
		submitBtn(){
			if (!this.validate("userPwd")) return;
			// 修改密码
			http.$axios({
				url:'/api/recovery',
				method:'POST',
				data:{
					phone: this.$route.query.phone,
					userPwd:this.userPwd
				}
			}).then(res=>{
				Toast("修改成功")
				// 如果修改密码成功，则跳转到登录页面
				if( res.success ){
					this.$router.push({
						path: '/login'
					})
				}
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
	}
}
	
</script>

<style scoped lang="scss">
	section{
		display: flex;
		flex-direction: column;
		align-items: center;
		font-size: 14px;
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
			border-radius: 6px;
		}
		
		
	}
</style>