<template>
        <div @click.stop="handleClick" class="anchor" :class="className" :style="{ width: width + 'px', height: height + 'px' }"></div>
</template>

<script setup>
import { ref,onMounted,reactive } from 'vue';

const props = defineProps({   
    width: {
        type: Number,
        default: 10,
    },
    height: {
        type: Number,
        default: 10,
    },
    className: {
        type: String,
        default: '',
    },
});

const handleClick = () => {
    console.log('click');
}
</script>

<style lang="less" scoped>
.anchor {   
    border-radius: 50%;
    border: 1px solid  #1890ff;
    cursor: pointer;
    position: relative;
    box-sizing: border-box;
    transition: all 0.2s;
    background-color: #fff;
    &:hover{
        width: 16px !important;
        height: 16px !important;
    }
}


</style>