<template>
    <div class="custom-node" :class="{ 'is-hovered': isHovered, 'is-selected': isSelected }" @click="handleBtnClick(1)">
        customNode 

        {{ isHovered }} {{ isSelected }}
    </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch, watchEffect } from 'vue';

const props = defineProps({    
    properties:{
        type: Object,
        default: () => ({}),
    },
    isHovered: {
        type: Boolean,
        default: false,
    },
    isSelected: {
        type: Boolean,
        default: false,
    },
    onBtnClick: {
        type: Function,
        default: () => {},
    },
});

const handleBtnClick = (i) => {
    if (props.onBtnClick) {
        props.onBtnClick(i);
    }
};

</script>

<style lang="less" scoped>
.custom-node {
    width: 100%;
    height: 100%;
    background-color: #fff;
    position: relative;
    border: 1px solid #e6e8ee;
    border-radius: 5px;
    cursor: grab;
    padding: 0 10px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    transition: all 0.2s;
    &:active {
        cursor: grabbing;
    }

    &.is-hovered {
        background-color: #e6f7ff;
    }
    &.is-selected {
        border-color: #1890ff;
    }
}
</style>