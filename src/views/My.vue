<template>
	<div class="my">
		<header>
			<div class="user-Info" v-if="loginStatue">
				<img :src="userInfo.imgUrl" alt="">
				<span>{{ userInfo.nickName }}</span>
			</div>
			<div v-else class="login" @click="goLogin">登录/注册</div>
		</header>
		<section>
			<ul>
				<li @click="goPath">地址管理</li>
				<li v-if="loginStatue" @click="login_out">退出登录</li>
			</ul>
		</section>
		<Tabbar />
	</div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import Tabbar from '@/components/common/Tabbar.vue'
export default {
	name: "My",
	components: {
		Tabbar
	},
	computed: {
		...mapState({
			loginStatue: state => state.user.loginStatue,
			userInfo: state => state.user.userInfo
		})
	},
	methods: {
		login_out(){
			this.$messagebox({
				title: '温馨提示',
				message: '请确认是否要退出登录',
				showCancelButton: true,
				confirmButtonText: "确定",
				cancelButtonText: "取消"
			}).then(action => {
				if (action == 'confirm') {
					//确认回调
					this.loginOut()
				} else {
					console.log('取消')
				}
			})
		},
		...mapMutations(['loginOut']),
		goLogin() {
			this.$router.push("/login")
		},
		// 跳转到地址管理
		goPath(){
			this.$router.push("/path")
		}
	}
};
</script>

<style scoped lang="scss">
	header {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 160px;
		background-color: #b0352f;
		
		.user-Info{
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			img{
				width: 66px;
				height: 66px;
				border-radius: 50%;
			}
			span{
				font-size: 18px;
				padding: 20px 0;
			}
		}

		.login {
			padding: 6px 15px;
			font-size: 15px;
			color: #fff;
			background-color: #f6ab32;
			border-radius: 6px;
		}
	}

	.my {
		display: flex;
		flex-direction: column;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
	}

	section {
		flex: 1;
		overflow: hidden;

		ul li {
			padding: 15px;
			font-size: 16px;
		}
	}
</style>
