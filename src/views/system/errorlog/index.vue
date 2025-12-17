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
import CustomEdge from './customEdge/index.js';

let lf = null;
const renderData = {
    // 节点数据
    nodes: [
        {
            id: '21', // 节点ID，需要全局唯一，不传入内部会自动生成一个ID
            type: 'startNode', // 节点类型，可以传入LogicFlow内置的7种节点类型，也可以注册自定义节点后传入自定义类型
            x: 500, // 节点形状中心在x轴位置
            y: 100, // 节点形状中心在y轴的位置
            text: 'text1',
            properties: {
               'isHovered':false,
               'isSelected':false,
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
        // {
        //     id: 'edge1',
        //     type: 'customEdge', // 使用自定义边类型
        //     sourceNodeId: '21',
        //     targetNodeId: '22',
        //     text: '自定义边',
        //     properties: {
        //         arrowType: 'default', // 可选: 'default', 'empty', 'half'
        //     }
        // }
    ],
}




onMounted(() => {
    const container = document.querySelector('#container');
    // 确保容器可以获得焦点
    // container.setAttribute('tabindex', '-1');
    // container.style.outline = 'none';
    
    lf = new LogicFlow({
        // 先使用 bezier 作为默认类型（自定义边基于 BezierEdge，注册后再切换）
        edgeType: 'bezier',
        container: container,
        // grid: true,
        nodeSelectedOutline:false,
        hoverOutline:false,
        hideAnchors: false,
        keyboard: {
            enabled: true
        },
        // 使用 edgeGenerator 确保新创建的边使用自定义边类型
        edgeGenerator: (sourceNode, targetNode, currentEdge) => {
            // 始终返回自定义边类型（直接返回字符串类型）
            console.log('edgeGenerator 被调用', { sourceNode: sourceNode?.type, targetNode: targetNode?.type, currentEdge });
            return 'customEdge';
        }
    })
    register(StartNodeModel, lf);
    // 注册自定义边
    lf.register(CustomEdge);
    // 设置自定义边为默认边类型（确保新创建的边使用自定义边）
    lf.setDefaultEdgeType('customEdge');
    
    // 防止重复连接的全局检查
    // 监听连接不允许事件来提示用户
    lf.on('connection:not-allowed', ({ data, msg }) => {
        console.warn('连接不允许:', msg, data)
        // 可以在这里显示提示信息给用户，比如使用 message 组件
    })
    
    lf.on('graph:rendered', ({ graphModel }) => {
        flowId.value = graphModel.flowId
        
        
    })
    
    // 监听锚点拖拽完成事件，确保新创建的边使用自定义边类型
    lf.on('anchor:drop', ({ edgeModel }) => {
        console.log('anchor:drop 事件触发', { edgeId: edgeModel?.id, edgeType: edgeModel?.type });
        if (edgeModel && edgeModel.type !== 'customEdge') {
            console.log('修改边类型为 customEdge', edgeModel.id);
            // 使用 changeEdgeType 方法修改边的类型
            lf.changeEdgeType(edgeModel.id, 'customEdge');
        }
    })
    
    // 监听边添加事件，确保新创建的边使用自定义边类型（备用方案）
    lf.on('edge:add', ({ data }) => {
        console.log('edge:add 事件触发', { edgeId: data.id, edgeType: data.type });
        // 如果边的类型不是 customEdge，则修改为 customEdge
        if (data.type && data.type !== 'customEdge') {
            console.log('在 edge:add 中修改边类型为 customEdge', data.id);
            // 使用 changeEdgeType 方法修改边的类型
            setTimeout(() => {
                lf.changeEdgeType(data.id, 'customEdge');
            }, 0);
        }
    })
    
    lf.on('custom:onBtnClick', ({ data, e }) => {
        console.log(data)
        console.log(e)
    })
    
    // 使用全局键盘事件监听作为备选方案
    const handleKeyDown = (e) => {
        // 检查是否按下了删除键
        if (e.key === 'Backspace' || e.key === 'Delete') {
            // 检查焦点是否在输入框等元素上，如果是则不处理
            const activeElement = document.activeElement;
            if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable)) {
                return;
            }
            
            // 阻止默认行为
            e.preventDefault();
            e.stopPropagation();
            
            // 检查是否在编辑文本，如果是则不删除
            const graphModel = lf.graphModel;
            if (graphModel.textEditElement) {
                return;
            }
            
            // 获取选中的元素并删除（按照 LogicFlow 内置逻辑）
            const elements = lf.getSelectElements(true);
            console.log('删除快捷键触发', elements);
            console.log('nodes:', elements.nodes);
            console.log('edges:', elements.edges);
            
            if (elements && (elements.nodes?.length > 0 || elements.edges?.length > 0)) {
                // 先清除选中状态
                lf.clearSelectElements();
                
                // 删除边
                if (elements.edges && elements.edges.length > 0) {
                    elements.edges.forEach((edge) => {
                        if (edge && edge.id) {
                            console.log('删除边:', edge.id);
                            lf.deleteEdge(edge.id);
                        }
                    });
                }
                
                // 删除节点
                if (elements.nodes && elements.nodes.length > 0) {
                    elements.nodes.forEach((node) => {
                        if (node && node.id) {
                            console.log('删除节点:', node.id);
                            lf.deleteNode(node.id);
                        }
                    });
                }
            } else {
                console.log('没有选中的元素');
            }
        }
    };
    
    // 添加全局键盘事件监听
    window.addEventListener('keydown', handleKeyDown);
    
    // 确保容器可以获得焦点，以便接收键盘事件
    container.addEventListener('click', () => {
        container.focus();
    });
    
    lf.render(renderData);
    
    // 在组件卸载时移除事件监听
    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeyDown);
        if (lf) {
            lf.destroy();
        }
    });
    
    // lf.on('node:mouseenter,node:mouseleave', ({data,e}) => {          
    //     lf.getNodeModelById(data.id).setProperties({
    //         isHovered: e.type === 'mouseover',
    //     })
    // })

    lf.zoom(0.5);


    



    // 点击节点平滑移动到画布中心
    lf.on('node:click', ({ data }) => {
        const nodeModel = lf.getNodeModelById(data.id);
        if (!nodeModel) return;
        
        // 获取画布容器的尺寸
        const container = lf.container;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // 获取当前画布的变换信息（缩放和平移）
        const transformModel = lf.graphModel.transformModel;
        const currentScale = transformModel.SCALE_X; // 假设 SCALE_X 和 SCALE_Y 相同
        const currentTranslateX = transformModel.TRANSLATE_X;
        const currentTranslateY = transformModel.TRANSLATE_Y;
        
        // 获取节点在画布坐标系中的位置
        const nodeX = nodeModel.x;
        const nodeY = nodeModel.y;
        
        // 计算节点当前在屏幕上的位置
        const nodeScreenX = nodeX * currentScale + currentTranslateX;
        const nodeScreenY = nodeY * currentScale + currentTranslateY;
        
        // 计算画布中心在屏幕上的位置
        const centerScreenX = (containerWidth-500) / 2;
        const centerScreenY = containerHeight / 2;
        
        // 计算需要平移的总距离（屏幕坐标系）
        const totalDeltaX = centerScreenX - nodeScreenX;
        const totalDeltaY = centerScreenY - nodeScreenY;
        
        // 动画参数
        const duration = 500; // 动画时长（毫秒）
        const startTime = performance.now();
        let lastProgress = 0;
        
        // 动画函数
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);            
            
            // 使用缓动函数（ease-in-out）
            const easeProgress = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            
            // 计算当前帧应该移动的相对距离
            const deltaProgress = easeProgress - lastProgress;
            const deltaX = totalDeltaX * deltaProgress;
            const deltaY = totalDeltaY * deltaProgress;
            
            // 更新画布平移（相对移动）
            lf.translate(deltaX, deltaY);
            
            // 更新上一帧的进度
            lastProgress = easeProgress;
            
            // 如果动画未完成，继续下一帧
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        // 开始动画
        requestAnimationFrame(animate);
    });
    
    
});
</script>

<style lang="less" scoped>
#container {
    width: 100vw;
    height: 100vh;
}

:deep(.custom-anchor) {
    opacity: 1 !important;
    visibility: visible !important;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    
}


</style>
