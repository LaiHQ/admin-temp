<template>
    <div id="logicFlow" ref="logicFlowRef"></div>
    <TeleportContainer :flow-id="flowId" />
</template>
<script setup>
import { ref, onMounted, reactive, onUnmounted, nextTick, watch } from 'vue'
import LogicFlow, { EventType, BezierEdge } from '@logicflow/core'
import '@logicflow/core/es/index.css'
import { register, getTeleport } from '@logicflow/vue-node-registry'
import { MiniMap } from "@logicflow/extension";
import { Dagre } from "@logicflow/layout";
import { miniMapOptions,defaultGraphData,createNodeOptions } from './config.js'
// import CustomEdgeModel from '@/views/workflow/components/customEdge/model.js'
import createCustomNode from './customNode/model.js'
import { v4 as uuidv4 } from 'uuid';
import { message } from 'ant-design-vue';
import { ReverseConnectionPolicy } from './plugins.js'


const TeleportContainer = getTeleport()
const emit = defineEmits(['openDebug', 'openNodeForm', 'zoomChange', 'historyChange', 'nodeDelete','nodeAdd','openNodeModal'])

const props = defineProps({
    customNodes: {
        type: Array,
        default: () => []
    }
})

const logicFlowRef = ref(null)
const flowId = ref('')
let lfRef = ref(null)
let lf = reactive(null)

// 画布存在的节点总数 map
const nodeMapTotal = {}



// 关闭节点 锚点 菜单
function closeNodeMenu(id) {
    const node = lf.getNodeDataById(id);
    lf.setProperties(id, {
        ...node.properties,
        showNodeMenu: false,
    });
}

let edgeTimer = null
// 关闭边 菜单
function closeEdgeMenu(id, callback) {
    clearTimeout(edgeTimer)
    const edge = lf.getEdgeDataById(id);
    lf.setProperties(id, {
        ...edge.properties,
        showNodeMenu: false,
    });
    edgeTimer = setTimeout(() => {
        callback?.()
    }, 100)
}

// 打开边 菜单  
function openEdgeMenu(id) {
    const edge = lf.getEdgeDataById(id);
    lf.setProperties(id, {
        ...edge.properties,
        showNodeMenu: true,
    });
    return false
}


// 缩放动画
async function zoomWithAnimation(targetScale, centerPoint, duration = 800) {
  return new Promise((resolve) => {
    const transform = lf.getTransform();
    const startScale = transform.SCALE_X;
    const startTime = Date.now();
    
    // 计算缩放变化量
    const scaleDelta = targetScale - startScale;
    
    function animate() {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用缓动函数（easeOutCubic）
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      // 计算当前缩放值
      const currentScale = startScale + scaleDelta * easeProgress;
      
      // 应用缩放
      centerPoint.length > 0 ? lf.zoom(currentScale, centerPoint) : lf.zoom(currentScale);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // 动画完成，确保最终缩放值精确
        centerPoint.length > 0 ? lf.zoom(targetScale, centerPoint) : lf.zoom(targetScale);
        resolve();
      }
    }
    
    requestAnimationFrame(animate);
  });
}



