<template>
        <div @click.stop="handleClick($event)" class="anchor" :style="{ width: width + 'px', height: height + 'px' }">
            
        </div>

       
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
    isHovered: {
        type: Boolean,
        default: false,
    },
    onBtnClick: {
        type: Function,
        default: () => {},
    },
});

const handleClick = (e) => {
    console.log('click', e);
    // if (props.onBtnClick) {
    //     props.onBtnClick(e);
    // }
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
    // &:hover{
    //     width: 16px !important;
    //     height: 16px !important;
    // }
    // &.is-hovered {
    //     width: 16px !important;
    //     height: 16px !important;
    // }
}


</style>