import { BezierEdge, BezierEdgeModel, h, TextMode, ElementState } from "@logicflow/core"
import { h as vueH, render } from "vue"
import CustomEdgeLabel from "./index.vue"

class CustomEdge extends BezierEdge {
    constructor(props) {
        super(props)
        this.textContainer = null
        this.labelVNode = null
    }

    // 自定义起始箭头（如果需要）
    getStartArrow() {
        // 默认不显示起始箭头，如需自定义可在此实现
        return null
    }

    // 重写 getText 方法，使用 Vue 组件渲染文本
    getText() {
        const { model, graphModel } = this.props
        const { editConfigModel } = graphModel

        // 当边文本模式非 TEXT 时，不显示文本
        if (editConfigModel.edgeTextMode !== TextMode.TEXT) return null
        // 文本被编辑的时候，显示编辑框，不显示文本
        if (model.state === ElementState.TEXT_EDIT) return null

        if (model.text && model.text.value) {
            const textPosition = model.getTextPosition()
            const textValue = model.text.value
            const isHovered = model.isHovered
            const isSelected = model.isSelected

            // 估算文本宽度（每个字符约 8px，加上 padding）
            const estimatedWidth = Math.max(textValue.length * 8 + 20, 80)
            const estimatedHeight = 24

            // 使用 Vue 的 h 函数创建 CustomEdgeLabel 组件的虚拟节点
            this.labelVNode = vueH(CustomEdgeLabel, {
                text: textValue,
                showLabel: true,
                isHovered: isHovered,
                isSelected: isSelected,
            })

            // 使用 LogicFlow 的 h 函数创建 foreignObject
            const foreignObject = h("foreignObject", {
                x: textPosition.x - estimatedWidth / 2, // 调整位置，使文本居中
                y: textPosition.y - estimatedHeight / 2,
                width: estimatedWidth,
                height: estimatedHeight,
                "data-edge-id": model.id,
            })

            // 当 foreignObject 被渲染到 DOM 后，使用 Vue 的 render 函数将组件渲染到其中
            requestAnimationFrame(() => {
                const foreignObjectEl = document.querySelector(`foreignObject[data-edge-id="${model.id}"]`)
                if (foreignObjectEl) {
                    // 检查是否已经渲染过
                    let container = foreignObjectEl.querySelector(`[data-edge-id="${model.id}"]`)
                    if (!container) {
                        // 创建容器 div
                        container = document.createElement("div")
                        container.setAttribute("data-edge-id", model.id)
                        container.style.width = "100%"
                        container.style.height = "100%"
                        container.style.display = "flex"
                        container.style.alignItems = "center"
                        container.style.justifyContent = "center"

                        // 将容器添加到 foreignObject
                        foreignObjectEl.appendChild(container)
                        this.textContainer = container
                    }

                    // 使用 Vue 的 render 函数将组件渲染到容器中（每次都会更新）
                    if (this.labelVNode && container) {
                        render(this.labelVNode, container)
                    }
                }
            })

            return foreignObject
        }
        return null
    }
}

class CustomEdgeModel extends BezierEdgeModel {
    setAttributes() {
        // 设置边的默认属性
        this.stroke = '#000'
        this.strokeWidth = 2
        this.strokeDasharray = ''
        // 启用自定义文本位置
        this.customTextPosition = true
    }

    // 自定义边的样式
    getEdgeStyle() {
        const style = super.getEdgeStyle()
        
        // 根据边的状态返回不同样式
        if (this.isHovered) {
            return {
                ...style,
                stroke: 'red',
                strokeWidth: 2,
            }
        }
        
        if (this.isSelected) {
            return {
                ...style,
                stroke: '#1890ff',
                strokeWidth: 3,
            }
        }
        
        return style
    }

    // 自定义文本位置 - 计算贝塞尔曲线的中点
    getTextPosition() {
        // pointsList 结构: [startPoint, sNext, ePre, endPoint]
        if (this.pointsList && this.pointsList.length >= 4) {
            const [start, cp1, cp2, end] = this.pointsList
            const x0 = start.x
            const y0 = start.y
            const cp1x = cp1.x
            const cp1y = cp1.y
            const cp2x = cp2.x
            const cp2y = cp2.y
            const x1 = end.x
            const y1 = end.y
            
            // 计算三次贝塞尔曲线在 t=0.5 时的点（中点）
            // B(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
            const t = 0.5
            const mt = 1 - t
            const x = mt * mt * mt * x0 + 3 * mt * mt * t * cp1x + 3 * mt * t * t * cp2x + t * t * t * x1
            const y = mt * mt * mt * y0 + 3 * mt * mt * t * cp1y + 3 * mt * t * t * cp2y + t * t * t * y1
            
            return {
                x,
                y
            }
        }
        
        // 如果 pointsList 不存在，使用起点和终点的中点作为后备方案
        const { x: x0, y: y0 } = this.startPoint || { x: 0, y: 0 }
        const { x: x1, y: y1 } = this.endPoint || { x: 0, y: 0 }
        
        return {
            x: (x0 + x1) / 2,
            y: (y0 + y1) / 2
        }
    }

    // 自定义动画样式（如果需要）
    getEdgeAnimationStyle() {
        const style = super.getEdgeAnimationStyle()
        if (this.isAnimation) {
            return {
                ...style,
                strokeDasharray: '5 5',
                strokeDashoffset: '100%',
                animationDuration: '3s',
            }
        }
        return style
    }
}

export default {
    type: "customEdge",
    view: CustomEdge,
    model: CustomEdgeModel
}

