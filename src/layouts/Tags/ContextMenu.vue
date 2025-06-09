<template>
    <a-menu>
        <a-menu-item v-for="item in options" :key="item.key" @click="handleSelect(item.key)">
            {{ item.label }}
        </a-menu-item>
    </a-menu>
</template>

<script setup>
import useStore from "@/store"
import { useRoute, useRouter } from "vue-router"
import { computed } from "vue"


const props = defineProps({
    ctag: {
        type: Object,
        default: {}
    }
})
const route = useRoute()
const router = useRouter()
const store = useStore()
const options = computed(() => {
    if (props.ctag.key !== "dashboard") {
        return [
            {
                label: "重新加载",
                key: "reload"
            },
            {
                label: "关闭",
                key: "close"
            },
            {
                label: "关闭其他",
                key: "close-other"
            },
            {
                label: "关闭左侧",
                key: "close-left"
            },
            {
                label: "关闭右侧",
                key: "close-right"
            }
        ]
    } else {
        return [
            {
                label: "重新加载",
                key: "reload"
            },
            {
                label: "关闭其他",
                key: "close-other"
            },
            {
                label: "关闭右侧",
                key: "close-right"
            }
        ]
    }
})
const close = async () => {
    debugger
    if (props.ctag.key === route.name) {
        // const index = store.user.tags.findIndex((i) => i.key === props.ctag.key)
        // const item = store.user.tags[index + 1] || store.user.tags[index - 1]
        // router.push({ name: item.key })
        // store.user.tags.splice(index, 1)
    } else {
        // const index = store.user.tags.findIndex((i) => i.key === props.ctag.key)
        // store.user.tags.splice(index, 1)
    }
}
const closeOther = () => {
    // const item = store.tags.find((i) => i.key === props.ctag.key)
    // if (item.key === "check") {
    //     store.tags = [item]
    // } else {
    //     store.tags = [
    //         {
    //             key: "check",
    //             title: "图书查重"
    //         },
    //         item
    //     ]
    // }
    // router.push({ name: props.ctag.key })
}
const closeDirection = (direction) => {
    const index = store.tags.findIndex((i) => i.key === props.ctag.key)
    if (direction === "left") {
        const arr = store.tags.slice(index, store.tags.length)
        store.tags = [store.tags[0], ...arr]
    } else {
        store.tags = store.tags.slice(0, index + 1)
    }
    router.push({ name: props.ctag.key })
}
const reload = () => {
    store.exTag = route.name
    window.location.reload()
    setTimeout(() => {
        store.exTag = ""
    }, 0)
}
const actionMap = new Map([
    ["reload", reload],
    ["close", close],
    ["close-other", closeOther],
    [
        "close-left",
        () => {
            closeDirection("left")
        }
    ],
    [
        "close-right",
        () => {
            closeDirection("right")
        }
    ]
])

function handleSelect(key) {
    const actionFn = actionMap.get(key)
    actionFn && actionFn()
}
</script>
