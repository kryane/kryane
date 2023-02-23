<template>
	<div class="search-list">
		<div class="headers">
			<Header></Header>
			<ul>
				<li
					v-for="(item, index) in searchList.data"
					:key="index"
					@click="changeTab(index)"
				>
					<div :class="searchList.currentIndex == index ? 'active' : ''">{{item.name}}</div>
					<div class='search-filter' v-if="index != 0">
						<i 
							class='iconfont icon-arrow_up_fat'
							:class="item.status == 1 ? 'active' : ''"
						></i>
						<i 
							class='iconfont icon-arrow_down_fat'
							:class="item.status == 2 ? 'active' : ''"
						></i>
					</div>
				</li>
			</ul>
		</div>
		<section>
			<ul>
				<li v-for="(item, index) in goodsList"
					:key="index"
					@click="goDetail(item.id)"
				>
					<img :src="item.imgUrl" alt="">
					<h3>{{ item.name }}</h3>
					<div class='price'>
						<div>
							<span>¥</span>
							<b>{{ item.price }}</b>
						</div>
						<div>立即购买</div>
					</div>
				</li>
			</ul>
		</section>
		<Tabbar></Tabbar>
	</div>
</template>

<script>
import Header from '@/components/search/Header.vue'
import Tabbar from '@/components/common/Tabbar.vue'
import http from '@/common/api/request'
export default{
	data() {
		return {
			goodsList: [],
			searchList: {
				currentIndex: 0,
				data: [
					/* 
						status: 0，都不亮
						status: 1，上箭头亮
						status: 2，下箭头亮
						key: 对应的是数据库里的字段
					*/
					{
						name: '综合',
						key: 'zh'
					},
					{
						name: '价格',
						status: 0,
						key: 'price'
					},
					{
						name: '销量',
						status: 0,
						key: 'num'
					}
				]
			}
		}
	},
	computed:{
		orderBy(){
			// 知道是哪个对象
			let obj = this.searchList.data[this.searchList.currentIndex]
			// 针对于状态，判断是升序还是降序	asc是升序，desc是降序
			let val = obj.status == '1' ? 'asc' : 'desc'
			return {
				[obj.key]: val
			}
		}
	},
	components:{
		Header,
		Tabbar
	},
	created() {
		this.getData()
	},
	methods:{
		getData(){
			http.$axios({
				url: '/api/goods/shopList',
				params:{
					searchName: this.$route.query.key,
					...this.orderBy
				}
			}).then(res => {
				this.goodsList = res
			})
		},
		changeTab(index){
			this.searchList.currentIndex = index
			let item = this.searchList.data[index]
			// 取消所有的状态值
			this.searchList.data.forEach((v, j) => {
				if (j != index) {
					v.status = 0
				}
			})
			if (index == this.searchList.currentIndex) {
				item.status = item.status == 1 ? 2 : 1
				this.getData()
			}
		},
		goDetail(id){
			this.$router.push({
				path: "/detail",
				query:{
					id
				}
			})
		}
	},
	watch:{
		$route(){
			this.getData()
		}
	}
}
</script>

<style scoped lang="scss">
.search-list{
	display: flex;
	flex-direction: column;
	width: 100vw;
	height: 100vh;
	overflow: hidden;
}

.headers ul{
	display: flex;
	justify-content: space-around;
	padding: 20px 0;
	font-size: 16px;
}

.headers ul li{
	display: flex;
	align-items: center;
}

.headers ul li > div{
	padding:0 3px;
}

.headers ul li .search-filter{
	display: flex;
	flex-direction: column;

	i{
		width: 1px;
		height: 1px;
		font-size: 12px;
		padding-bottom: 9px;
	}
}

section{
	flex:1;
	overflow: hidden;
	
	ul{
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		
		li {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			box-sizing: border-box;
			width: 50%;
			padding: 10px;
		}
	}
}


section ul li img{
	width: 170px;
	height: 170px;
}

section ul li h3{
	width: 100%;
	font-size: 14px;
	color:#222;
	font-weight: 400;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

section ul li .price{
	display: flex;
	justify-content: space-between;
	padding: 10px 0;
	width: 100%;
	font-size:14px;
}

section ul li .price div:first-child span{
	font-size: 12px;
	color:#b0352f;
}

section ul li .price div:first-child b{
	color:#b0352f;
	font-size: 16px;
}

section ul li .price div:last-child{
	padding: 3px 6px;
	color:#fff;
	background-color: #b0352f;
	border-radius: 0.16rem;
}

.active{
	color: red;
}
</style>