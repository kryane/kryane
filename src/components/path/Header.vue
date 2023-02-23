<template>
    <header>
        <i class="iconfont icon-fanhui" @click="goBack"></i>
        <slot>
            <span>我的地址</span>
        </slot>
        <i class="iconfont icon-kefu"></i>
    </header>
</template>

<script>
export default{
    methods:{
        goBack(){
            if ( this.$route.name == 'PathList' ){
                this.$router.replace({
                    name: 'Index'
                });
            }else{
                this.$router.push('/my');
            }
        }
    }
}
</script>

<style lang="scss" scoped>
    header{
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #b0352f;
        width: 100%;
        height: 44px;
        color: #fff;

        i{
            font-size: 22px;
            padding: 0 15px;
        }

        span{
            font-size: 16px;
            font-weight: 300;
        }
    }
</style>