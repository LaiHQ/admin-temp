<template>
    <a-tabs v-model:activeKey="state.activeKey" @change="handleChangeTabs" v-bind="$attrs">
        <template #leftExtra v-if="showBack">
            <slot name="leftExtra">
                <a-button type="text" class="tabs_back" @click="back">
                    <i class="iconfont icon-xingzhuangjiehe19"></i>
                    <span>{{ leftExtraText }}</span>
                </a-button>
            </slot>
        </template>
        <a-tab-pane v-for="item in state.tabsList" :key="item.path" :tab="item.title || item.meta?.title"> </a-tab-pane>
    </a-tabs>
    <router-view />
</template>

<script setup>
import { reactive, onMounted, computed, watch } from "vue"
import { useRouter, useRoute } from "vue-router"

const props = defineProps({
    backRout: {
        type: String,
        default: ""
    },
    activeKey: {
        type: String,
        default: ""
    },
    showBack: {
        type: Boolean,
        default: false
    },
    leftExtraText: {
        type: String,
        default: "返回"
    },
    tabsList: {
        type: Array,
        default: () => []
    }
})

const state = reactive({
    activeKey: "",
    tabsList: [],
    systemTabsObj: {}
})

const router = useRouter()
const route = useRoute()
const back = () => {
    if (props.backRout) {
        router.push({ name: props.backRout })
    } else if (route.query.source) {
        router.push({ path: `/${route.query.source}` })
    }
}
const handleChangeTabs = (v) => {
    router.replace({
        path: v,
        query: { ...route.query }
    })
    state.activeKey = v
}

const initRoute = () => {
    state.tabsList = []
    const curpath = route.path
    const len = curpath.lastIndexOf("/")
    const ppath = curpath.substring(0, len)
    const allrouter = router.getRoutes().filter((item) => item.path === ppath)

    let allrouterSosn = allrouter[0]?.children || []
    allrouterSosn = allrouterSosn.filter((item) => item.meta?.title)
    state.activeKey = curpath
    state.tabsList = allrouterSosn
}

watch(
    () => props.tabsList,
    (val) => {
        if (val.length) {
            initRoute()
        }
    }
)

onMounted(async () => {
    await initRoute()
    // router.push({
    //     path: route.path,
    //     query: {
    //         ...route.query
    //     }
    // })
    // state.tabsList?.length > 1 && (state.activeKey = route.path)
})
const showBackStyle = computed(() => (props.showBack ? "0px" : "24px"))
</script>

<style lang="less" scoped>
:deep(.ant-tabs-nav) {
    padding-left: v-bind(showBackStyle);
    margin-bottom: 0;
    border-bottom: 1px solid #eee;
    line-height: 33px;
    min-height: 57px;
}

.faceLibrary_warp_pageitem {
    height: calc(100% - 57px);
}
</style>
