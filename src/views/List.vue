<template>
	<div class="list">
		<header v-show="isShow">
			<div class="returns">
				<i class="iconfont icon-fanhui" @click="$router.back()"></i>
			</div>
			<div class="search">
				<i class="iconfont icon-fangdajing"></i>
				<span>搜您喜欢的东西....</span>
			</div>
			<div class="go-home" @click="goHome">
				<img src="@/assets/images/home.png" alt="">
			</div>
		</header>
		<section>
			<div class="list-l" ref="left">
				<ul class="l-item">
					<li 
						:class="{active: index == currentIndex}" 
						v-for="(item, index) in leftData" 
						:key="index"
						@click="goScroll(index)"
					>{{ item.name }}</li>
				</ul>
			</div>
			<div class="list-r" ref="right">
				<div>
					<ul class="shop-list" v-for="(item, index) in rightData" :key="index">
						<li v-for="(k, i) in item" :key="i">
							<h2>{{ k.name }}</h2>
							<ul class="r-content">
								<li v-for="(j, idx) in k.list" :key="idx">
									<img :src="j.imgUrl" alt="">
									<span>{{ j.name }}</span>
								</li>
							</ul>
						</li>
					</ul>
				</div>
			</div>
		</section>
		<Tabbar />
	</div>
</template>

<script>
import BetterScroll from 'better-scroll'
import Tabbar from '@/components/common/Tabbar.vue'
import http from '@/common/api/request'
export default {
	name: "List",
	data() {
		return {
			isShow: true,
			leftData: [],
			rightData: [],
			rightBScroll: '', // 右侧滑动的数据
			allHeight: [],
			scrollY: ''			// 右侧滚动距离
		}
	},
	components: {
		Tabbar
	},
	async created() {
		let res = await http.$axios({
			url: '/api/goods/list'
		})

		let leftArr = []
		let rightArr = []

		res.forEach(v => {
			leftArr.push({
				id: v.id,
				name: v.name
			})
			rightArr.push(v.data)
		})

		this.leftData = leftArr
		this.rightData = rightArr

		this.$nextTick(() => {
			new BetterScroll(this.$refs.left, {
				// 因为BetterScroll默认取消click事件，所以这里要改成true
				click: true,
				// 取消回弹效果
				bounce: false
			})
			this.rightBScroll = new BetterScroll(this.$refs.right, {
				click: true,
				// probeType默认为0，所以不会派发scroll事件，建议改成2|3
				probeType: 3,
				// 取消回弹效果
				bounce: false
			})
			// 统计右侧所有板块的高度值，并当如数组中
			let height = 0
			this.allHeight.push(height)
			// 获取右侧每一块的高度
			let uls = this.$refs.right.getElementsByClassName("shop-list")
			// 把DOM对象转成数组
			Array.from(uls).forEach(v => {
				height += v.clientHeight
				this.allHeight.push(height)
			})
			this.rightBScroll.on("scroll", (pos) => {
				this.scrollY = Math.abs(pos.y)
			})
			
		})
	},
	methods:{
		goScroll(index){
			// scrollTo的三个参数，起始位置，滑动距离，速率
			this.rightBScroll.scrollTo(0, -this.allHeight[index], 300)
		},
		// 回到首页
		goHome(){
			this.$router.push("/home")
		}
	},
	computed:{
		currentIndex(){
			return this.allHeight.findIndex((item, index) => {
				// 滚动的距离大于当前的高度值，并且小于等于当前高度+1的值
				return this.scrollY >= item && this.scrollY < this.allHeight[index + 1]
			})
		}
	}
};
</script>

<style scoped lang="scss">
	.list {
		display: flex;
		flex-direction: column;
		width: 100vw;
		height: 100vh;
		overflow: hidden;

		section {
			display: flex;
			flex: 1;
			overflow: hidden;
		}
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 44px;
		background-color: #b0352f;

		.returns {
			padding: 0 10px;
			line-height: 44px;

			i {
				color: #fff;
				font-size: 26px;
			}
		}

		.search {
			flex: 1;
			display: flex;
			align-items: center;
			padding: 6px 10px;
			background-color: #FFFFFF;
			border-radius: 24px;

			i {
				padding-right: 6px;
				color: #666;
				font-size: 16px;
			}

			span {
				color: #666;
				font-size: 14px;
			}
		}

		.go-home {
			padding: 6px 3px;
			
			line-height: 44px;

			img {
				display: flex;
				align-items: center;
				width: 26px;
				height: 26px;
			}
		}
	}

	section {
		display: flex;
		flex: 1;
		overflow: hidden;

		.list-l {
			width: 93px;
			background-color: #fff;
			border-right: 1px solid #CCCCCC;
			overflow: hidden;

			.l-item {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;

				li {
					width: 100%;
					padding: 3px 0;
					margin: 20px 0;
					// line-height: 50px;
					text-align: center;
					font-size: 14px;

					&.active {
						color: #b54f4a;
						border-left: 6px solid #b54f4a;
					}
				}
			}
		}
	}

	.list-r {
		flex: 1;
		overflow: hidden;

		.shop-list {
			text-align: center;

			h2 {
				padding: 0.533333rem 0;
				font-size: 24px;
				font-weight: 400;
			}

			.r-content {
				display: flex;
				// 需要时进行换行
				flex-wrap: wrap;

				li {
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;
					width: 33.33%;
					padding: 10px 0;

					img {
						width: 53px;
						height: 53px;
					}

					span {
						font-size: 14px;
					}
				}
			}
		}
	}

	::v-deep .tabbar {
		border-top: 1px solid #CCCCCC;
	}
</style>
