<template>
    <div class="message-list">
        <div :key="idx" v-for="(item, idx) in derivedMessages" :class="['message-item', itemClass('message-item', item)]">
            <section :class="['item-section', itemClass('item-section', item)]">
                <div class="item-content">
                    <div class="item-avatar">
                        <a-avatar v-if="isUser(item)" :src="avatar" class="avatar-img">
                            <template #icon v-if="!avatar">
                                <UserOutlined />
                            </template>
                        </a-avatar>

                        <a-avatar v-else class="avatar-img" src="https://iconfont.alicdn.com/p/avatar/kPjatG8l6pvn.jpg" alt="" />
                    </div>

                    <div class="item-info">
                        <div class="item-handle">
                            <slot name="handle"> </slot>
                        </div>
                        <!--  --> 
                                                
                        <!--  -->
                        <div class="item-text">
                            <template v-if="isUser(item)">

                                {{ item.content }}
                                
                                <div class="content-handle content-handle-user"  v-if="isUser(item)">
                                    <a-tooltip title="复制">
                                        <div class="content-handle-item" style="color: rgba(0, 0, 0, 0.6);" @click="handleCopyText(item)">
                                            <CopyOutlined v-if="!item.copy" />
                                            <CheckOutlined v-if="item.copy" />
                                        </div>
                                    </a-tooltip>
                                    <a-tooltip title="修改">
                                        <div class="content-handle-item" style="color: rgba(0, 0, 0, 0.6);">
                                            <EditOutlined />
                                        </div>
                                    </a-tooltip>
                            </div>
                            </template>
                            <template v-else>
                                <div v-if="item.think">
                                    <div @click="item.hideThink = !item.hideThink" style="cursor: pointer; padding: 7px 14px; background: rgb(245 245 245); display: inline-block; border-radius: 10px">
                                        <span style="font-size: 12px"> {{ item.inThink ? "思考中" : `已深度思考（用时 ${item.thinkDuration || 0} 秒）` }}</span>
                                        <LoadingOutlined v-if="item.inThink" spin style="font-size: 14px; margin-left: 8px" />
                                        <DownOutlined v-if="!item.inThink" style="font-size: 12px" />
                                    </div>
                                    <div v-show="!item.hideThink" style="border-left: 1px solid #ccc; padding: 0 10px; color: #8b8b8b; margin: 10px 0; font-size: 14px">
                                        <Markdown :content="item.think" />
                                    </div>
                                </div>
                                <div class="md-warp" v-if="item.content">
                                    <Markdown :content="item.content" />
                                    <!--  -->
                                    <div class="content-handle" v-if="item.done">
                                        <a-tooltip title="复制">
                                            <div class="content-handle-item" @click="handleCopyText(item) ">
                                                <CopyOutlined v-if="!item.copy" />
                                                <CheckOutlined v-if="item.copy" />
                                            </div>
                                        </a-tooltip>
                                        <a-tooltip :title="item.speechStatus === 'playing' ? '暂停' : '播放' ">
                                            <div class="content-handle-item" @click="handlePlay(item) ">
                                                 <PauseCircleOutlined v-if="item.speechStatus === 'playing'" />
                                                 <PlayCircleOutlined v-else />
                                            </div>
                                        </a-tooltip>                                       
                                        <a-tooltip title="重新生成">
                                            <div class="content-handle-item" @click="handleRegenerate(item,idx)">
                                                <SyncOutlined />
                                            </div>
                                        </a-tooltip>
                                    </div>
                                    <!--  -->
                                </div>
                                <!--  -->

                                <template v-else>
                                    <LoadingOutlined v-if="!item.inThink" style="font-size: 16px" />
                                </template>
                            </template>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import { computed,nextTick,onMounted,onUnmounted } from "vue"
import Markdown from "@/components/markdown/index.vue"
import { LoadingOutlined, DownOutlined, CopyOutlined } from "@ant-design/icons-vue"

import { copyText ,speech } from "@/components/aiChat/utils"

const emit = defineEmits(['handleRegenerate'])


const props = defineProps({
    derivedMessages: {
        type: Array,
        default: () => []
    },
    nickname: String,
    avatar: String
})

