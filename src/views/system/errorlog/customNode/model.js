import { HtmlNode, HtmlNodeModel, h } from "@logicflow/core"
import { createApp, ref, h as vueH, render,nextTick } from "vue"
import VueNode from "./index.vue"
import Anchor from "../customAnchor/index.vue"
import { v4 as uuidv4 } from 'uuid';


class CustomNode extends HtmlNode {
    constructor(props) {
        super(props)
        this.isMounted = false        
        this.r = vueH(VueNode, {
            properties: props.model.getProperties(),
            id: props.model.id,
            onNodeClick: (i,callback) => {                
                props.graphModel.eventCenter.emit("custom:node-click", i)
                callback?.()
            }
          });
          this.app = createApp({
            render: () => this.r,
          });
    }

    getAnchorShape(anchorData) {
        const { x, y, type, id } = anchorData        
        // 使用 Vue 的 h 函数创建 Anchor 组件的虚拟节点
        const anchorVNode = vueH(Anchor, {            
            type: type,
            id: this.props.model.id,
            onAnchorClick: (i) => {
                this.props.graphModel.eventCenter.emit("custom:anchor-click", i);
            },
        })       
        const foreignObject = h("foreignObject", {
            x: type=='right' ?  x - 12 :x+4,
            y: y-4,
            width:10,
            height: 10,
            "data-anchor-id": id,
            "data-anchor-type": type,
        })
        // 当 foreignObject 被渲染到 DOM 后，使用 Vue 的 render 函数将组件渲染到其中
        // 使用 requestAnimationFrame 确保 DOM 已经渲染
        requestAnimationFrame(() => {
            const foreignObjectEl = document.querySelector(`foreignObject[data-anchor-id="${id}"]`)
            if (foreignObjectEl) {
                // 检查是否已经渲染过
                if (!foreignObjectEl.querySelector(`[data-anchor-id="${id}"]`)) {
                    // 创建容器 div
                    const container = document.createElement("div")                    
                    container.setAttribute("data-anchor-id", id)
                    container.setAttribute("data-anchor-type", type)
                    container.classList.add("custom-anchor")
                    container.classList.add(type === "left" ? "incomming-anchor" : "outgoing-anchor")
                    // 使用 Vue 的 render 函数将组件渲染到容器中
                    render(anchorVNode, container)
                    // 将容器添加到 foreignObject
                    foreignObjectEl.appendChild(container)
                }
            }else{
                console.log('____-foreignObjectEl not found',id)
            }
        })

        return foreignObject
    }

    setHtml(rootEl) {
        const { properties, id } = this.props.model
        if (!this.isMounted) {
            rootEl.innerHTML = ''
            const node = document.createElement("div")
            node.style.width = "100%"
            node.style.height = "100%"
            rootEl.appendChild(node)
            this.app.mount(node)
            this.isMounted = true

            const height = node.querySelector('.node-description')?.offsetHeight
            console.log( '【description height】',height)

            this.props.model.updateAttributes({
                height: height + 58
            })
        } else {
            // 更新响应式数据，这会触发 Vue 组件的重新渲染
            this.r.component.props.properties = this.props.model.getProperties();
            this.r.component.props.isHovered = this.props.model.isHovered
            this.r.component.props.isSelected = this.props.model.isSelected
            this.r.component.props.isDragging = this.props.model.isDragging

            try {
                // 更新节点高度
                nextTick(() => {
                    const conditionHeight = this.r.component.vnode.el.querySelector('.condition-warp')?.offsetHeight
                    const descriptionHeight = this.r.component.vnode.el.querySelector('.node-description')?.offsetHeight
                    this.conditionHeight = conditionHeight
                    this.descriptionHeight = descriptionHeight
                 
                    this.props.model.updateAttributes({
                        height: conditionHeight + descriptionHeight + 58,
                        conditionHeight,
                        descriptionHeight
                    })
                })
            } catch (error) {
                console.log(error)
            }
        }
    }
    getIcon() {
        return null
    }
    getText() {
        return null
    }

