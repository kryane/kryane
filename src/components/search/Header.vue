<template>
	<header>
		<div class="search-return" @click='goBack'>
			<i class="iconfont icon-fanhui"></i>
		</div>
		<div class="search-main">
			<i class="iconfont icon-fangdajing"></i>
			<form onSubmit="return false" @keyup.enter="goSearchList">
				<input type="search" placeholder="请搜索您喜欢的商品...." v-model="searchVal">
			</form>
		</div>
		<div class="search-btn" @click="goSearchList">搜索</div>
	</header>
</template>

<script>
export default{
	name:"Header",
	data() {
		return {
			searchVal: this.$route.query.key || '',
			searchArr: []
		}
	},
	methods:{
		goBack(){
			this.$router.back()
		},
		goSearchList(){
			// 如果搜索的内容是空的，则不执行
			if (!this.searchVal || !this.searchVal.trim()) return ;
			
			// console.log(this.searchVal)
			
			// 判断之前有没有搜索的本地存储
			if (!localStorage.getItem('searchList')) {
				localStorage.setItem('searchList', '[]')
			}else{
				this.searchArr = JSON.parse(localStorage.getItem("searchList"))
			}
			
			this.searchArr.unshift(this.searchVal)
			// 去重
			const obj = new Set(this.searchArr)
			// Array.from() 方法可以将对象转换成数组
			localStorage.setItem('searchList', JSON.stringify(Array.from(obj)))
			
			// 如果路径没有改变，则不进行跳转
			if( this.searchVal === this.$route.query.key ) return ;
			
			this.$router.push({
				name:"list",
				query:{
					key: this.searchVal
				}
			})
		}
	}
}
</script>

<style scoped lang="scss">
header{
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	height: 44px;
	color:#fff;
	background-color: #b0352f;
}
.search-return, .search-btn{
	padding:0 10px;
}
.search-return i{
	font-size:28px;
}
.search-main{
	display: flex;
	align-items: center;
	width: 260px;
	height: 30px;
	border-radius: 12px;
	background-color: #FFFFFF;
}
.search-main i{
	padding:0 10px;
	color:#666666;
}
.search-main form{
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	
	input{
		font-size: 16px;
		color: revert;
	}
}

.search-btn{
	font-size:16px;
}
</style>