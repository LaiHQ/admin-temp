<template>
    <router-view v-slot="{ Component, route }">
        <transition :enter-active-class="route.meta?.transition || 'animate__animated animate__fadeIn'">
            <component :is="Component" :key="route.path" />
        </transition>
    </router-view>
</template>

<script setup>
console.log(import.meta.env)
</script>

<style lang="less" scoped>
.footer {
    position: absolute;
    color: red;
}
</style>
