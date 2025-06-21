<template>
    <div ref="wrapper" class="wrapper">
        <template v-if="showArrow && isOverflow">
            <div class="left dark:bg-dark!" @click="handleMouseWheel({ wheelDelta: 120 })">
                <LeftOutlined />
            </div>
            <div class="right dark:bg-dark!" @click="handleMouseWheel({ wheelDelta: -120 })">
                <RightOutlined />
            </div>
        </template>

        <div
            ref="content"
            class="content"
            :class="{ overflow: isOverflow && showArrow }"
            :style="{
                transform: `translateX(${translateX}px)`
            }"
        >
            <slot />
        </div>
    </div>
</template>

<script setup>
import { debounce } from "@/utils"
import { LeftOutlined, RightOutlined } from "@ant-design/icons-vue"

function useResize(el, cb) {
    const observer = new ResizeObserver((entries) => {
        cb(entries[0].contentRect)
    })
    observer.observe(el)
    return observer
}

defineProps({
    showArrow: {
        type: Boolean,
        default: true
    }
})
const translateX = ref(0)
const content = ref(null)
const wrapper = ref(null)
const isOverflow = ref(false)

// *********************
// Service Function
// *********************

const refreshIsOverflow = debounce(() => {
    const wrapperWidth = wrapper.value?.offsetWidth
    const contentWidth = content.value?.offsetWidth
    isOverflow.value = contentWidth > wrapperWidth
    resetTranslateX(wrapperWidth, contentWidth)
}, 200)

function handleMouseWheel(e) {
    const { wheelDelta } = e
    const wrapperWidth = wrapper.value?.offsetWidth
    const contentWidth = content.value?.offsetWidth
    /**
     * @wheelDelta 平行滚动的值 >0： 右移  <0: 左移
     * @translateX 内容translateX的值
     * @wrapperWidth 容器的宽度
     * @contentWidth 内容的宽度
     */
    if (wheelDelta < 0) {
        if (wrapperWidth > contentWidth && translateX.value < -10) return
        if (wrapperWidth <= contentWidth && contentWidth + translateX.value - wrapperWidth < -10) return
    }
    if (wheelDelta > 0 && translateX.value > 10) {
        return
    }

    translateX.value += wheelDelta
    resetTranslateX(wrapperWidth, contentWidth)
}

const resetTranslateX = debounce((wrapperWidth, contentWidth) => {
    if (!isOverflow.value) {
        translateX.value = 0
    } else if (-translateX.value > contentWidth - wrapperWidth) {
        translateX.value = wrapperWidth - contentWidth
    } else if (translateX.value > 0) {
        translateX.value = 0
    }
}, 200)

const observers = ref([])
onMounted(() => {
    refreshIsOverflow()

    observers.value.push(useResize(document.body, refreshIsOverflow))
    observers.value.push(useResize(content.value, refreshIsOverflow))
})
onBeforeUnmount(() => {
    observers.value.forEach((item) => {
        item?.disconnect()
    })
})

function handleScroll(x, width) {
    const wrapperWidth = wrapper.value?.offsetWidth
    const contentWidth = content.value?.offsetWidth
    if (contentWidth <= wrapperWidth) return

    // 当 x 小于可视范围的最小值时
    if (x < -translateX.value + 150) {
        translateX.value = -(x - 150)
        resetTranslateX(wrapperWidth, contentWidth)
    }

    // 当 x 大于可视范围的最大值时
    if (x + width > -translateX.value + wrapperWidth) {
        translateX.value = wrapperWidth - (x + width)
        resetTranslateX(wrapperWidth, contentWidth)
    }
}

defineExpose({
    handleScroll
})
</script>

<style lang="less" scoped>
[data-theme="dark"] {
    .wrapper {
        border-color: #2e2e32 !important;
    }
}
.wrapper {
    display: flex;
    z-index: 9;
    height: 38px;
    overflow: hidden;
    position: relative;
    background-color: var(--bg-color, #f7f8fa);
    border-bottom: 1px solid #f0f0f0;
    .content {
        padding: 0 10px;
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
        transition: transform 0.5s;
        &.overflow {
            padding-left: 30px;
            padding-right: 30px;
        }
    }
    .left,
    .right {
        background-color: #fff;
        position: absolute;
        top: 0;
        bottom: 0;
        margin: auto;

        width: 20px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;

        font-size: 18px;
        border: 1px solid #e0e0e6;
        border-radius: 2px;

        z-index: 2;
        cursor: pointer;
    }
    .left {
        left: 0;
    }
    .right {
        right: 0;
    }

    .home-expand-close {
        position: absolute;
        right: 0;
        font-size: 14px;
        font-weight: 400;
        color: #2c2c2c;
        top: 2px;
        &:hover {
            color: #00b781;
        }
        span {
            padding-right: 3px;
        }
        .expand-close-icon {
            transition: all 0.1s ease-in;
        }
    }
}
</style>
