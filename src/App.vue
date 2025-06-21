<template>
    <a-config-provider
        :locale="zh_CN"
        :theme="{
            token: {
                colorPrimary: system.primaryColor
            }
        }"
    >
        <router-view></router-view>
    </a-config-provider>
</template>

<script setup>
import { printItemInfo } from "@/utils"
import usePerformance from "@/hooks/usePerformance"
import useVersion from "@/hooks/useVersion"
import zh_CN from "ant-design-vue/es/locale/zh_CN"
import "dayjs/locale/zh-cn"
import { setRootVariable } from "@/utils"
import useStore from "@/store"
import { message } from "ant-design-vue"
import { watch } from "vue"

const { system } = useStore()
const route = useRoute()

const watchNetwork = () => {
    let title = ""
    const handle = (event) => {
        const text = {
            offline: "网络已断开，请检查网络连接。",
            online: "网络已连接"
        }
        title = text[event.type]
        console.log(title)
        message[event.type === "online" ? "success" : "error"](title)
    }
    window.addEventListener("offline", handle)
    window.addEventListener("online", handle)
}

onMounted(() => {
    printItemInfo()
    watchNetwork()
    useVersion()
    window.addEventListener("storage", (e) => {
        if (e.key === "token") {
            if (document.hidden) {
                window.location.reload()
            }
        }
    })
    if (import.meta.env.MODE === "development") {
        usePerformance()
        console.log(import.meta.env)
    }
    const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    darkModeMediaQuery.addEventListener("change", (e) => {
        system.setCurrentTheme(e.matches ? "dark" : "light")
    })
})

function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16)
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255]
}
watch(
    () => system.primaryColor,
    (v) => {
        const [r, g, b] = hexToRgb(v)
        setRootVariable("--primary-color", v)
        setRootVariable("--primary-color-bg", `rgba(${r}, ${g}, ${b}, ${0.1})`)
    },
    {
        immediate: true
    }
)

watch(
    () => system.theme,
    (v) => {
        document.body.setAttribute("data-theme", v)
    },
    {
        immediate: true
    }
)

watch(
    () => route.query,
    (v) => {
        if (v.theme) {
            system.setCurrentTheme(v.theme)
        }
        if (v.primaryColor) {
            system.setPrimaryColor("#" + v.primaryColor)
        }
    },
    {
        immediate: true
    }
)
</script>

<style lang="less">
body,
html {
    height: 100%;
}

:root {
    --bg-color: #ffffff;
    --text-color: #333333;
}

[data-theme="dark"] {
    --bg-color: #1b1b1f;
    --text-color: #dfdfd6;
    --accent-color: #bb86fc;
    .router-view-container {
        background-color: #000c17;
    }
    .anticon {
        color: var(--text-color, #333);
    }
}

/* 根据系统偏好自动切换 */
@media (prefers-color-scheme: dark) {
    :root {
        --bg-color: #1b1b1f;
        --text-color: #dfdfd6;
    }
}

body {
    background-color: var(--bg-color);
}

#app {
    height: 100%;
}

#nprogress .bar {
    background: var(--primary-color);
}
</style>
