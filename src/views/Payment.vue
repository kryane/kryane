<template>
    <div>
        <div v-if='payStatus'>
            <div class="text">
                <img src="/images1/dui.png" alt="">
                <div>恭喜您支付成功~</div>
            </div>
            <a href="http://localhost:8080/home">点我跳转到首页</a>
        </div>
        <!-- <div v-else>支付失败</div> -->
    </div>
</template>

<script>
import http from '@/common/api/request.js'
import qs from 'qs'
export default{
    data () {
        return {
            payStatus : false
        }
    },
    created(){
        this.getData();
    },
    methods:{
        getData(){
            let datas = {
                out_trade_no:this.$route.query.out_trade_no,
                trade_no:this.$route.query.trade_no
            }
            http.$axios({
            	url:'/api/successPayment',
                method:"post",
                headers:{
                    token:true
                },
                data:qs.stringify(datas)
            }).then(res=>{
                
                if( res.code == 2 ){
                    this.payStatus = true;
                }
            })
        }
    }
}
</script>

<style lang="scss" scoped>
    .text{
        display: flex;
        // flex-direction: column;
        justify-content: center;
        align-items: center;

        img{
            width: 40px;
            height: 40px;
            opacity: 0.3;
            padding: 80px 8px;
        }

        div{
            font-size: 32px;
            font-weight: 500;
        }
    }

    a{
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 24px;
        padding: 40px 10px;
    }
</style>
