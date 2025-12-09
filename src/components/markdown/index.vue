<template>
    <VueMarkdown :markdown="content" :remark-plugins="remarkPlugins" :rehype-plugins="rehypePlugins" :customAttrs="customAttrs">
        <template #ul="{ children, depth, ...props }">
            <ul :class="['unordered-list', `list-depth-${depth}`]">
                <Component :is="children" />
            </ul>
        </template>

        <template #code="{ children, ...props }">           
            <div class="code-block" v-if="props.language"> 
                <div class="code-block-header">
                    <span class="code-block-header-language">{{ props.language }}</span>
                    <div class="code-block-header-actions">
                        <div class="header-actions-item">复制</div>
                        <div class="header-actions-item">下载</div>
                    </div>
                </div>
                <div class="code-block-content">
                  <code :lang="props.language">
                    <component :is="children" />
                  </code>
                </div>
            </div>
             <code  v-else>
                    <component :is="children" />
                  </code>
        </template>
    </VueMarkdown>
</template>

<script setup>
import { VueMarkdown } from "@crazydos/vue-markdown"
// https://github.com/shunnNet/vue-markdown/tree/main
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"

import rehypeHighlight from "rehype-highlight"

import javascript from "highlight.js/lib/languages/javascript"
import python from "highlight.js/lib/languages/python"
import java from "highlight.js/lib/languages/java"
import css from "highlight.js/lib/languages/css"
import json from "highlight.js/lib/languages/json"

import "highlight.js/styles/github.css" // GitHub风格
// import 'highlight.js/styles/atom-one-dark.css' // Atom暗色主题

const props = defineProps({
    content: {
        type: String,
        default: ""
    }
})

const remarkPlugins = [
    // 其他 remark 插件
    remarkGfm
]

const rehypePlugins = [
    // 其他 rehype 插件
    rehypeRaw,
    [rehypeHighlight, { ignoreMissing: true, languages: { javascript, python,java,css,json }, typographer: true, linkify: true, breaks: true, }]
]

const customAttrs = {
    // h1: { 'class': ["heading"] },
    // h2: { 'class': ["heading"] },
    a: { target: "_blank", rel: "noopener noreferrer" }
    //or
    // a: (node, combinedAttrs) => {
    //   if (
    //     typeof node.properties.href === 'string' &&
    //     node.properties.href.startsWith('https://www.google.com')
    //   ){
    //     return { target: '_blank', rel: "noopener noreferrer"}
    //   } else {
    //     return {}
    //   }
    // }
}
</script>

<style lang="less" scoped>
.code-block {
    background-color: #fafafa;
    border-radius: 10px;
    overflow: hidden;
    width: 100%;
    white-space: pre-wrap;
    word-break: break-all;

    .code-block-header {
        padding: 6px 14px 6px 6px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #f5f5f5;
        .code-block-header-language{
          font-size: 12px;
          color: rgb(82 82 82);
        }
        .code-block-header-actions{
          display: flex;
          font-size: 12px;
          .header-actions-item{
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            &:hover{
              background-color: #e5e5e5;
            }
          }
        }
    }
    .code-block-content{
      padding: 14px;
      font-size: 12px;
    }
}
</style>