const itemClass = computed(() => (prefix, { role }) => {
    return `${prefix}-${role === "user" ? "right" : "left"}`
})

const isUser = computed(
    () =>
        ({ role }) =>
            role === "user"
)

function handleRegenerate(item,idx){
    // console.log(props.derivedMessages[idx-1].content)
    emit('handleRegenerate',props.derivedMessages[idx-1].content)
}

function handlePlay(item) {
    if(item.speechStatus === 'playing'){
        speech.pause()
        item.speechStatus = 'paused'
        return
    }
    if(item.speechStatus === 'paused'){
        speech.resume()
        item.speechStatus = 'playing'
        return
    }
    item.speechStatus = 'playing'
    speech
        .play(item.content,{
            lang: "zh-CN"
        })
        .then(() => {            
            console.log("播放完成")
            item.speechStatus = 'stopped'
        })
        .catch((err) => {
            console.error("播放失败:", err)
        }).finally(()=>{
            item.speechStatus = 'stopped'
        })
}

function handleCopyText(item){
    item.copy = true
    copyText(item.content)
    setTimeout(()=>{
        item.copy = false
    },800)
}

onMounted(()=>{
   nextTick(()=>{
     speech.stop()
   })

   // 获取语音列表
// speech.getVoices().then((voicesList) => {
//     const list = voicesList.filter((item) => item.lang === "zh-CN")
//     console.log("可用语音:", list)
// })
})

onUnmounted(()=>{
    speech.stop()
})
</script>

<style lang="less" scoped>
.message-list {
    transition: all 0.2s;
    .message-item {
        padding: 16px 0;
        transition: all 0.2s;

        .item-section {
            display: inline-block;
        }

        .item-content {
            display: inline-flex;            
            gap: 16px;            
        }

        .item-avatar {
            .avatar-img {
                width: 40px;
                height: 40px;
                display: block;
                border-radius: 50%;
                border: 1px solid #ccc;
                // background-color: #eee;
            }
        }

        .item-info {
            display: flex;
            flex: 1 1 0%;
            gap: 8px;
            align-items: stretch;
            flex-direction: column;
            position: relative;
            .content-handle-user{
                position: absolute;
                bottom: -35px;
                right: 0;
                display: none;
            }

            .item-handle {
                column-gap: 8px;
                row-gap: 8px;
                align-items: center;
            }
        }

        .item-text {
            border-radius: 4px;
            word-break: break-all;
            min-height: 32px;
            font-size: 16px;
            position: relative;
        }
    }

    .message-item-left {
        text-align: left;
    }

    .message-item-right {
        text-align: right;
    }

    .item-section-left {
        width: 90%;
        overflow: hidden;
    }

    .item-section-right {
        width: 90%;
        // overflow: hidden;

        .item-content {
            flex-direction: row-reverse;
        }
        .item-text {
            // background-color: rgba(0, 0, 0, 0.04);
            word-break: break-all;
            text-align: justify;
            font-family: PingFangSC, PingFang SC;
            padding: 0 10px;
            padding-top: 5px;
            background-color: rgb(7, 192, 95);
            color: #fff;

            &::after {
                content: " ";
                position: absolute;
                right: -12px;
                top: 6px;
                border: 7px solid transparent;
                border-left-color: rgb(7, 192, 95);
            }

            &:hover{
                .content-handle-user{
                    display: flex;
                    transition: all 0.2s;
                }
            }
        }
    }

    .item-section-left {
        .md-warp {
            position: relative;
            min-height: 32px;
            font-size: 14px;
            background-color: rgb(239, 245, 254);
            padding: 10px;
            border-radius: 4px;
            &::after {
                content: " ";
                position: absolute;
                left: -12px;
                top: 6px;
                border: 7px solid transparent;
                z-index: 95;
                border-right-color: rgb(239, 245, 254);
            }
        }
    }
}

.content-handle {
    display: flex;
    justify-content: end;
    .content-handle-item {
        padding: 6px;
        cursor: pointer;
        margin-left: 4px;
        &:hover {
            background-color: rgba(48, 50, 54, 0.05);
            border-radius: 4px;
        }
    }
}
</style>