function initLogicFlow() {
    lf = new LogicFlow({
        container: logicFlowRef.value,
        themeMode: 'radius',
        edgeType: 'bezier',
        plugins: [MiniMap, Dagre, ReverseConnectionPolicy],
        pluginsOptions: {
            miniMap: miniMapOptions,
        },
        history: true,
        animationConfig: {
            node: true,
            edge: true,
        },
        background: {
            backgroundColor: '#f9fafd',
            backgroundOpacity: 1
        },
        grid: {
            size: 20,
            visible: true,
            type: 'dot', //mesh
            config: {
                color: '#0009', // 设置网格的颜色
                thickness: 1,  // 设置网格线的宽度
            },
        },
        keyboard: {
            enabled: true,
        },
        stopScrollGraph: true, // 禁止鼠标滚动画布
        //stopZoomGraph: true, // 禁止缩放画布
        adjustEdge: false, // 禁止调整边
        hoverOutline: false, // 禁用节点和边的 hover 边框
        nodeSelectedOutline: false, // 禁用节点选中时的外框
        edgeSelectedOutline: false, // 禁用边选中时的外框
        nodeTextEdit: false, // 禁止节点文本编辑（禁止双击编辑）
        edgeTextEdit: false, // 禁止边文本编辑（禁止双击编辑）
        style: {
            anchor: {
                stroke: '#1677ff',      // 锚点边框颜色
                fill: '#fff',     // 锚点填充颜色
                r: 5,                // 锚点半径
                hover: {
                    fill: '#1677ff',   // 鼠标悬停时填充颜色
                    stroke: '#1677ff', // 鼠标悬停时边框颜色
                    r: 7               // 鼠标悬停时半径
                }
            },
            grid: {
                type: 'dot',
                size: 20,
                color: '#0009', // 设置网格的颜色
                thickness: 1,  // 设置网格线的宽度
            }
        }
    })
    lfRef.value = lf

    lf.setTheme({
        bezier: {
            stroke: "#b1b1b7",
            strokeWidth: 2,
            hoverStroke: "#ff9900",
            selectedStroke: "#1677ff"
        },
        edgeAnimation: {
            stroke: "#1677ff"
        },
        anchorLine: {
            stroke: "rgba(22, 119, 255, 0.7)", // #1677ff 稍微淡一点
            strokeWidth: 2,
            strokeDasharray: '3,2'
        }
    });
    // 画布渲染数据后触发
    lf.on('graph:rendered', ({ graphModel }) => {
        flowId.value = graphModel.flowId
    })
    // 节点拖拽事件
    lf.on('node:drag', ({ data, e }) => {
        closeNodeMenu(data.id)
        // 关闭边 菜单
        // console.log('节点拖拽事件:', data)

        // 关闭边 菜单
        const edges = lf.getNodeEdges(data.id);
        if (edges.length > 0) {
            edges.forEach((edge) => {
                closeEdgeMenu(edge.id)
            })
        }
    })
    // 缩放事件
    lf.on('graph:transform', (data) => {
        if (data.type == 'zoom') {
            emit('zoomChange', Number(data.transform.SCALE_X * 100).toFixed(0))
        }
        closeAllNodeMenu()
    })

    lf.on('node:click', (data) => {
        console.log('节点点击事件:', data)
        // 如果选中节点，则移动到右边500px的中心位置
        if (data.isSelected) {            
            moveNodeToRightCenter(data.data.id)
            emit('openNodeForm', data.data)
        }
    })

    // 节点点击事件
    lf.on('custom:node-click', ({ id, type, drag, item }) => {
        const edges = lf.getNodeEdges(id);
        const node = lf.getNodeDataById(id);
        if (edges.length > 0) {
            edges.forEach((edge) => {
                closeEdgeMenu(edge.id)
            })
        }

        if (type == 'drag') {
            handleDragNode(drag.type, drag.name)
            return
        }
        if (type == 'on-debug') {
            emit('openDebug', node)
        }        

        if(type=='on-copy'){
           const cloneNode = lf.cloneNode(id)
           console.log('cloneNode', cloneNode)
        }
        // 
        closeNodeMenu(id)

        if(type=='on-delete'){
            lf.deleteNode(id)
            nodeMapTotal[node.type] = (nodeMapTotal[node.type] || 0) - 1
        }
        if(type=='on-add'){
            const options = createNodeOptions({
                type: item.type,
                x: node.x + node.properties.width + 100,
                y: node.y,
                text: item.name,
            },{
                title: item.name + nodeMapTotal[item.type],
                icon: item?.icon || '',
            })
            const newNode = lf.addNode(options)
            // 添加边,连接到左边节点
            lf.addEdge({
                sourceNodeId: node.id,
                sourceAnchorId: 'right',
                targetNodeId: newNode.id,
                targetAnchorId: 'left',
            })
            // 选中新节点
            lf.selectElementById(newNode.id)
            // 移动新节点到右边中心位置
            moveNodeToRightCenter(newNode.id)
            // 打开表单
            emit('openNodeForm', newNode)
        }
    })
    // 锚点点击事件
    lf.on('custom:anchor-click', ({ id, type, flag }) => {
        // console.log('锚点点击事件:',data)
        const node = lf.getNodeDataById(id);
        lf.setProperties(id, {
            ...node.properties,
            showNodeMenu: flag,
        });
        // 关闭边 菜单
        const edges = lf.getNodeEdges(id);
        if (edges.length > 0) {
            edges.forEach((edge) => {
                closeEdgeMenu(edge.id)
            })
        }
    })
    // 节点拖拽开始事件
    lf.on('custom:node-drag-start', (id) => {
        console.log('节点拖拽开始事件:', id)
    })
    // 节点拖拽结束事件
    lf.on('custom:node-drag-end', (id) => {
        console.log('节点拖拽结束事件:', id)
    })

    // 边添加点击事件
    lf.on('custom:edge-click', (id) => {
        const edge = lf.getEdgeDataById(id);
        if (edge.properties.showNodeMenu) {
            closeEdgeMenu(id)
            return
        }
        openEdgeMenu(id)
        // 关闭所有节点 nodemenu
        const nodes = lf.graphModel.nodes;
        if (nodes.length > 0) {
            nodes.forEach((node) => {
                closeNodeMenu(node.id)
            })
        }
    })

    // 画布
    lf.on('blank:click,blank:contextmenu,blank:dragstart', () => {
        closeAllNodeMenu()
    })
    // 边插入事件
    lf.on('custom:edge-insert', async (data) => {
        // 
        // 关闭原来的边 menu
        await closeEdgeMenu(data.edge_id)
        const item = data.data;

        console.log('边插入事件:', data)

        // 1.找到这个边的起始节点和结束节点
        const edge = lf.getEdgeDataById(data.edge_id);
        const startNode = lf.getNodeDataById(edge.sourceNodeId);
        const endNode = lf.getNodeDataById(edge.targetNodeId);
        console.log('起始节点:', startNode)
        console.log('结束节点:', endNode)

        console.log('原边长度:', edge)

        // TODO：待优化 挤在一起
        const x = edge.startPoint.x + (edge.endPoint.x - edge.startPoint.x) / 2
        const y = edge.startPoint.y + (edge.endPoint.y - edge.startPoint.y) / 2
        // 2.在这个边的中间插入新节点的节点的


        // debugger
        nodeMapTotal[item.type] = (nodeMapTotal[item.type] || 0) + 1

        const options = createNodeOptions({
            type: item.type,
            x: x,
            y: y,
            text: item.name,
        },{
            title: item.name + nodeMapTotal[item.type],
            icon: item?.icon || '',
        })
        const newNode = lf.addNode(options)
        lf.addEdge({
            sourceNodeId: startNode.id,
            targetNodeId: newNode.id,
        })
        lf.addEdge({
            sourceNodeId: newNode.id,
            targetNodeId: endNode.id,
        })
        // 3.选择新节点
        lf.selectElementById(newNode.id)

        // 4.移动居中节点       
        moveNodeToRightCenter(newNode.id)

        // 5.打开表单
        emit('openNodeForm', newNode)

        // 6.删除原来的边
        setTimeout(() => {
            lf.deleteEdge(data.edge_id)            
        }, 100)

    })

    // 历史记录改变事件
    lf.on('history:change', ({ data }) => {
        emit('historyChange', data)
    })
    // 节点拖拽结束事件
    lf.on('node:dnd-add', ({ data, e }) => {        
        if(['component'].includes(data.type)){
            lf.deleteNode(data.id)
            emit('openNodeModal', data,(opt)=>{
                console.log('opt', opt)
                lf.addNode(data)
            })
        }
    })
}

