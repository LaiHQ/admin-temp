<template>
    <!-- eslint-disable  -->
    <div style="padding-bottom: 10px;">
        <ScrollX ref="scrollXRef">
            <a-space :size="0">
                <template v-for="(tag, index) in tagList" :key="tag.key">
                    <a-dropdown :trigger="['contextmenu']">
                        <a-tag ref="tagRefs" :class="['yd_tag', { activeClass: tag.key === activeTag?.key }]" :key="tag.key" :closable="tag.key != 'check' && tagList.length > 1" @click="(e) => handleTagClick(e, tag.key)" @close.prevent="close(index)" @contextmenu.prevent="handleContextMenu(tag)">
                            {{ tag.title }}
                        </a-tag>
                        <template #overlay>
                            <!-- <ContextMenu :ctag="ctag" /> -->
                        </template>
                    </a-dropdown>
                </template>
            </a-space>
        </ScrollX>
    </div>
</template>

<script setup>
// eslint-disable
import { computed, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import useStore from "@/store"
// import ContextMenu from "./ContextMenu.vue"
import ScrollX from "./ScrollX.vue"
const route = useRoute()
const router = useRouter()
const scrollXRef = ref(null)
const tagRefs = ref([])
const store = useStore()
const ctag = ref({})

const close = async (index) => {
    if (store.user.tags[index].key === route.name) {
        let item = store.user.tags[index + 1] || store.user.tags[index - 1]
        if (item.key === "check") {
            item = store.user.tags[index - 1] || store.user.tags[index + 1]
        }
        if (item) {
            router.push({ name: item.key })
            store.user.tags.splice(index, 1)
        }
    } else {
        store.user.tags.splice(index, 1)
    }
}

const tagList = computed(() => {
    return store.user.tags.map((i) => {
        return { title: i.title, key: i.key }
    })
})

const activeTag = computed(() => {
    return store.user.tags.find((i) => i.key === route.name)
})


watch(
    () => route.path,
    () => {
        if (route.name === "redirect" || route.name === "404" || route.name === "no-auth") {
            return false
        }
        const index = store.user.tags.findIndex((i) => i.key === route.name)
        const item = { title: route.meta.title, key: route.name }
        if (index === -1) {
            if (store.user.tags.length > 10) {
                store.user.tags.splice(1, 1)
                store.user.tags.push(item)
            } else {
                store.user.tags.push(item)
            }
        } else {
            store.user.tags.splice(index, 1, item)
        }
    },
    { immediate: true }
)
const handleTagClick = (e, path) => {
    router.push({ name: path })
}
// 右击菜单
async function handleContextMenu(tagItem) {
    ctag.value = tagItem
}
</script>

<style lang="less" scoped>
.yd_tag {
    height: 26px;
    padding: 0px 8px 0px 8px;
    background-color: #fff;
    line-height: 24px;
    border-radius: 4px;
    cursor: pointer;

    :deep(.ant-tag-close-icon) {
        padding-left: 4px;
    }
}

.activeClass {
    color: #fff;
    background-color: @primary-color;

    :deep(.ant-tag-close-icon) {
        svg {
            color: #fff;
        }
    }
}
</style>
