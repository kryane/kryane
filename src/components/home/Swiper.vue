<template>
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
</template>

<script>
// 引入swiper插件的css文件
import 'swiper/dist/css/swiper.css'
import { swiper, swiperSlide } from 'vue-awesome-swiper'

export default {
	name:"Swiper",
	components:{
		swiper,
		swiperSlide
	},
	props:{
		swiperList:Array
	},
	data() {
		return {
			swiperOption: {
				autoplay: {
					delay: 3000,
					disableOnInteraction: false,	// 当用户滑动图片后继续自动轮播
				},
				speed: 1000,
				// 定位小圆点
				pagination: {
					el: '.swiper-pagination'
				}
			},
		}
	},
}
</script>

<style scoped>
	.swiper-main{
		/* 当子元素跟随父元素变化而发生位置变化时
		可以在父元素加个relative，相对定位
		锁定子元素的位置 */
		position: relative;
		width: 100%;
		height: 165px;
	}
	.swiper-container{
		width: 100%;
		height: 165px;
	}
	.swiper-main img{
		width: 100%;
		height: 165px;
	}
	.swiper-pagination{
		width: 100%;
		bottom:0px;
	}
	::v-deep .swiper-pagination-bullet-active{
		background-color: #b0352f;
	}
	::v-deep .swiper-pagination-bullet{
		/* 上下0 左右3px */
		margin:0 3px;
	}
</style>