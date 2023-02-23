<template>
	<header>
		<h1>
			<img src="/images1/华为.png" alt="">
		</h1>
		<div class='search' @click="goSearch">
			<i class='iconfont icon-fangdajing'></i>
			<span>搜您喜欢的...</span>
		</div>
		<div class='kefu'>
			<i class='iconfont icon-kefu'></i>
		</div>
	</header>
</template>

<script>
export default{
	name:"Header",
	methods:{
		goSearch(){
			this.$router.push("/search")
		}
	}
}
</script>

<style scoped>
header{
	display: flex;
	justify-content: space-around;
	align-items: center;
	width: 100%;
	height: 60px;
	background-color: #b0352f;
}
header h1{
	/* padding:0 0.266666rem; */
	/* width:3.2rem; */
	height: 1.333333rem;
}
header h1 img{
	width: 45px;
	height: 45px;
}
.search{
	display: flex;
	align-items: center;
	width: 260px;
	height: 30px;
	background-color: #FFFFFF;
	border-radius: 12px;
}
.search i {
	padding:0 0.16rem;
	color:#ccc;
}
.search span{
	font-size:0.373333rem;
	color:#ccc;
}
.kefu i{
	font-size:0.96rem;
	color:#fff;
}

</style>