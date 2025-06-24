<template>
    <a-sub-menu v-if="item.children && item.children.length" :key="item.path" :meta="item.meta">
        <template #title>
            <component :is="item.meta && item.meta.icon"></component>
            <span
                :class="{
                    menu_circular: !item.meta?.icon,
                    menu_circular__activation: $route.path == item.path
                }"
            >
                {{ item.meta?.title }}</span
            >
        </template>
        <SubMenu :item="citem" v-for="citem in item.children" :key="citem.path" />
    </a-sub-menu>
    <a-menu-item v-else :key="item.path" :meta="item.meta">
        <component :is="item.meta && item.meta.icon"></component>
        <span>{{ item.meta && item.meta.title }}</span>
    </a-menu-item>
</template>

<script>
export default {
    name: "SubMenu",
    props: {
        item: {
            type: Object,
            required: true
        }
    }
}
</script>

<style lang="less" scoped></style>
