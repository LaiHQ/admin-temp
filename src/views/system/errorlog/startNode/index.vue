<template>
    <div class="startNode">startNode {{ properties }} {{ isHover }}</div>
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
    },
    isHover: {
        type: Boolean,
        default: false,
    }
});

</script>

<style lang="less" scoped>
.startNode {
    width: 100%;
    height: 100%;
    background-color: #fff;
    position: relative;
    border: 1px solid #e6e8ee;
    border-radius: 5px;
    cursor: grab;
    &:active {
        cursor: grabbing;
    }
}
</style>