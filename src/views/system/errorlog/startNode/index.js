import { HtmlNode, HtmlNodeModel, h } from "@logicflow/core"
import { createApp, ref, h as vueH, render } from "vue"
import VueNode from "./index.vue"
import Anchor from "./anchor.vue"

class StartNode extends HtmlNode {
    constructor(props) {
        super(props)
        this.isMounted = false
        this.anchorContainers = new Map() // 存储每个锚点的容器和应用实例
        this.r = vueH(VueNode, {
            properties: props.model.getProperties(),
            text: props.model.inputData,
            onBtnClick: (i) => {
                props.graphModel.eventCenter.emit("custom:onBtnClick", i)
            }
        })
        this.app = createApp({
            render: () => this.r
        })
    }
    setHovered(flag = true) {
        super.setHovered(flag)
        console.log('setHovered', flag)
        if (flag) {
            this.r.component.props.isHover = true
        } else {
            this.r.component.props.isHover = false
        }
    }

    getAnchorShape(anchorData) {
        const { x, y, type, id } = anchorData
        
        // 使用 Vue 的 h 函数创建 Anchor 组件的虚拟节点
        const anchorVNode = vueH(Anchor, {
            // width: 10,
            // height: 10,
            // className: type === "left" ? "incomming-anchor" : "outgoing-anchor"
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

                    // 存储容器，以便后续清理
                    if (!this.anchorContainers.has(id)) {
                        this.anchorContainers.set(id, { container })
                    }
                }
            }
        })

        return foreignObject
    }

    setHtml(rootEl) {
        const { properties } = this.props.model
        if (!this.isMounted) {
            this.isMounted = true
            const node = document.createElement("div")
            node.style.width = "100%"
            node.style.height = "100%"
            rootEl.appendChild(node)
            this.app.mount(node)
        } else {
            this.r.component.props.properties = this.props.model.getProperties()
        }
    }
    getIcon() {
        return null
    }
    getText() {
        return null
    }
    getAnchors() {
        return super.getAnchors()
    }
}

class StartNodeModel extends HtmlNodeModel {
    setAttributes() {
        this.width = 180
        this.height = 50
        this.text.editable = false // 不允许文本被编辑
        this.inputData = this.text.value
        this.isShowAnchor = true // 始终显示锚点
    }

    // 重写 setHovered 方法，确保锚点一直显示
    setHovered(flag = true) {
        super.setHovered(flag)
        // 无论 hover 状态如何，都保持锚点显示
        this.isShowAnchor = true
    }
    setSelected(selected) {
        super.setSelected(selected)
        // 不改变锚点显示状态
    }

    

    // 重写 setIsShowAnchor 方法，强制锚点始终显示
    setIsShowAnchor(flag = true) {
        // 始终设置为 true，忽略传入的参数
        this.isShowAnchor = true
    }

    getOutlineStyle() {
        const style = super.getOutlineStyle()
        // style.stroke = "none"
        // style.hover.stroke = "none"
        return style
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
    getData() {
        const data = super.getData()
        data.text.value = this.inputData
        return data
    }
}

export default {
    type: "startNode",
    view: StartNode,
    model: StartNodeModel
}