// TODO：待优化
// 如果已经节点已经在画布中显示，则不进行移动
async function moveNodeToRightCenter(nodeId, config = {}) {
        const nodeModel = lf.getNodeModelById(nodeId);
        if (!nodeModel) return;
        lf.zoom(0.85,[nodeModel.x,nodeModel.y]);
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
}

// 关闭所有节点和边 nodemenu
function closeAllNodeMenu() {
    // 关闭所有节点 nodemenu
    const nodes = lf.graphModel.nodes;
    if (nodes.length > 0) {
        nodes.forEach((node) => {
            closeNodeMenu(node.id)
        })
    }
    // 关闭所有边
    const edges = lf.graphModel.edges;
    if (edges.length > 0) {
        edges.forEach((edge) => {
            closeEdgeMenu(edge.id)
        })
    }
}

watch(() => props.customNodes, (newVal) => {
    newVal.forEach(item => {
        register(createCustomNode(item.type), lf)
        nodeMapTotal[item.type] = 1
    })

})

function initNodes() {
    register(createCustomNode('start'), lf)
    register(createCustomNode('end'), lf)
    // register(CustomEdgeModel, lf)
}

function renderGraph(data) {
    // 渲染逻辑流
    lf.render(data)
    lf.translateCenter();
    // 更新缩放比例
    emit('zoomChange', Number(lf?.graphModel.transformModel.SCALE_X * 100).toFixed(0))
}

