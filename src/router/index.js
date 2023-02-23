import Vue from "vue";
import VueRouter from "vue-router";
import HomeView from "@/views/HomeView.vue";

// 6到17行，解决  /my  路由到  /cart路由的跳转报错问题，主要原因是VueRouter的版本问题，这里进行了重构
const originalPush = VueRouter.prototype.push
const originalReplace = VueRouter.prototype.replace
// push
VueRouter.prototype.push = function push (location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
  return originalPush.call(this, location).catch(err => err)
}
// replace
VueRouter.prototype.replace = function push (location, onResolve, onReject) {
  if (onResolve || onReject) return originalReplace.call(this, location, onResolve, onReject)
  return originalReplace.call(this, location).catch(err => err)
}

Vue.use(VueRouter);

const routes = [{
		path: "/home",
		name: "Home",
		component: HomeView,
	},
	{
		path: "/",
		redirect: '/home' // 重定向
	},
	{
		path: "/list",
		name: "List",
		component: () =>
			import("../views/List.vue"),
	},
	{
		path: "/cart",
		name: "Cart",
		component: () =>
			import("../views/Cart.vue"),
	},
	{
		path: "/my",
		name: "My",
		component: () =>
			import("../views/My.vue"),
	},
	{
		path: "/search",
		children: [{
				path: "/",
				name: "index",
				component: () =>
					import("../views/search/Search-index.vue"),
			},
			{
				path: "list",
				name: "list",
				component: () =>
					import("../views/search/Search-list.vue"),
			}
		],
		component: () =>
			import("../views/Search.vue"),
	},
	{
		path: "/detail",
		name: "Detail",
		meta:{
			keepAlive:true
		},
		component: () =>
			import("../views/Detail.vue"),
	},
	{
		path: "/login",
		name: "Login",
		component: () =>
			import("../views/login/Login.vue"),
	},
	{
		path: "/userLogin",
		name: "Userlogin",
		component: () =>
			import("../views/login/Userlogin.vue"),
	},
	{
		path: "/register",
		name: "Register",
		component: () =>
			import("../views/login/Register.vue"),
	},
	{
		path: "/recovery",
		children: [{
				path: "/",
				name: "Rindex",
				component: () =>
					import("../views/recovery/RecoveryIndex.vue"),
			},
			{
				path: "btn",
				name: "Btn",
				component: () =>
					import("../views/recovery/RecoveryBtn.vue"),
			}
		],
		component: () =>
			import("../views/recovery/Recovery.vue"),
	},
	{
		path: "/path",
		children:[
			{
				path: '/',
				name: 'Index',
				component: () => 
					import("../views/path/PathIndex.vue"),
			},
			{
				path: 'pathList',
				name: 'PathList',
				component: () => 
					import("../views/path/PathList.vue"),
			},
		],
		component: () =>
			import("../views/Path.vue"),
	},
	{
		path: "/order",
		name: "Order",
		meta:{
			keepAlive:true
		},
		component: () =>
			import("../views/Order.vue"),
	},
	{
		path: "/payment",
		name: "Payment",
		component: () =>
			import("../views/Payment.vue"),
	},
];

const router = new VueRouter({
	mode: "history",
	base: process.env.BASE_URL,
	routes,
});

// 导航守卫拦截，防止未登录时点击时报错
router.beforeEach((to, from, next) => {
	let nextRoute = ['Payment', 'Cart', 'Order', 'Index', 'PathList']
	// 是否是登录中
	let userInfo = JSON.parse(localStorage.getItem('teaUserInfo'))

	// 当前进入的页面，是不是需要验证哪些页面
	if(nextRoute.indexOf(to.name) >= 0){
		if(!userInfo){
			router.push('/login')
		}
	}

	next();
})

export default router;
