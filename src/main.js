import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

// 公共的css文件
import './assets/css/common.css'
// 引入字体图标的css文件
import './assets/css/iconfont.css'
// 淘宝无线适配文件
import './assets/js/flexible.js'
// 引入插件
import LyTab from 'ly-tab'
// 引入mint-ui
import MintUI from 'mint-ui'
import 'mint-ui/lib/style.css'
// 全局引入vant
import Vant from 'vant'
import 'vant/lib/index.css';

Vue.config.productionTip = false;

Vue.use(LyTab)
Vue.use(MintUI)
Vue.use(Vant)

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
