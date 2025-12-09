// use-markdown-renderer.ts
import { ref, watch, type Ref, type VNode, h, computed } from "vue"
import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkBreaks from "remark-breaks"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import remarkGemoji from "remark-gemoji"
import remarkRehype from "remark-rehype"
import rehypeRaw from "rehype-raw"
import katex from "katex"
import "katex/dist/katex.min.css"
import type { Root } from "hast"
import type { Plugin } from "unified"
import rehypeStringify from "rehype-stringify"
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"
import mermaid from "mermaid"

mermaid.initialize({ startOnLoad: false })

export interface MarkdownRenderers {
    mermaid?: any
    code?: any
    image?: any
    video?: any
    math?: any
    [key: string]: any
}

export interface UseMarkdownRendererOptions {
    content: string
    safeMode?: boolean
    plugins?: Plugin[]
    renderers?: MarkdownRenderers
}

export function useMarkdownRenderer(options: UseMarkdownRendererOptions) {
    const vNodeTree = ref<VNode | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    // 创建 markdown 处理器
    const processor = computed(() => {
        let p = unified()
            .use(remarkParse)
            .use(remarkBreaks)
            .use(remarkGfm, { singleTilde: false })
            .use(remarkMath)
            .use(remarkGemoji)
            .use(remarkRehype, {
                allowDangerousHtml: !options.safeMode,
                passThrough: ["math", "inlineMath"] // 确保数学公式能通过
            })
            .use(rehypeRaw)
            .use(rehypeSanitize, {
                ...defaultSchema,
                attributes: {
                    ...defaultSchema.attributes,
                    code: [...(defaultSchema.attributes?.code || []), ["className", "language-mermaid", "language-math"]],
                    span: [...(defaultSchema.attributes?.span || []), ["className", "math-inline"]]
                }
            })
            .use(rehypeStringify)        

        options.plugins?.forEach((plugin) => p.use(plugin))
        return p
    })

    // 完整转换逻辑
    const createVNodeTransformer = (renderers?: MarkdownRenderers) => {
        const handlePreElement = (node: any): VNode | null => {
            const codeNode = node.children?.find((child: any) => child.tagName === "code")
            if (!codeNode) {
                return h("pre", {}, node.children?.map((child: any) => hastToVNode(child)) || [])
            }

            const className = codeNode.properties?.className || []
            const classArray = Array.isArray(className) ? className : [className]
            const classStr = classArray.join(" ")

            // Mermaid 图表
            if (classStr.includes("language-mermaid")) {
                const code = codeNode.children?.[0]?.value || ""
                return renderers?.mermaid ? h(renderers.mermaid, { code }) : h("div", { class: "mermaid-error" }, "Mermaid组件未注册")
            }

            // 数学公式块
            if (classStr.includes("language-math") || classStr.includes("math-display")) {
                const mathCode = codeNode.children?.[0]?.value || ""
                return renderers?.math
                    ? h(renderers.math, { code: mathCode, displayMode: true })
                    : h("div", {
                          innerHTML: katex.renderToString(mathCode, {
                              displayMode: true,
                              throwOnError: false
                          })
                      })
            }

            // 普通代码块
            const lang = classArray.find((c) => typeof c === "string" && c.startsWith("language-"))?.replace("language-", "") || ""
            const code = codeNode.children?.[0]?.value || ""

            return renderers?.code ? h(renderers.code, { code, language: lang }) : h("pre", {}, h("code", codeNode.properties, code))
        }

        const handleCodeElement = (node: any): VNode => {
            const className = node.properties?.className || []
            const classArray = Array.isArray(className) ? className : [className]

            // 行内公式
            if (classArray.includes("math-inline") || classArray.includes("inlineMath")) {
                const mathCode = node.children?.[0]?.value || ""
                return renderers?.math
                    ? h(renderers.math, { code: mathCode, displayMode: false })
                    : h("span", {
                          innerHTML: katex.renderToString(mathCode, {
                              displayMode: false,
                              throwOnError: false
                          })
                      })
            }
            return h("code", node.properties, node.children?.map((child: any) => hastToVNode(child)) || [])
        }

        const hastToVNode = (node: any): VNode | string | (VNode | string)[] | null => {
            if (!node) return null

            if (node.type === "root") {
                return h("div", { class: "markdown-body" }, node.children?.map((child: any) => hastToVNode(child)) || [])
            }

            if (node.type === "element") {
                const { tagName, properties = {}, children = [] } = node

                if (renderers?.[tagName]) {
                    return h(renderers[tagName], { ...properties, node })
                }

                switch (tagName) {
                    case "pre":
                        return handlePreElement(node)
                    case "code":
                        return handleCodeElement(node)
                    case "a":
                        return h(
                            "a",
                            {
                                ...properties,
                                target: "_blank",
                                rel: "noopener noreferrer"
                            },
                            children.map(hastToVNode)
                        )
                    case "img":
                        return renderers?.image ? h(renderers.image, properties) : h("img", properties)
                    case "video":
                        return renderers?.video ? h(renderers.video, properties) : h("video", properties, children.map(hastToVNode))
                    default:
                        return h(tagName, properties, children.map(hastToVNode))
                }
            }

            if (node.type === "text") return node.value

            return null
        }

        return hastToVNode
    }

    // 处理 markdown 内容
    const processMarkdown = async (content: string) => {
        loading.value = true
        error.value = null

        try {
            const file = await processor.value.process(content)
            const hastTree = file.result as Root
            const transformer = createVNodeTransformer(options.renderers)

            console.log(file)
            return transformer(hastTree)
        } catch (err) {
            error.value = (err as Error).message
            console.error("Markdown渲染错误:", err)
            return h("div", { class: "render-error" }, "Markdown 处理错误")
        } finally {
            loading.value = false
        }
    }

    // 自动监听内容变化
    watch(
        () => [options.content, options.renderers, options.plugins],
        async ([newContent]) => {
            if (newContent) {
                vNodeTree.value = (await processMarkdown(newContent)) as VNode
            }
        },
        { immediate: true }
    )

    return {
        vNodeTree,
        loading,
        error,
        refresh: () => processMarkdown(options.content)
    }
}
