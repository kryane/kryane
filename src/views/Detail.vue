<template>
	<div class="detail">
		<header>
			<div class="header-returns" v-show="isShow">
				<div @click="goBack">
					<i class="iconfont icon-fanhui"></i>
				</div>
				<div>
					<i class="iconfont icon-kefu"></i>
				</div>
			</div>
			<div 
				class="header-bar" 
				v-show="!isShow"
				:style="styleOption"
			>
				<div @click="goBack">
					<i class="iconfont icon-fanhui"></i>
				</div>
				<span>商品详情</span>
				<span>商品评价</span>
				<div>
					<i class="iconfont icon-kefu"></i>
				</div>
			</div>
		</header>
		
		<section ref="wrapper">
			<div>
				<div class="swiper-main">
					<swiper :options="swiperOption">
						<swiper-slide
							v-for="(item, index) in swiperList"
							:key="index"
						>
							<img :src="item.imgUrl" alt="">
						</swiper-slide>
					</swiper>
					<!-- 加上小圆点 -->
					<div class="swiper-pagination"></div>
				</div>
				<div class='goods-name'>
					<h1>{{goods.name}}</h1>
					<div>{{goods.content}}</div>
				</div>
				<div class='goods-price'>
					<div class='oprice'>
						<span>¥</span>
						<b>{{goods.price}}</b>
					</div>
					<div class='pprice'>
						<span>价格:</span>
						<del>¥{{parseInt(goods.price) + 1000}}</del>
					</div>
				</div>
				
				<div>
					<img style="width: 500px; height: 500px;" :src="goods.imgUrl" alt="">
				</div>
				<div>
					<img style="width: 500px; height: 500px;" :src="goods.imgUrl" alt="">
				</div>
				<div>
					<img style="width: 500px; height: 500px;" :src="goods.imgUrl" alt="">
				</div>
			</div>
		</section>
		
		<footer>
			<div @click="addCart" class="add-cart">加入购物车</div>
			<div>立即购买</div>
		</footer>
	</div>
</template>

<script>
// 引入swiper插件的css文件
import 'swiper/dist/css/swiper.css'
import { swiper, swiperSlide } from 'vue-awesome-swiper'
import BetterScroll from 'better-scroll'
import http from '@/common/api/request'
import { Toast } from 'mint-ui'

export default {
	components:{
		swiper,
		swiperSlide
	},
	data() {
		return {
			id: 0,
			styleOption: {},
			goods: {},
			BetterScroll: '',
			isShow: true,
			swiperOption: {
				autoplay: {
					delay: 3000,
					disableOnInteraction: false,	// 当用户滑动图片后继续自动轮播
				},
				speed: 1000,
				// 定位小圆点
				pagination: {
					el: '.swiper-pagination',
					type:'fraction'
				}
			},
			swiperList:[
				{
					imgUrl: `/images1/HUAWEI Mate 50 Pro/1.jpg`
				},
				{
					imgUrl: `/images1/HUAWEI Mate 50 Pro/2.jpg`
				},
				{
					imgUrl: `/images1/HUAWEI Mate 50 Pro/3.jpg`
				},
				{
					imgUrl: `/images1/HUAWEI Mate 50 Pro/4.jpg`
				},
				{
					imgUrl: `/images1/HUAWEI Mate 50 Pro/5.jpg`
				},
			]
		}
	},
	created() {
		this.id = this.$route.query.id
		this.getData()
	},
	activated() {
		let id = this.$route.query.id
		if (this.id != id) {
			this.getData()
			this.id = this.$route.query.id
		}
	},
	mounted() {
		// probeType + bounce 取消betterscroll的回弹效果
		this.BetterScroll = new BetterScroll(this.$refs.wrapper, {
			probeType: 3,
			bounce: false,
			click: true
		})
		this.BetterScroll.on("scroll", (pos) => {
			let posY = Math.abs(pos.y)
			let opacity = posY / 180
			
			opacity > 1 ? 1 : opacity
			
			this.styleOption = {
				opacity: opacity
			}
			
			if (posY >= 44) {
				this.isShow = false
			}else{
				this.isShow = true
			}
		})
	},
	methods:{
		goBack(){
			this.$router.back()
		},
		async getData(){
			let id = this.$route.query.id
			
			let res = await http.$axios({
				url: '/api/goods/id',
				params:{
					id
				}
			})
			
			this.goods = res
		},
		// 加入购物车
		addCart(){
			let id = this.$route.query.id
			http.$axios({
				url: '/api/addCart',
				method: "post",
				data:{
					goodsId: id
				},
				headers:{
					token: true
				}
			}).then(res => {
				Toast('添加购物车成功')
			})
		}
	}
}
</script>
	
<style scoped lang="scss">
	.detail{
		display: flex;
		flex-direction: column;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
	}
	
	section{
		flex: 1;
		overflow: hidden;
	}
	
	header{
		position: fixed;
		width: 100%;
		height: 44px;
		left: 0;
		z-index: 999;
		top: 0;
		
		.header-returns{
			display: flex;
			justify-content: space-between;
			align-items: center;
			height: 44px;
			width: 100%;
			
			div{
				margin: 0 10px;
				width: 34px;
				height: 34px;
				text-align: center;
				border-radius: 50%;
				background-color: rgba(0, 0, 0, 0.3);

				i{
					color: #fff;
					font-size: 22px;
				}
			}
		}
	}
	
	.header-bar{
		width: 100%;
		height: 44px;
		background-color: #fff;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 16px;
		
		span{
			padding: 0 10px;
		}
		
		i{
			font-size: 22px;
			padding: 0 10px;
		}
	}
	
	.swiper-main{
		position: relative;
		width: 100%;
		height:375px;
		overflow: hidden;
	}
	
	.swiper-container{
		width: 100%;
		height: 375px;
	}
	
	.swiper-main img{
		width: 100%;
		height: 375px;
	}
	
	.swiper-pagination{
		width: 100%;
		bottom: 10px;
		text-align: right;
		color: #FFFFFF;
		font-size: 16px;
	}
	
	.swiper-pagination-fraction, .swiper-pagination-custom, .swiper-container-horizontal > .swiper-pagination-bullets{
		left: -20px;
	}
	
	.goods-name{
		padding: 20px 10px;
		border-bottom:1px solid #CCCCCC;
		h1{
			font-size: 20px;
			font-weight: 500;
		}
		div{
			padding: 3px 0;
			font-size: 14px;
			color: #999999;
		}
	}
	
	.goods-price{
		padding: 20px 10px;
		.oprice{
			color:red;
			span{
				font-size: 12px;
			}
		}
		.pprice{
			color: #999999;
			font-size: 14px;
		}
	}
	
	footer{
		display: flex;
		justify-content: center;
		align-items: center;
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 49px;
		border-bottom: 1px solid #cccccc;
		background-color: #fff;
		
		div{
			width: 50%;
			line-height: 49px;
			font-size: 16px;
			text-align: center;
			color: #fff;
			background-color: red;
			
			&.add-cart{
				background-color: #FF9500;
			}
		}
	}
</style>