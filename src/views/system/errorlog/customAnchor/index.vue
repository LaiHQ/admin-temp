<template>
    <div @click.stop="handleClick" class="anchor" :style="{ width: width + 'px', height: height + 'px' }">
        
    </div>
</template>

<script setup>
import { ref,onMounted,reactive } from 'vue';

const flag = ref(false)

const props = defineProps({   
    width: {
        type: Number,
        default: 10,
    },
    height: {
        type: Number,
        default: 10,
    },
    type: {
        type: String,
        default: 'right',
    },
    onAnchorClick: {
        type: Function,
        default: () => {},
    },
    id: {
        type: String,
        default: '',
    },
});

const handleClick = (e) => {
    flag.value = !flag.value
    if (props.onAnchorClick) {
        props.onAnchorClick({
            type: props.type, 
            id: props.id,
            event: e,
            flag: flag.value,
        });
    }
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
