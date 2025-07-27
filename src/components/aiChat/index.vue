<template>
    <div class="chat-container">
        <!--  -->
        <div class="chat-header">
            <slot name="header">
                <div class="title">
                    <slot name="title">{{ title }}</slot>
                </div>
                <div class="handle">
                    <slot name="more">
                        <div class="more">
                            <EllipsisOutlined />
                        </div>
                    </slot>
                </div>
            </slot>
        </div>
        <!--  -->
        <div class="message-listwarp" :style="{ height: height }" @scroll="handleScroll">                
            <template v-if="derivedMessages.length">
                <MessageItem :derivedMessages="derivedMessages" :avatar="userInfo.avatar" :nickname="userInfo.nickname" @handleRegenerate="handlePressEnter">
                    <!-- <templdate #item="{item}"></templdate> -->
                </MessageItem>
            </template>
            <template v-else>
                <div class="welcome">
                    <div class="welcome-title">{{ timeFix() }}，欢迎使用AI助手。</div>
                    <div class="welcome-desc">
                        我可以帮你做这些事情，<a @click.stop>换一换 <sync-outlined :spin="false" /></a>
                    </div>
                    <ul>
                        <li v-for="(item, idx) in welcomeList" :key="item.title">
                            <a @click.stop="sendTipContent(item)">{{ idx + 1 }}. {{ item.title }}</a>
                        </li>
                    </ul>
                </div>
            </template>
            <div ref="refDom" />
        </div>
        <MessageInput v-model="value" :handleToBottom="handleToBottom" :handleInputChange="handleInputChange" :autoScrollEnabled="autoScrollEnabled" :loading="loading" :disconnect="disconnect" :handlePressEnter="handlePressEnter"> </MessageInput>
    </div>
</template>

<script setup>
import { computed, onMounted, reactive } from "vue"
import { useSendMessage } from "@/hooks/useSendMessage"
import MessageItem from "@/components/aiChat/messageItem.vue"
import MessageInput from "@/components/aiChat/messageInput.vue"
import { EllipsisOutlined, SyncOutlined } from "@ant-design/icons-vue"
import http from "@/utils/http"

function timeFix() {
    const time = new Date()
    const hour = time.getHours()
    return hour < 9 ? "早上好" : hour <= 11 ? "上午好" : hour <= 13 ? "中午好" : hour < 20 ? "下午好" : "晚上好"
}

const props = defineProps({
    height: {
        type: String,
        default: "100%"
    },
    title: {
        type: String,
        default: ""
    }
})
const userInfo = computed(() => {
    return {
        avatar: "https://himg.bdimg.com/sys/portrait/item/pp.1.f8d9f37.BYeeoRcBoh_QEVzR8v8f8Q.jpg",
        nickname: ""
    }
})

const { value, handleInputChange, handlePressEnter, handleToBottom, refDom, loading, derivedMessages, disconnect, setDerivedMessages, autoScrollEnabled, handleScroll } = useSendMessage()

const welcomeList = [
    {
        title: "今天有什么新闻？",
        desc: "我可以帮你查询今天的新闻，你可以问我比如：今天有什么新闻？"
    },
    {
        title: "今天待办事项有哪些？",
        desc: "我可以帮你查询今天的待办事项，你可以问我比如：今天有什么待办事项？"
    },
    {
        title: "讲一个笑话",
        desc: "讲一个笑话"
    },
    {
        title: "使用冒泡排序写一个算法",
        desc: "使用冒泡排序写一个排序算法"
    }
]

function sendTipContent(item) {
    handlePressEnter(item.title)
}

onMounted(() => {
    // http.get("http://localhost:11434/api/tags",{}).then(res=>{
    //     console.log(res)
    // })
})
</script>

<style lang="less" scoped>
.chat-container {
    position: relative;
    // padding: 0 0 12px 12px;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 0 23px 6px rgba(0, 0, 0, 0.08);

    .chat-header {
        border-bottom: 1px solid #e7e7e7;
        height: 48px;
        padding: 0 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .title {
            font-size: 14px;
            font-weight: bold;
            color: var(--text-color, #333);
        }

        .handle {
            display: flex;

            .more {
                padding: 0 4px;
                font-size: 24px;
                cursor: pointer;
                color: rgba(0, 0, 0, 0.6);
                &:hover {
                    background-color: rgba(48, 50, 54, 0.05);
                    border-radius: 4px;
                    transition: all 0.3s;
                }
            }
        }
    }
}

.message-listwarp {
    padding-right: 12px;
    padding-left: 12px;
    overflow-y: scroll;
    position: relative;
    // scrollbar-gutter: stable;
    // scrollbar-color: rgba(0, 0, 0, 0.08) transparent;
    transition: scrollbar-color 0.1s ease-out;
    &::-webkit-scrollbar {
        width: 5px;
        // background-color: #f5f7fa;
    }

    &::-webkit-scrollbar-thumb {
        // background-color: #d9d9d9;
        border-radius: 10px;
    }

    &:hover {
        transition: all 0.1s ease-out;
        &::-webkit-scrollbar-thumb {
            background-color: #d9d9d9;
        }
    }
}

.welcome {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate3d(-50%, -50%, 0);
    .welcome-title {
        font-size: 20px;
        font-weight: bold;
        color: var(--text-color, #333);
    }
    .welcome-desc {
        padding-top: 8px;
        color: var(--text-color, #333);
    }
}
</style>
