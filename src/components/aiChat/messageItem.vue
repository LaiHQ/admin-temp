<template>
    <div class="message-list">
        <div :key="idx" v-for="(item, idx) in derivedMessages" :class="['message-item', itemClass('message-item', item)]">
            <section :class="['item-section', itemClass('item-section', item)]">
                <div class="item-content">
                    <div class="item-avatar">
                        <img v-if="isUser(item)" class="avatar-img" :src="avatar" alt="" />
                        <img v-else class="avatar-img" src="https://file.1d1j.cn/ai-icon/ai-avatar.png" alt="" />
                    </div>

                    <div class="item-info">
                        <div class="item-handle">
                            <slot name="handle"> </slot>
                        </div>
                        <div class="item-text">
                            <template v-if="isUser(item)">
                                <p>{{ item.content }}</p>
                            </template>
                            <Markdown v-else :content="item.content" />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue"
import Markdown from "@/components/markdown/index.vue"

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
                // background-color: #eee;
            }
        }

        .item-info {
            display: flex;
            flex: 1 1 0%;
            gap: 8px;
            align-items: stretch;
            flex-direction: column;

            .item-handle {
                column-gap: 8px;
                row-gap: 8px;
                align-items: center;
            }
        }

        .item-text {
            padding: 0 10px;
            border-radius: 4px;
            background-color: #fff;
            word-break: break-all;
            min-height: 32px;
        }
    }

    .message-item-left {
        text-align: left;
    }

    .message-item-right {
        text-align: right;
    }

    .item-section-left {
        width: 80%;
        overflow: hidden;
    }

    .item-section-right {
        width: 80%;
        overflow: hidden;

        .item-content {
            flex-direction: row-reverse;
        }
        .item-text {
            background-color: rgba(0, 0, 0, 0.04);
            word-break: break-all;
            text-align: justify;
            font-family: PingFangSC, PingFang SC;
            font-size: 14px;
        }
    }
}
</style>
