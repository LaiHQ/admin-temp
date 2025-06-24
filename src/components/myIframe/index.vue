<template>
    <a-spin :tip="state.tip" :indicator="indicator" wrapperClassName="iframe-container" :spinning="state.spinning">
        <iframe class="iframe" @load="onLoad" @error="handleError" :src="src" allowfullscreen frameborder="0" sandbox="allow-scripts allow-same-origin" referrerpolicy="no-referrer" tabindex="0">
            <div class="iframe-fallback">
                <p>内容加载失败</p>
                <a :href="src" target="_blank">点击在新窗口打开</a>
            </div>
        </iframe>
    </a-spin>
</template>

<script setup>
import { LoadingOutlined } from "@ant-design/icons-vue"
import { h } from "vue"
const indicator = h(LoadingOutlined, {
    style: {
        fontSize: "24px"
    },
    spin: true
})

const props = defineProps({
    src: {
        type: String,
        default: ""
    },
    tip: {
        type: String,
        default: "加载中..."
    }
})
const state = reactive({
    spinning: true,
    tip: props.tip
})

function onLoad() {
    try {
        const iframe = document.querySelector("iframe")
        // 检查 iframe 文档和内容
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
        if (iframeDoc.readyState === "complete") {
            // 检查是否有可见内容
            if (iframeDoc.body && iframeDoc.body.children.length > 0) {
                console.log("iframe 内容加载成功")
            } else {
                console.log("iframe 加载完成但内容为空")
            }
        }
    } catch (e) {
        console.error("同源策略限制，无法访问 iframe 内容")
        // 处理跨域限制或加载失败
    }
    state.spinning = false
}

function handleError() {
    console.log("error iframe")
    state.tip = "内容加载失败，清刷新重试。"
}
</script>

<style lang="less" scoped>
.iframe-container {
    position: relative;
    height: 100%;

    :deep(.ant-spin-container) {
        height: 100%;
    }

    .iframe {
        height: 100%;
        width: 100%;
    }
}
</style>
