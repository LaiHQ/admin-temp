<template>
    <div class="chat-container">
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
        <MessageInput v-model="value" :handleInputChange="handleInputChange" :loading="loading" :disconnect="disconnect" :handlePressEnter="handlePressEnter"> </MessageInput>
    </div>
</template>

<script setup>
import { computed, onMounted, reactive } from "vue"
import { useSendMessage } from "@/hooks/useSendMessage"
import MessageItem from "@/components/aiChat/messageItem.vue"
import MessageInput from "@/components/aiChat/messageInput.vue"

const props = defineProps({
    height: {
        type: String,
        default: "100%"
    }
})
const userInfo = computed(() => {
    return {
        avatar: "",
        nickname: ""
    }
})

const { value, handleInputChange, handlePressEnter, refDom, loading, derivedMessages, disconnect, setDerivedMessages, autoScrollEnabled, handleScroll } = useSendMessage()
</script>

<style lang="less" scoped>
.chat-container {
    position: relative;
    padding: 0 0 12px 12px;
    border-radius: 4px;
}

.message-listwarp {
    padding-right: 12px;
    overflow-y: scroll;
    // scrollbar-gutter: stable;
    // scrollbar-color: rgba(0, 0, 0, 0.08) transparent;
    transition: scrollbar-color 0.1s ease-out;
    &::-webkit-scrollbar {
        width: 5px;
        background-color: #f5f7fa;
    }

    &::-webkit-scrollbar-thumb {
        background-color: #d9d9d9;
        border-radius: 10px;
    }
}
</style>
