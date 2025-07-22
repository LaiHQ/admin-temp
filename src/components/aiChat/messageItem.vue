<template>
    <div class="message-list">
        <div :key="idx" v-for="(item, idx) in derivedMessages" :class="['message-item', itemClass('message-item', item)]">
            <section :class="['item-section', itemClass('item-section', item)]">
                <div class="item-content">
                    <div class="item-avatar">
                        <a-avatar v-if="isUser(item)" :src="avatar">
                            <template #icon v-if="!avatar">
                                <UserOutlined />
                            </template>
                        </a-avatar>

                        <img v-else class="avatar-img" src="https://file.1d1j.cn/ai-icon/ai-avatar.png" alt="" />
                    </div>

                    <div class="item-info">
                        <div class="item-handle">
                            <slot name="handle"> </slot>
                        </div>
                        <div class="item-text">
                            <template v-if="isUser(item)">
                                {{ item.content }}
                            </template>
                            <template v-else>
                                <div v-if="item.think">
                                    <div style="cursor: pointer; padding: 7px 14px; background: rgb(245 245 245); display: inline-block; border-radius: 10px">
                                        <span> {{ item.inThink ? "思考中" : `已深度思考（用时 ${item.thinkDuration || 0} 秒）` }}</span>
                                        <SyncOutlined v-if="item.inThink" spin style="font-size: 14px; margin-left: 8px" />
                                        <DownOutlined v-if="!item.inThink" style="font-size: 12px" />
                                    </div>
                                    <div style="border-left: 1px solid #ccc; padding: 0 10px; color: #8b8b8b; margin: 10px 0">
                                        <Markdown :content="item.think" />
                                    </div>
                                </div>
                                <Markdown :content="item.content" />
                            </template>
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
import { SyncOutlined } from "@ant-design/icons-vue"

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
            border-radius: 4px;
            word-break: break-all;
            min-height: 32px;
            font-size: 16px;
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
        overflow: hidden;

        .item-content {
            flex-direction: row-reverse;
        }
        .item-text {
            background-color: rgba(0, 0, 0, 0.04);
            word-break: break-all;
            text-align: justify;
            font-family: PingFangSC, PingFang SC;
            padding-top: 5px;
            padding: 0 10px;
            padding-top: 10px;
        }
    }
}
</style>
