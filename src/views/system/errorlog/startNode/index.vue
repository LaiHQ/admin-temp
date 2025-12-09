<template>
    <div class="startNode">startNode {{ properties }}</div>
</template>

<script setup>
import { ref,onMounted,reactive } from 'vue';

const props = defineProps({
    model: {
        type: Object,
        default: () => ({}),
    },
    properties:{
        type: Object,
        default: () => ({}),
    }
    
});

</script>

<style lang="less" scoped>
.startNode {
    width: 100%;
    height: 100%;
    background-color: #fff;
    position: relative;
    border: 1px solid #000;
}
</style>