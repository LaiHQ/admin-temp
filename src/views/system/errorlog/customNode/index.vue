<template>
    <div class="custom-node-container">
        <div class="custom-node" :class="{
            'is-hovered': isHovered, 
            'is-selected': isSelected,
            'custom-node-description-warp': properties.description
        }" >
            <a-flex class="node-header" align="center" justify="space-between"
                :style="{ height: properties.description ? 'auto' : '100%' }">

                <a-flex align="center" gap="small" style="display: flex;
        align-items: center;">
                    <div class="node-icon" :style="{ backgroundImage: `url(${properties.icon})` }" />
                    <div class="node-name">{{ properties.title }} </div>
                </a-flex>


                <a-flex align="center" gap="small">
                    <a-tooltip placement="top" :arrow="false" v-model:open="showDebugTooltip"
                        v-if="properties.showDebug">
                        <template #title>
                            <span>{{ properties.debugTip || '调试' }}</span>
                        </template>
                        <!--  -->
                        <a-button @click.stop="handleBtnClick('on-debug')" type="text"
                            style="padding: 0 3px;color: rgba(38, 36, 76, 0.65);">
                            <PlayCircleOutlined />
                        </a-button>
                    </a-tooltip>
                    <a-dropdown placement="bottomRight" trigger="click" :arrow="false" v-model:open="showMoreMenu"
                        v-if="properties.showMore">
                        <a-button  type="text" style="padding: 0 3px;color: rgba(38, 36, 76, 0.65);" @click.stop>
                            <EllipsisOutlined />
                        </a-button>
                        <template #overlay>
                            <a-menu @click="({ key }) => handleBtnClick(key)">
                                <a-menu-item v-for="(item, index) in properties.moreMenu" :key="item.key"
                                    :disabled="item.disabled">
                                    <a href="javascript:;"
                                        :style="item.color ? { color: item.disabled ? '#ccc' : item.color } : {}">
                                        <component :is="iconComponent(item.icon)" /> {{ item.text }}
                                    </a>
                                </a-menu-item>
                            </a-menu>
                        </template>
                    </a-dropdown>
                </a-flex>
            </a-flex>
            <!--  -->
            <div class="node-description">{{ properties.description }} </div>

            <div  class="condition-warp" >                
                <div  v-for="item in properties.config.condition" style="background-color: #eee;padding: 5px 3px;margin-top: 5px;font-size: 12px;border-radius: 5px;position: relative;">{{ item.title }}
                    <div class="node-anchor node-anchor-right" @click.stop :class="{ 'is-open': properties.showNodeMenu }">
                            <PlusOutlined class="icon" />
                        </div>
                </div>
            </div>
            <!-- 锚点这里只是样式，实际的锚点逻辑在model.js中 -->
            <div class="node-anchor node-anchor-top" v-if="properties.anchors.includes('top')">
                <PlusOutlined class="icon" />
                <a-popover  placement="right" trigger="click"
                v-model:open="properties.showNodeMenu" :arrow="false">
                <template #content>
                    <div style="width: 200px;">
                        <!-- <NodeMenu @drag="handleDragNode" @ok="handleOk" /> -->
                    </div>
                </template>
                <div class="node-anchor node-anchor-right" @click.stop :class="{ 'is-open': properties.showNodeMenu }">
                    <PlusOutlined class="icon" />
                </div>
            </a-popover>
            </div>
            <a-popover v-if="properties.anchors.includes('right') && properties.config.condition.length == 0" placement="right" trigger="click"
                v-model:open="properties.showNodeMenu" :arrow="false">
                <template #content>
                    <div style="width: 200px;">
                        <!-- <NodeMenu @drag="handleDragNode" @ok="handleOk" /> -->
                    </div>
                </template>
                <div class="node-anchor node-anchor-right" @click.stop :class="{ 'is-open': properties.showNodeMenu }">
                    <PlusOutlined class="icon" />
                </div>
            </a-popover>

            <div class="node-anchor node-anchor-left" v-if="properties.anchors.includes('left')">
                <PlusOutlined class="icon" />
            </div>
            <div class="node-anchor node-anchor-bottom" v-if="properties.anchors.includes('bottom')">
                <PlusOutlined class="icon" />
            </div>
        </div>
    </div>

</template>

