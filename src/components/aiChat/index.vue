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
                <MessageItem :derivedMessages="derivedMessages" :avatar="userInfo.avatar" :nickname="userInfo.nickname">
                    <!-- <templdate #item="{item}"></templdate> -->
                </MessageItem>
            </template>
            <template v-else>
                <div class="welcome">你好，我是</div>
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
import { EllipsisOutlined } from "@ant-design/icons-vue"

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
        avatar: "",
        nickname: ""
    }
})

const { value, handleInputChange, handlePressEnter, handleToBottom, refDom, loading, derivedMessages, disconnect, setDerivedMessages, autoScrollEnabled, handleScroll } = useSendMessage()
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
</style>
