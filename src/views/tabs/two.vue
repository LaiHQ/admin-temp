<template>
    <div class="container">two</div>
</template>

<script setup>
import { onMounted, reactive } from "vue"

const state = reactive({})

function init() {}

onMounted(() => {
    init()
})
</script>

<style lang="less" scoped>
.container {
    position: relative;
}
</style>
