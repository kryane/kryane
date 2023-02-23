<template>
    <div class="path_index container">
        <Header>
            <span v-if='pathStatus'>添加地址</span>
            <span v-else>编辑地址</span>
        </Header>
        <section>
            <van-address-edit
                v-if='pathStatus'
                :area-list="areaList"
                show-set-default
                @save="onSave"
                :area-columns-placeholder="['请选择','请选择','请选择',]"
            />
            
            <van-address-edit
                v-else
                :address-info='AddressInfo'
                :area-list="areaList"
                show-delete
                show-set-default
                show-search-result
                @save="onUpdate"
                @delete="onDelete"
                :area-columns-placeholder="['请选择','请选择','请选择',]"
            />
        </section>
        <Tabbar></Tabbar>
    </div>
</template>

<script>
import Header from '@/components/path/Header.vue'
import Tabbar from '@/components/common/Tabbar.vue'
import { Toast } from 'vant'
import { areaList } from '@vant/area-data'
import http from '@/common/api/request'

export default {
    data() {
        return {
            pathStatus:false,
            AddressInfo:{},
            areaList,
            searchResult: []
        }
    },
    components:{
        Header,
        Tabbar
    },
    mounted(){
        let key = JSON.parse(this.$route.params.key);
        //是通过添加进来的
        if( key == 'add' ){
            this.pathStatus = true;
        }else{//编辑进来的
            this.AddressInfo = key;
            this.AddressInfo.isDefault = this.AddressInfo.isDefault == 1 ? true : false;
        }
    },
    methods:{
        onSave(content){
            content.isDefault = content.isDefault == true ? 1 : 0

            http.$axios({
                url: '/api/addAddress',
                method: 'post',
                headers:{
                    token: true
                },
                data:{
                    ...content
                }
            }).then(res => {
                if (!res.success) return
                Toast(res.msg)
                this.$router.push("/path")
            })
        },
        //点击保存触发 ==> 修改
        onUpdate( content ){
            content.isDefault = content.isDefault==true ? 1 : 0;
            http.$axios({
            	url:'/api/updateAddress',
                method:"post",
                headers:{
                    token:true
                },
                data:{
                    ...content
                }
            }).then(res=>{
                if( !res.success ) return;
                Toast(res.msg);
                this.$router.push('/path');
            })
        },
        //删除
        onDelete(content) {
            http.$axios({
            	url:'/api/deleteAddress',
                method:"post",
                headers:{
                    token:true
                },
                data:{
                    id: content.id
                }
            }).then(res=>{
                if( !res.success ) return;
                Toast(res.msg);
                this.$router.push('/path');
            })
        },
    }
}
</script>

<style lang="scss" scoped>
section{
    background-color: #f7f7f7;

    .van-address-edit{
        padding: 0;
    }
}

::v-deep .tabbar{
    border-top: 2px solid #ccc;
}
</style>