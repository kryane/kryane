<template>
    <div class="path_index container">
        <Header></Header>
        <section>
            <ul v-if="list.length">
                <li 
                    v-for="(item, index) in list"
                    :key="index"
                    @click="goPathList(item)"
                >
                    <div>
                        <span>{{item.name}}</span>
                        <span>{{item.tel}}</span>
                    </div>
                    <div class="city">
                        <span class="active" v-if="item.isDefault == 1">[默认]</span>
                        <span>{{item.province}}</span>
                        <span>{{item.city}}</span>
                        <span>{{item.county}}</span>
                        <span>{{item.addressDetail}}</span>
                    </div>
                </li>
            </ul>
            <h1 v-else>暂无数据，请添加地址</h1>
            <div class="add_path" @click="goPathList('add')">添加地址</div>
        </section>
        <Tabbar></Tabbar>
    </div>
</template>

<script>
import Header from '@/components/path/Header.vue'
import Tabbar from '@/components/common/Tabbar.vue'
import http from '@/common/api/request'
import { mapState, mapMutations } from 'vuex'
import bus from '@/common/api/bus'

export default {
    data() {
        return {
            pathStatus: false
        }
    },
    components:{
        Header,
        Tabbar
    },
    created(){
        // 判断是否是从订单页面过来的
        if (this.$route.query.type == 'select'){
            this.pathStatus = true
        }

        this.getData()
    },
    computed:{
        ...mapState({
            list: state => state.path.list
        })
    },
    methods:{
        ...mapMutations(['INIT_DATA']),
        goPathList(option){
            // this.pathStatus 为 true的话，就说明是从订单页面进来的，选择状态
            if (this.pathStatus){
                bus.$emit('selectPath', JSON.stringify(option))
                this.$router.back()
                return;
            }

            this.$router.push({
                name: 'PathList',
                params:{
                    key:JSON.stringify(option)
                }
            })
        },
        getData(){
            http.$axios({
                url: '/api/selectAddress',
                method: 'post',
                headers:{
                    token: true
                }
            }).then(res => {
                this.INIT_DATA(res.data)
            })
        }
    }
}
</script>

<style lang="scss" scoped>
section{
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #f7f7f7;
    
    ul{
        width: 100%;
        li{
            padding: 10px 15px;
            margin: 6px 0;
            background-color: #ffffff;

            span{
                padding-right: 10px;
                font-size: 16px;
            }

            .active{
                color: #b0352f;
            }

            .city{
                span{
                    padding-right: 6px;
                }
            }
        }
    }

    .add_path{
        margin-top: 30px;
        width: 120px;
        line-height: 40px;
        text-align: center;
        font-size: 16px;
        color: #ffffff;
        background-color: #b0352f;
        border-radius: 6px;
    }
}

::v-deep .tabbar{
    border-top: 2px solid #ccc;
}
</style>