<template>
    <div class="web-open">
        <div class="blank-content" v-if="target === '_blank'">
            <p style="font-size: 48px">🌍</p>
            <div style="margin: 20px 0">页面已在新窗口打开</div>
            <a-button @click="handleOpen">立即打开</a-button>
        </div>
        <MyIframe :src="href" v-else />
    </div>
</template>

<script setup>
import MyIframe from "@/components/myIframe/index.vue"
const route = useRoute()
const { href, target } = route.meta
function handleOpen() {
    window.open(href, "_blank")
}
</script>

<style lang="less" scoped>
.web-open {
    position: relative;
    text-align: center;
    height: calc(100vh - 120px);
    position: relative;
    .blank-content {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }
}
</style>