<script setup>
import { ref, onMounted, reactive, watch, computed } from 'vue';
import { PlusOutlined, PlayCircleOutlined, EllipsisOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons-vue';
// import NodeMenu from '@/views/workflow/components/nodeMenu/index.vue'
const iconComponent = computed(() => {
    return (icon) => {
        const iconMap = {
            CopyOutlined,
            DeleteOutlined,
        }
        return iconMap[icon]
    }
})

const showDebugTooltip = ref(false)
const showMoreMenu = ref(false)
const props = defineProps({
    properties: {
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
    isDragging: {
        type: Boolean,
        default: false,
    },
    onNodeClick: {
        type: Function,
        default: () => { },
    },
    id: {
        type: String,
        default: '',
    }
});

watch(() => props.isDragging, (newVal) => {
    if (newVal) {
        // console.log('isDragging', newVal)
        showDebugTooltip.value = false
        showMoreMenu.value = false
    }
})

const handleDragNode = (type, name) => {
    console.log('handleDragNode', type, name);
    props.onNodeClick({
        type: 'drag',
        id: props.id,
        drag: {
            type,
            name
        },
    });
}

const handleOk = (data) => {
    // console.log('handleOk', data);
    props.onNodeClick({
        type: 'on-add',
        id: props.id,
        item: data,
    });
}

const handleBtnClick = (type) => {
    if (props.onNodeClick) {
        // console.log(type)
        props.onNodeClick({
            id: props.id,
            type,
        }, () => {
            showMoreMenu.value = false
        });
    }
};

</script>

<style lang="less" scoped>
.custom-node-container {
    width: 100%;
    height: 100%;
    padding: 8px;
    // background-color: red;
    box-sizing: border-box;
}



.custom-node {
    width: 100%;
    height: 100%;
    background-color: #fff;
    position: relative;
    border: 1px solid #e6e8ee;
    border-radius: 5px;
    cursor: grab;
    padding: 0 12px;
    box-sizing: border-box;
    transition: all 0.2s;
    position: relative;
    // &:active {
    //     cursor: grabbing;
    // }

    &:hover{
        
    }

    .node-header {
        display: flex;
        align-items: center;
    }

    .node-description {
        width: 100%;
        font-size: 12px;
        color: #666;
        line-height: 1.5;
        overflow: hidden;
        text-overflow: ellipsis;
        -webkit-line-clamp: 2;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        word-break: break-all;

    }

    &.is-hovered {
        // background-color: #e6f7ff;
        .node-anchor {
            width: 16px;
            height: 16px;
        }

        .node-anchor-left {
            left: -9px;
            // background-color: #1677ff;

            .icon {
                // display: block;
            }
        }

        .node-anchor-right {

            right: -9px;
            background-color: #1677ff;

            

            .icon {
                display: block;
            }
        }

        .condition-warp{
                .node-anchor-right{
                    right: -21px;
                }
            }

        .node-anchor-top {
            top: 0px;
            margin-left: -4px;
            background-color: #1677ff;

            .icon {
                display: block;
            }
        }

        .node-anchor-bottom {
            bottom: -16px;
            margin-left: -4px;
            background-color: #1677ff;

            .icon {
                display: block;
            }
        }
    }

    &.is-selected {
        border-color: #1677ff;
    }



    .node-anchor {
        width: 10px;
        height: 10px;
        // border: 1px solid #1677ff;
        border-radius: 50%;
        position: absolute;
        background-color: #fff;
        z-index: 99;
        transform: translate(0, -50%);
        cursor: pointer;
        z-index: 999;
        box-sizing: border-box;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2px;

        .icon {
            font-size: 10px;
            color: #fff;
            display: block;
            // background-color: #1677ff;
            border-radius: 50%;
            display: none;
        }
    }

    .node-anchor-left {
        left: -6px;
        top: 50%;
    }

    .node-anchor-right {
        right: -6px;
        top: 50%;
    }

    .node-anchor-top {
        top: 0px;
        left: 50%;
    }

    .node-anchor-bottom {
        bottom: -10px;
        left: 50%;
    }

    .node-icon {
        width: 18px;
        height: 18px;
        display: block;
        background-repeat: no-repeat;
        background-size: 18px 18px;
    }

    .node-name {
        font-size: 12px;
        user-select: none;
        font-weight: bold;
        color: rgba(38, 36, 76, 0.88);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 120px;
    }

    .is-open {
        right: -9px;
        width: 16px;
        height: 16px;
        background-color: #1677ff;

        .icon {
            display: block;
        }
    }
}

.custom-node-description-warp {
    display: flex;
    flex-flow: column;
    justify-content: center;
}

.condition-warp{
    .node-anchor-right{
        right: -17px;
    }
}
</style>
