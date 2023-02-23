import { CART_LIST, CHECK_ALL, UN_CHECK_ALL, CHECK_ITEM } from './mutations_types'
import { Toast, Dialog } from 'vant'
import http from '@/common/api/request'

export default{
    state:{
        list: [],       // 购物车的数据
        selectList: [], // 全选的数据id
    },
    getters:{
        isCheckedAll(state){
            return state.list.length == state.selectList.length
        },
        total(state){
            let total = {
                num: 0,
                price: 0
            }
            state.list.forEach(v => {
                if (v.checked) {
                    total.num += parseInt(v.goods_num)
                    total.price += v.goods_price * v.goods_num
                }
            })
            return total
        }
    },
    actions:{
        checkedAllFn({commit, getters}){
            getters.isCheckedAll ? commit('UN_CHECK_ALL') : commit("CHECK_ALL")
        },
        // 删除操作
        delGoodsFn({commit, state}, id){

            if ( state.selectList.length == 0) {
                Toast('请选择商品')
            }

            let arrCart = []

            // 弹出提示框
            Dialog.confirm({
                title: '温馨提示',
                message: '确定要删除该商品嘛？'
            }).then(() => {
                if (typeof id == 'number') {
                    // 单个删除
                    arrCart = [id]
                    // 在list里找到符合条件的索引
                    let index = state.list.findIndex(v => {
                        return v.id == id
                    })
                    state.list.splice(index, 1)
                }else{
                    // 多个删除
                    arrCart = state.selectList
                    commit("delGoods")
                }

                // 确认
                http.$axios({
                    url: '/api/delectCart',
                    method: 'post',
                    data:{
                        arrId: arrCart
                    }
                }).then(res => {
                    if (res.success) {
                        Toast(res.msg)
                    }
                })
            }).catch(() => {
                // 取消
                Toast('取消成功')
            })
        }
    },
    mutations:{
        [CART_LIST](state, cartArr){
            state.list = cartArr
            state.selectList = state.list.map(v => {
                return v.id
            })
        },
        // 全选
        [CHECK_ALL](state){
            state.selectList = state.list.map( v => {
                v.checked = true
                return v.id
            })
        },
        // 全不选
        [UN_CHECK_ALL](state){
            state.list.forEach(v => {
                v.checked = false
            });
            state.selectList = []
        },
        // 单选
        [CHECK_ITEM](state, index){
            let id = state.list[index].id
            let i = state.selectList.indexOf(id)
            // 能在selectList找到对应的id，那么就删除
            if(i > -1){
                return state.selectList.splice(i, 1)
            }
            // 如果之前没有选中，就给selectList添加一个id进去
            state.selectList.push(id)
        },
        // 删除
        delGoods(){
            // 把选择的数据清掉，然后再赋值给list
            state.list = state.list.filter(v => {
                return state.selectList.indexOf( v.id ) == -1
            })
        }
    },
    modules: {

    },
}