<template>
    <div id="container"></div>
    <TeleportContainer :flow-id="flowId"/>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue';
import LogicFlow from '@logicflow/core';
import "@logicflow/core/lib/style/index.css";
 import { register, getTeleport } from '@logicflow/vue-node-registry'
 const TeleportContainer = getTeleport()
 const flowId = ref('')
import StartNodeModel from './startNode/index.js';

let lf = null;
const renderData = {
    // 节点数据
    nodes: [
        {
            id: '21', // 节点ID，需要全局唯一，不传入内部会自动生成一个ID
            type: 'startNode', // 节点类型，可以传入LogicFlow内置的7种节点类型，也可以注册自定义节点后传入自定义类型
            x: 500, // 节点形状中心在x轴位置
            y: 100, // 节点形状中心在y轴的位置
            text: 'Start',
            properties: {
               'a':123
            }
        },
        {
            id: '22',
            type: 'rect',
            x: 700,
            y: 200,
            text: 'rect',
            properties: {
                'b':456
            }
        }
    ],
    // 边数据
    edges: [
        
    ],
}




onMounted(() => {
    lf = new LogicFlow({
        container: document.querySelector('#container'),
        
    })
    register(StartNodeModel, lf);
    
    lf.on('graph:rendered', ({ graphModel }) => {
        flowId.value = graphModel.flowId
        
    })
    
    
    lf.render(renderData);
    
    
});

onUnmounted(() => {
    lf.destroy();
});
</script>

<style lang="less" scoped>
#container {
    width: 100vw;
    height: 100vh;
}

:deep(.custom-anchor-container){
    border: 1px solid #000;
}

/* 确保锚点一直显示 */
:deep(.lf-node-anchor) {
    opacity: 1 !important;
    visibility: visible !important;
    display: block !important;
}

:deep(.custom-anchor) {
    opacity: 1 !important;
    visibility: visible !important;
    display: block !important;
}


</style>
