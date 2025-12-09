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
    width: 100%;
    height: 100%;
    border: 1px solid  #1890ff;
    border-radius: 50%;
    border: 2px solid #fff;
    cursor: pointer;
    position: relative;
    box-sizing: border-box;
    transition: all 0.2s;
    background-color: #fff;
}

.anchor:hover {
    border: 1px solid  #1890ff;
    transform: scale(1.2);
}

.incomming-anchor {
    border: 1px solid  #1890ff;
}

.incomming-anchor:hover {
    border: 1px solid  #1890ff;
}

.outgoing-anchor {
    border: 1px solid  #1890ff;
}

.outgoing-anchor:hover {
    border: 1px solid  #1890ff;
}
</style>