    shouldUpdate(){
        return true
    }
}
class CustomNodeModel extends HtmlNodeModel {

    initNodeData(data) {
        super.initNodeData(data)       
        this.targetRules = [];
        // 标记为开始节点和结束节点
        this.properties.isStartNode = data.type === 'start';
        this.properties.isEndNode = data.type === 'end'
    }    

    setAttributes() {
        const { width, height } = this.properties
        this.width = width
        this.height = this.height ?? height
        this.text.editable = false 
        this.isShowAnchor = true // 始终显示锚点
    }    
    getDefaultAnchor() {
        const { x, y, id, width, height } = this
        const properties = this.getProperties()
        const { anchors , config } = properties
        const { condition } = config || {}
        console.log('condition',height,this.conditionHeight,this.descriptionHeight)
        const result = []
        // console.log('anchors',anchors)
        if(Array.isArray(anchors)){
            anchors.forEach((position,index)=>{
                // 如果是右侧锚点且有条件，为每个条件生成一个锚点
                if(position === 'right' && Array.isArray(condition) && condition.length > 0){
                    // 计算条件区域的起始位置
                    // 节点顶部 + 描述区域高度 + 固定高度（padding等）
                    const descriptionHeight = this.descriptionHeight || 0
                    const conditionHeight = this.conditionHeight || 0
                    const topOffset = 29 // 节点顶部padding + 标题区域高度（8px padding + 21px 标题区域）
                    
                    // debugger
                    // 计算每个条件项的平均高度
                    // 如果 conditionHeight 为 0（节点未完全渲染），使用估算值：每个条件项约 28px（包括padding和margin）
                    const avgConditionItemHeight = conditionHeight > 0 
                        ? conditionHeight / condition.length 
                        : 28
                    
                    // 为每个条件生成一个锚点
                    condition.forEach((cond, condIndex) => {
                        // 计算每个条件项的Y坐标
                        // 从条件区域顶部开始，每个条件项居中位置
                        const conditionStartY = y - height / 2 + topOffset + descriptionHeight
                        // 第一个条件项从条件区域顶部开始，后续项依次向下
                        const anchorY = conditionStartY + condIndex * avgConditionItemHeight + avgConditionItemHeight / 2
                        
                        result.push({
                            x: (x + width / 2) - 1,  // 右侧
                            y: anchorY + 11,
                            id: `${position}_${id}_${condIndex}`,  // 唯一标识，包含条件索引
                            type: position,              // 锚点类型
                            index: condIndex,            // 条件索引
                            conditionIndex: condIndex,   // 条件索引（额外字段）
                            conditionId: cond.id || condIndex  // 条件ID
                        });
                    });
                } else {
                    // 其他位置的锚点或没有条件时的右侧锚点
                    let anchorX, anchorY;
                    switch(position) {
                        case 'top':
                          anchorX = x;              // 水平居中
                          anchorY = y - height / 2; // 顶部
                          break;
                        case 'right':
                            // 没有条件，则锚点位置在右侧垂直居中
                            anchorX = x + width / 2;  // 右侧
                            anchorY = y;              // 垂直居中
                          break;
                        case 'bottom':
                          anchorX = x;              // 水平居中
                          anchorY = y + height / 2; // 底部
                          break;
                        case 'left':
                          anchorX = x - width / 2;  // 左侧
                          anchorY = y;              // 垂直居中
                          break;
                      }                  
                      result.push({
                        x: anchorX,
                        y: anchorY,
                        id: `${position}_${id}`,  // 唯一标识
                        type: position,              // 锚点类型
                        index: index                 // 索引
                    });
                }
            })
        }        
        return result
    }
}

const createCustomNode = (type)=>{
    return {
        type: type,
        view: CustomNode,
        model: CustomNodeModel
    }
}

export default createCustomNode
