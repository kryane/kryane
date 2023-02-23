<template>
	<div class="Cart container">
		<header>
			<i @click="goBack" class="iconfont icon-fanhui"></i>
			<span>购物车</span>
			<span @click="isNavBar" v-text="isNavStatus ? '完成' : '编辑'"></span>
		</header>
		<section v-if="list.length">
			<div class="cart-title">
				<van-checkbox @click="checkedAllFn" :value="isCheckedAll"></van-checkbox>
				<span>全选 / 不全选</span>
			</div>
			<ul>
				<li v-for="(item, index) in list" :key="index">
					<div class="check">
						<van-checkbox @click="CHECK_ITEM(index)" v-model="item.checked"></van-checkbox>
					</div>
					<h2>
						<img :src="item.goods_imgUrl" alt="">
					</h2>
					<div class="goods">
						<div class="goods-title">
							<span>{{item.goods_name}}</span>
							<i class="iconfont icon-lajitong" @click="delGoodsFn(item.id)"></i>
						</div>
						<div class="goods-price">￥{{item.goods_price}}</div>
						<div>
							<van-stepper @change="changeNum($event, item)" v-model="item.goods_num" integer></van-stepper>
						</div>
					</div>
				</li>
			</ul>
		</section>
		<div class="text-home" v-else>
			<h3>购物车没有商品，请添加商品</h3>
			<img src="/images1/购物袋子.png" alt="">
			<router-link to="/home">点我回到首页</router-link>
		</div>
		<footer v-if="list.length">
			<div class="radio">
				<van-checkbox @click="checkedAllFn" :value="isCheckedAll"></van-checkbox>
			</div>
			<div class="total" v-show="!isNavStatus">
				<div>
					共有
					<span class="total-active">{{total.num}}</span>
					件商品
				</div>
				<div>
					<span>总计：</span>
					<span class="total-active">￥{{total.price.toFixed(2)}} + 0茶币</span>
				</div>
			</div>
			<div class="order" v-if="isNavStatus" @click="delGoodsFn">删除</div>
			<div class="order" v-else @click="goOrder">去结算</div>
		</footer>
	</div>
</template>

<script>
import http from '@/common/api/request'
import { Toast } from 'vant'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

export default {
	name: "Cart",
	data() {
		return {
			isNavStatus: false
		}
	},
	computed:{
		...mapState({
			list: state => state.cart.list,
			selectList: state => state.cart.selectList
		}),
		...mapGetters(['isCheckedAll', 'total']),
		goodsList(){
            return this.selectList.map(id => {
                return this.list.find(v => v.id == id)
            })
        }
	},
	created(){
		this.getData()
	},
	methods:{
		...mapMutations(['CART_LIST', 'CHECK_ITEM', 'INIT_ORDER']),
		...mapActions(['checkedAllFn', "delGoodsFn"]),
		goBack(){
			this.$router.back()
		},
		async getData(){
			let res = await http.$axios({
				url: '/api/selectCart',
				method: "post",
				headers:{
					token: true
				}
			})
			res.data.forEach(v => {
				v['checked'] = true
			});
			this.CART_LIST(res.data)
		},
		// 点击编辑|完成按钮
		isNavBar(){
			this.isNavStatus = !this.isNavStatus
		},
		// 修改数量
		changeNum(value, item){
			// 拿到当前购物车商品的id以及修改后的数量传递给后端，修改数据库的信息
			// id是商品的id，detail是点击对象
			http.$axios({
				url: '/api/updateNum',
				method: 'post',
				headers: {
					token: true
				},
				data: {
					id: item.id,
					num: value
				}
			})
		},
		// 去结算
		goOrder(){
			if (!this.selectList.length){
				Toast("请至少选择一件商品")
				return ;
			}

			let newList = []
			this.list.forEach(item => {
				this.selectList.filter(v => {
					if (v == item.id){
						newList.push(item)
					}
				})
			})

			// 生成一个订单
			http.$axios({
				url: '/api/addOrder',
				method: "post",
				headers: {
					token: true
				},
				data: {
					arr: newList
				}
			}).then(res => {
				if (!res.success) return
				// 存储订单号
				this.INIT_ORDER(res.data)
				// 进入提交订单页面
				this.$router.push({
					path: '/order',
					query:{
						detail: JSON.stringify(this.selectList),
						goodsList: JSON.stringify(this.goodsList)
					}
				})
			})
		}
	},
	watch: {
		// 如果路由发生变化，再次执行该方法
		// 解决了添加数据后，回到购物车时，页面数据不刷新的问题
		'$route': 'getData',
	}
};
</script>

<style scoped lang="scss">
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 44px;
		background-color: #b0352f;
		color: #fff;

		i {
			padding: 0 15px;
			font-size: 22px;
		}

		span {
			padding: 0 15px;
			font-size: 16px;
		}
	}
	
	section{
		background-color: #f5f5f5;
		
		.cart-title{
			display: flex;
			padding: 20px;
			
			span{
				padding: 0 15px;
				font-weight: 500;
				font-size: 18px;
			}
		}
		
		ul{
			display: flex;
			flex-direction: column;
			
			li{
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 6px 20px;
				margin: 8px 0;
				background-color: #fff;
				
				.check{
				    padding-right: 14px;
				}
				
				.goods{
					display: flex;
					flex-direction: column;
					justify-content: center;
					font-size: 12px;
					padding-left: .4rem;

					span{
						width: 217px;
						height: 32px;
					}
					
					.goods-title{
						display: flex;
						
						i{
							font-size: 22px;
						}
					}
					
					.goods-price{
						padding: 3px 0;
						color: #b0352f;
					}
					
					::v-deep .van-stepper{
						text-align: right;
					}
				}
				
				img{
					width: 47px;
					height: 47px;
				}
			}
		}
	}

	.text-home{
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		font-size: 20px;

		h3{
			padding: 30px;
		}

		img{
			width: 100px;
			height: 100px;
			opacity: 0.3;
			padding: 20px;
		}
	}
	
	footer{
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 48px;
		border-top: 2px solid #ccc;
		
		.radio{
			padding: 0 10px;
		}
		
		.total{
			flex: 1;
			font-size: 14px;
			
			.total-active{
				color: #b0352f;
			}
		}
		
		.order{
			width: 120px;
			line-height: 48px;
			color: #fff;
			text-align: center;
			font-size: 16px;
			background-color: #b0352f;
		}
	}
</style>