function handleDragNode(item) {
    console.log('handleDragNode', item)
    const options = createNodeOptions({
        type: item?.type,
        text: item.name,
    },{
        title: item.name + nodeMapTotal[item.type],
        icon: item?.icon || '',
        title: item.name + nodeMapTotal[item.type],
    })
    lf?.dnd.startDrag(options)
    nodeMapTotal[item.type] = (nodeMapTotal[item.type] || 0) + 1
}

// 快捷键
function handleKeyDown(e) {
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
            // lf.clearSelectElements();

            // 删除边
            if (elements.edges && elements.edges.length > 0) {
                elements.edges.forEach((edge) => {
                    if (edge && edge.id) {
                        console.log('删除边:', edge.id);
                        closeEdgeMenu(edge.id, () => {
                            lf.deleteEdge(edge.id);
                        })

                    }
                });
            }

            // 删除节点
            if (elements.nodes && elements.nodes.length > 0) {
                elements.nodes.forEach((node) => {
                    if (node && node.id) {
                        console.log('删除节点:', node);
                        if(node.type === 'start' || node.type === 'end') {                            
                            return message.warning('系统节点不允许删除');
                        }else{
                            lf.deleteNode(node.id);
                            nodeMapTotal[node.type] = (nodeMapTotal[node.type] || 0) - 1
                            if(nodeMapTotal[node.type] < 1){
                                nodeMapTotal[node.type] = 1
                            }
                            emit('nodeDelete', node.id);
                        }
                    }
                });
            }
        } else {
            console.log('没有选中的元素');
        }
    }
}


function handleResize() {    
    lf.resize();   
}

onMounted(() => {
    initLogicFlow()
    // 初始化节点
    initNodes()
    // 渲染画布
    renderGraph(defaultGraphData)

    window.addEventListener('keydown', handleKeyDown);
    //
    nextTick(() => {
        console.log('nextTick')
        window.addEventListener('resize', handleResize)
    })
})

onUnmounted(() => {
    lf?.destroy()
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('resize', handleResize)
})

function showMiniMap() {
    lf?.extension.miniMap?.show(16, 16)
}

function hideMiniMap() {
    lf?.extension.miniMap?.hide()
}

// 适配视图
function handleAdaptiveView(key) {
    const currentZoom = lf?.graphModel.transformModel.SCALE_X
    switch (key) {
        case 'adaptive':
            logicFlowRef.value.lf?.fitView?.()
            lf?.zoom(1)
            // lf?.translateCenter?.()
            break;
        case 'in':
            lf?.zoom(currentZoom + 0.1)
            break;
        case 'out':
            lf?.zoom(currentZoom - 0.1)
            break;
        case 200:
            lf?.zoom(2)
            break;
        case 100:
            lf?.zoom(1)
            break;
        case 50:
            lf?.zoom(0.5)
            break;
        default:
            break;
    }
    return Number(lf?.graphModel.transformModel.SCALE_X * 100).toFixed(0)
}

// 优化布局
function handleOptimizeLayout() {
    lf?.extension.dagre.layout({
        rankdir: 'LR',
        align: 'UL',
        nodesep: 60,     // 节点间距
        ranksep: 20,      // 层级间距
        ranker: 'longest-path'
    });
    lf.fitView();
    lf?.zoom(1)
    lf?.translateCenter?.()    
    emit('zoomChange', Number(lf?.graphModel.transformModel.SCALE_X * 100).toFixed(0))
}

// 更新节点属性
function updateNodeProperties(id, key, value) {
    lf.setProperties(id, {
        ...lf.getNodeDataById(id).properties,
        [key]: value
    })
}

// 获取节点的上一个节点
function getAllPrevNode(id) {
   if(!id) {
    console.warn('getAllPrevNode id is required', id)
    return []
   }
   const allEdges = lf.getGraphRawData().edges;
   const previousNode= allEdges
        .filter(edge => edge.targetNodeId === id)
        .map(edge => lf.getNodeDataById(edge.sourceNodeId));    
    return previousNode
}

defineExpose({
    lf: lfRef,
    handleDragNode: handleDragNode,
    showMiniMap,
    hideMiniMap,
    handleAdaptiveView,
    handleOptimizeLayout,
    updateNodeProperties,
    getAllPrevNode,

})
</script>
<style scoped lang="less">
#logicFlow {
    width: 100vw;
    height: 100vh;

    :deep(.lf-mini-map) {
        border: 1px solid #e6e8ee;
        border-radius: 4px;
        overflow: hidden;
        top: auto !important;
        bottom: 75px;
    }

    :deep(.custom-anchor) {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
</style>
