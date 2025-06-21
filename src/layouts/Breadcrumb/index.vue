<template>
    <a-breadcrumb style="padding: 16px 0">
        <a-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="item.path">
            <router-link
                :to="{
                    path: item.path,
                    query: {
                        ...$route.query
                    }
                }"
                style="color: var(--text-color, #333)"
            >
                <home-outlined v-if="index === 0" />
                <component v-else :is="item.icon" />
                {{ item.breadcrumbName }}
            </router-link>
        </a-breadcrumb-item>
    </a-breadcrumb>
</template>

<script>
import { ref, onMounted, watch, defineComponent } from "vue"
import { useRoute, useRouter } from "vue-router"
import { HomeOutlined } from "@ant-design/icons-vue"
export default defineComponent({
    name: "Breadcrumb",
    components: {
        HomeOutlined
    },
    setup() {
        const route = useRoute()
        const router = useRouter()
        const breadcrumbList = ref([])
        const getRouterName = () => {
            const matched = route.matched.map((item) => {
                return {
                    path: item.path,
                    icon: item.meta && item.meta.icon,
                    breadcrumbName: item.meta && item.meta.title
                }
            })
            const first = matched[1]
            if (first && first.path === "/dashboard") {
                //
                matched.splice(1, 1)
            }
            breadcrumbList.value = matched
        }
        watch(
            () => {
                return router.currentRoute.value.path
            },
            () => {
                getRouterName()
            }
        )
        onMounted(() => {
            getRouterName()
        })
        return {
            breadcrumbList
        }
    }
})
</script>

<style scoped>
:deep(.ant-breadcrumb-separator) {
    color: var(--text-color, #333);
}
</style>
