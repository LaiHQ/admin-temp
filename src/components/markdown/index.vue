<template>
    <div ref="markdownPreviewRef" class="markdown-content"></div>
</template>

<script setup name="YMarkdownContent">
import { Marked } from "marked"
import { markedHighlight } from "marked-highlight"
import hljs from "highlight.js"
import "highlight.js/styles/atom-one-dark.css"
import katex from "katex"
import "katex/dist/katex.min.css"
import { watch } from "vue"

const markdownPreviewRef = ref(null)

const props = defineProps({
    content: {
        type: String,
        default: ""
    },
    showLine: {
        type: Boolean,
        default: false
    },
    showLoading: {
        type: Boolean,
        default: false
    }
})

const markdown = new Marked(
    {
        extensions: [
            {
                name: "math",
                level: "inline",
                start(src) {
                    return src.indexOf("$")
                },
                tokenizer(src, tokens) {
                    const match = src.match(/^\$+([^$\n]+?)\$+/)
                    if (match) {
                        return {
                            type: "math",
                            raw: match[0],
                            text: match[1].trim()
                        }
                    }
                },
                renderer(token) {
                    try {
                        return katex.renderToString(token.text, {
                            throwOnError: false,
                            displayMode: false
                        })
                    } catch (error) {
                        return `<span class="text-red-500">${error.message}</span>`
                    }
                }
            },
            {
                name: "mathBlock",
                level: "block",
                start(src) {
                    return src.indexOf("\n$$")
                },
                tokenizer(src, tokens) {
                    const match = src.match(/^\$\$+\n([^$]+?)\n\$\$+\n/)
                    if (match) {
                        return {
                            type: "mathBlock",
                            raw: match[0],
                            text: match[1].trim()
                        }
                    }
                },
                renderer(token) {
                    try {
                        return katex.renderToString(token.text, {
                            throwOnError: false,
                            displayMode: true
                        })
                    } catch (error) {
                        return `<div class="text-red-500">${error.message}</div>`
                    }
                }
            }
        ]
    },
    markedHighlight({
        highlight(str, lang) {
            lang = ["", "mermaid"].includes(lang) ? "markdown" : lang
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return `<div class="markdown-wrap"> <pre class="hljs" style="padding:10px 8px 8px;margin-bottom:5px;overflow: auto;display: block;border-radius: 5px;"><code><ol style="padding: 0px 7px;list-style:none;width: 20vw;">${hljs.highlight(str, { language: lang, ignoreIllegals: true })?.value}</ol></code></pre></div>`
                } catch (error) {
                    console.log(error)
                }
            }
            return `<div class="markdown-wrap"> <pre class="hljs" style="padding:10px 8px 8px;margin-bottom:5px;overflow: auto;display: block;border-radius: 5px;"><code><ol style="padding: 0px 7px;list-style:none;width: 20vw;">${markdown?.utils?.escapeHtml(str)}</ol>
       </code></pre></div>`
        }
    })
)
let outputQueue = ""
watch(
    () => props.content,
    (text) => {
         markdownPreviewRef.value.innerHTML = markdown.parse(text) 
    },{
        immediate: false
    }
)



defineExpose({ markdownPreviewRef })
</script>

<style lang="less">
@import "./index.less";
</style>
