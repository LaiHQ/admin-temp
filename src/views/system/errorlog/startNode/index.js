import { HtmlNode, HtmlNodeModel, h } from "@logicflow/core"
import { createApp, ref, h as vueH, render } from "vue"
import VueNode from "./index.vue"
import Anchor from "./anchor.vue"

const isHovered = ref(false)

class StartNode extends HtmlNode {
    constructor(props) {
        super(props)
        this.isMounted = false
        this.preProperties = null
        this.preIsHovered = null
        this.preIsSelected = null
        
        this.r = vueH(VueNode, {
            properties: props.model.getProperties(),
            text: props.model.inputData,
            onBtnClick: (i) => {
                props.graphModel.eventCenter.emit("custom:onBtnClick", i)
            },
          });
          this.app = createApp({
            render: () => this.r,
          });
    }

    getAnchorShape(anchorData) {
        const { x, y, type, id } = anchorData
        isHovered.value = this.props.model.isHovered
        // console.log('getAnchorShape', isHovered.value)
        // 使用 Vue 的 h 函数创建 Anchor 组件的虚拟节点
        const anchorVNode = vueH(Anchor, {
            isHovered: isHovered.value,
            onBtnClick: (i) => {
                this.props.graphModel.eventCenter.emit("custom:onBtnClick", i);
              },
        })
        // 使用 LogicFlow 的 h 函数创建 foreignObject
        // 注意：我们需要在 foreignObject 被渲染到 DOM 后，使用 Vue 的 render 函数将组件渲染到其中
        const foreignObject = h("foreignObject", {
            x: x - 8,
            y: y - 8,
            width:16,
            height: 16,
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
            }
        })

        return foreignObject
    }

    setHtml(rootEl) {
        const { properties, isHovered, isSelected } = this.props.model
        const currentProperties = this.props.model.getProperties()
        
        if (!this.isMounted) {
            rootEl.innerHTML = ''
            const node = document.createElement("div")
            node.style.width = "100%"
            node.style.height = "100%"
            rootEl.appendChild(node)
            this.app.mount(node)
            this.isMounted = true
            // 确保锚点始终显示
            this.props.model.setAttributes({isShowAnchor: true})
        } else {
            // 更新响应式数据，这会触发 Vue 组件的重新渲染
            if (this.r.component && this.r.component.props) {
                // isHovered 为什么一直是 false？
                // 通常因为 isHovered 要依赖节点事件正确更新。你需要确保：
                // 1. 事件监听 node:mouseenter / node:mouseleave 已经正确设置，并能调用 setProperties({ isHovered: true/false })
                // 2. getProperties 能拿到最新的属性
                // 3. setHtml 被 LogicFlow 框架正确调用

                // 推荐调试：在事件监听回调和 setHtml 内分别打印 isHovered，看状态流转是否有问题。

                // 保持更新数据逻辑如下
                this.r.component.props.properties = currentProperties
                this.r.component.props.isHovered = isHovered
                this.r.component.props.isSelected = isSelected
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
        const currentProperties = this.props.model.getProperties()
        const currentIsHovered = this.props.model.isHovered
        const currentIsSelected = this.props.model.isSelected
        
        // 比较 properties、isHovered 和 isSelected 是否发生变化
        const propertiesChanged = this.preProperties !== currentProperties
        const hoveredChanged = this.preIsHovered !== currentIsHovered
        const selectedChanged = this.preIsSelected !== currentIsSelected
        
        if (propertiesChanged || hoveredChanged || selectedChanged) {
            this.preProperties = currentProperties
            this.preIsHovered = currentIsHovered
            this.preIsSelected = currentIsSelected
            return true
        }
        
        return false
    }
}

class StartNodeModel extends HtmlNodeModel {
    initNodeData(data) {
        super.initNodeData(data)
        // 添加防止重复连接的规则
        this.sourceRules.push({
            message: '两个节点之间已经存在连接，不能重复连接',
            validate: (sourceNode, targetNode, sourceAnchor, targetAnchor, edgeId) => {
                // edgeId 存在时表示是调整边，允许连接
                if (edgeId) {
                    return true
                }
                // 检查是否已经存在相同的边
                const edges = this.graphModel.edges
                const isDuplicate = edges.some(edge => {
                    // 排除虚拟边和当前正在调整的边
                    if (edge.virtual) return false
                    // 检查是否已经存在相同的 sourceNodeId 和 targetNodeId 的边
                    return edge.sourceNodeId === sourceNode.id && 
                           edge.targetNodeId === targetNode.id
                })
                return !isDuplicate
            }
        })
    }
    
    setAttributes() {
        this.width = 180
        this.height = 50
        this.text.editable = false 
        // 始终显示锚点
        this.isShowAnchor = true
    }
    
    // 重写 setHovered 方法，确保锚点一直显示
    setHovered(flag = true) {
        super.setHovered(flag)
        // 无论 hover 状态如何，都保持锚点显示
        this.isShowAnchor = true
    }
    
    // 重写 setSelected 方法，确保锚点一直显示
    setSelected(selected) {
        super.setSelected(selected)
        // 不改变锚点显示状态，始终保持显示
        this.isShowAnchor = true
    }
    
    // 重写 setIsShowAnchor 方法，强制锚点始终显示
    setIsShowAnchor(flag = true) {
        super.setIsShowAnchor(flag)
        // 始终设置为 true，忽略传入的参数
        this.isShowAnchor = true
    }
    getDefaultAnchor() {
        const { x, y, id, width, height } = this
        const anchors = [
            {
                x: x + width / 2,
                y: y,
                id: `${id}_right`,
                type: "right"
            },
            {
                x: x - width / 2,
                y: y,
                id: `${id}_left`,
                type: "left"
            }
        ]

        return anchors
    }    
}

export default {
    type: "startNode",
    view: StartNode,
    model: StartNodeModel
}
