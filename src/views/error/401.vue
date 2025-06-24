<template>
    <div class="noPermission">
        <div class="noPermissionImg"></div>
        <span class="noPermissionText">抱歉，您暂时还无访问权限～</span>
        <div class="btn_warp">
            <div class="goBackHome" @click="goBackHome">返回首页</div>
            <div class="goBackHome" @click="onGologin">重新登录</div>
        </div>
    </div>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router"
const route = useRoute()
const router = useRouter()

// 返回首页
const goBackHome = () => {
    window.location.href = "/"
}

const onGologin = () => {
    localStorage.removeItem("token")
    router.replace("/user/login")
}

const goBack = () => {
    const { redirect } = route.query
    if (redirect) {
        router.push(redirect)
    } else {
        router.back(-1)
    }
}
</script>

<style lang="less" scoped>
.noPermission {
    width: 500px;
    margin: auto;
    display: flex;
    align-items: center;
    flex-direction: column;
    padding-top: 40px;
}

.noPermissionImg {
    width: 500px;
    height: 400px;
    background: url("../../assets/401.png") no-repeat;
}

.noPermissionText {
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.65);
}

.btn_warp {
    display: flex;
}

.goBackHome {
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 90px;
    height: 32px;
    padding: 6px 16px;
    border: 1px solid var(--primary-color);
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: var(--primary-color);
    margin-top: 40px;
    margin-left: 16px;
}
</style>
