<!--
 * @Descripttion:
 * @version: 1.0.0
 * @Author: lai_hq@qq.com
 * @Date: 2023-02-23 16:05:15
 * @LastEditors: lai_hq@qq.com
 * @LastEditTime: 2023-06-21 18:50:46
-->
<template>
    <a-config-provider :locale="locale">
        <router-view></router-view>
    </a-config-provider>
</template>

<script setup>
import { printItemInfo } from "@/utils"
import usePerformance from "@/hooks/usePerformance"
import useVersion from "@/hooks/useVersion"
import locale from "ant-design-vue/lib/locale-provider/zh_CN"
const watchNetwork = () => {
    let title = ""
    const handle = (event) => {
        const text = {
            offline: "网络已断开，请检查网络连接。",
            online: "网络已连接"
        }
        title = text[event.type]
        console.log(title)
    }
    window.addEventListener("offline", handle)
    window.addEventListener("online", handle)
}

onMounted(() => {
    printItemInfo()
    watchNetwork()
    usePerformance()
    useVersion()
    window.addEventListener("storage", (e) => {
        if (e.key === "token") {
            if (document.hidden) {
                window.location.reload()
            }
        }
    })
})
</script>

<style lang="less">
body,
html {
    height: 100%;
}

#app {
    height: 100%;
    background-color: #f5f4fd;
}

#nprogress .bar {
    background: @primary-color;
}
</style>
