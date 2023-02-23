<template>
	<div class="like">
		<Card>
			<span>猜你喜欢</span>
		</Card>
		<ul>
			<li v-for="(item, index) in likeList"
				:key="index"
				@click="goDetail(item.id)">
				<h2>
					<img v-lazy="item.imgUrl" alt="">
				</h2>
				<span>{{ item.name }}</span>
				<div>
					<span>￥</span>
					<b>{{ item.price }}</b>
				</div>
			</li>
		</ul>
	</div>
</template>

<script>
import Card from "@/components/home/Card.vue"
export default {
	name: "Like",
	props:{
		likeList:Array
	},
	components:{
		Card
	},
	methods:{
		goDetail(id){
			this.$router.push({
				path: "/detail",
				query:{
					id
				}
			})
		}
	}
}
</script>

<style>
	.like ul{
		display: flex;
		flex-wrap: wrap;
	}
	
	.like ul li{
		display: flex;
		/* 作为列，垂直显示 */
		flex-direction: column;
		/* 水平居中 */
		justify-content: center;
		/* 垂直居中 */
		align-items: center;
		width: 50%;
		text-align: center;
	}
	
	.like ul li > span{
		padding: 0 6px;
		width: 93%;
		font-size: 14px;
		color: #222;
		/* 隐藏溢出的元素 */
		overflow: hidden;
		/* 显示省略符号来代表被隐藏的文本 */
		text-overflow: ellipsis;
		/* 规定段落中的文本不进行换行 */
		white-space: nowrap;
	}
	
	.like ul li > div{
		text-align: left;
		width: 93%;
		padding: 0 20px;
		color:#FF0000;
	}
	
	.like ul li > div span{
		font-size: 12px;
	}
	
	.like ul li > div b{
		font-size: 16px;
		font-weight: 600;
	}
	
	.like img{
		width: 176px;
		height: 176px;
	}
</style>