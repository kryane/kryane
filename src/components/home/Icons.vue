<template>
	<ul class="icons">
		<li
			v-for="(item, index) in IconsList"
			:key="index"
		>
			<img :src="item.imgUrl" alt="">
			<span>{{ item.title }}</span>
		</li>
	</ul>
</template>

<script>
export default {
	name: "Icons",
	props:{
		IconsList:Array
	},
}
</script>

<style>
	.icons{
		display: flex;
		justify-content: space-around;
		/* 上下15px 左右0 */
		padding: 15px 0;
	}
	
	.icons li{
		/* 弹性布局 */
		display: flex;
		/* 上下布局 */
		flex-direction: column;
		/* 垂直居中 */
		align-items: center;
	}
	
	.icons img{
		width: 38px;
		height: 38px;
	}
	
	.icons span{
		padding: 6px 0;
		font-size: 16px;
	}
</style>