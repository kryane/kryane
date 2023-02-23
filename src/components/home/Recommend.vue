<template>
	<div class="recommend">
		<Card></Card>
		<ul>
			<li
				v-for="(item,index) in recommendList"
				:key="index"	
			>
				<h2>
					<img :src="item.imgUrl" alt="">
				</h2>
				<div>
					<h3>{{ item.name }}</h3>
					<p>{{ item.content }}</p>
					<div class="price">
						<span>￥</span>
						<b>{{ item.price }}</b>
					</div>
				</div>
			</li>
		</ul>
	</div>
</template>

<script>
import Card from "@/components/home/Card.vue"
export default {
	name: 'Recommend',
	props:{
		recommendList:Array
	},
	components:{
		Card
	}
}
</script>

<style scoped lang="scss">
	// .recommend ul li{
	// 	position: relative;
	// }
	
	// .recommend ul li h2{
	// 	/* 文本居中对齐 */
	// 	/* text-align: center; */
	// }
	
	// .recommend ul li img{
	// 	width: 200px;
	// 	height: 72px;
	// 	border-radius: 12px;
	// }
	
	// .recommend ul li > div{
	// 	/* 绝对定位 */
	// 	position: absolute;
	// 	top: 0;
	// 	right: 0;
	// 	display: flex;
	// 	flex-direction: column;
	// 	padding:20px;
	// }
	
	// .recommend ul li > div h3{
	// 	font-size: 12px;
	// }
	
	// .recommend ul li > div p{
	// 	overflow: hidden;
	// 	padding: 0 10px;
	// 	font-size: 16px;
	// }
	
	// .price{
	// 	margin-top: 25px;
	// 	text-align: right;
	// 	color:red;
	// }
	
	// .price span{
	// 	font-size: 14px;
	// }

	ul{
		
		
		li{
			display: flex;
			justify-content: space-between;
			
			h2{
				
				img{
					padding: 10px 15px;
					font-size: 16px;
					width: 100px;
					height: 100px;
				}
			}
			
			div{
				padding: 10px;
				width: 100%;
				h3{
					padding: 10px 0;
					font-size: 16px;
				}

				p{
					overflow: hidden;
					font-size: 14px;
				}

				.price{
					
					span{
						font-size: 12px;
						padding: 0 3px;
					}

					b{
						font-size: 18px;
						color: #b0352f;
					}
				}
			}
		}
	}
</style>