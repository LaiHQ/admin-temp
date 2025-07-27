<template>
    <div class="message-input">
        <!-- menu -->
        <div class="menu">
            <div class="menu-item" @click="startRecording">
                <a-tooltip title="录音">
                    <AudioOutlined />
                </a-tooltip>
            </div>
            <div class="menu-item">
                <a-dropdown arrow placement="top" :trigger="['hover']">
                    <PictureOutlined />
                    <template #overlay>
                        <a-menu @click="handleItemClick">
                            <a-menu-item key="screenshot">截图</a-menu-item>
                            <a-menu-item>
                                <a-upload>上传图片</a-upload>
                            </a-menu-item>
                        </a-menu>
                    </template>
                </a-dropdown>
            </div>
            <div class="menu-item">
                <VideoCameraOutlined />
            </div>
            <div class="menu-item">
                <a-tooltip title="上传文档">
                    <UploadOutlined />
                </a-tooltip>
            </div>
            <!-- <AudioMutedOutlined /> -->
        </div>
        <!--  -->
        <a-textarea class="textarea" :bordered="false" :value="modelValue" @change="handleInputChange" @pressEnter="handlePressEnter" placeholder="请输入" :auto-size="{ minRows: 3, maxRows: 10 }" />
        <div class="input-footer">
            <div class="model">
                <a-space>
                    <a-select style="width: 120px" v-model:value="state.model">
                        <a-select-option value="DeepSeek">DeepSeek</a-select-option>
                    </a-select>
                    <a-button :type="state.think ? 'primary' : 'default'" :ghost="state.think" @click="state.think = !state.think">深度思考</a-button>
                    <a-button :type="state.network ? 'primary' : 'default'" :ghost="state.network" @click="state.network = !state.network">联网搜索</a-button>
                </a-space>
            </div>
            <div class="handle">
                <a-tooltip title="请输入你的问题">
                    <a-button v-if="!loading && isEmpty && !disconnect" type="primary" shape="circle" :disabled="isEmpty" @click="handlePressEnter">
                        <ArrowUpOutlined />
                    </a-button>
                </a-tooltip>
                <a-button v-if="!loading && !isEmpty" type="primary" shape="circle" :disabled="isEmpty" @click="handlePressEnter">
                    <ArrowUpOutlined />
                </a-button>
                <a-button type="primary" ghost v-if="loading && isEmpty && !disconnect" shape="circle" @click="disconnect">
                    <LoadingOutlined />
                </a-button>
                <a-tooltip title="停止生成" v-if="loading && disconnect">
                    <a-button type="primary" ghost v-if="loading && disconnect" shape="circle" @click="disconnect">
                        <div style="width: 14px; height: 14px; background-color: #d9d9d9; margin: 0 auto"></div>
                    </a-button>
                </a-tooltip>
            </div>
        </div>
        <!--  -->
        <div class="go-bottom" v-show="!autoScrollEnabled">
            <a-button shape="circle" @click="handleToBottom('smooth')">
                <DownOutlined />
            </a-button>
        </div>
        <!--  -->
        <div class="tip-brand">服务生成的所有内容均由人工智能模型生成，其生成内容的准确性和完整性无法保证，不代表我们的态度或观点</div>
    </div>
</template>

<script setup>
import { onMounted, reactive } from "vue"
import { trim } from "@/utils"
import { ArrowUpOutlined, LoadingOutlined, PauseCircleOutlined, AudioOutlined, AudioMutedOutlined, PictureOutlined, VideoCameraOutlined, UploadOutlined } from "@ant-design/icons-vue"

import { screenshot } from "@/components/aiChat/utils"

import RecordRTC from "recordrtc"
// https://www.webrtc-experiment.com/RecordRTC/simple-demos/

const props = defineProps({
    modelValue: {
        type: String,
        default: ""
    },
    handleInputChange: {
        type: Function
    },
    handlePressEnter: {
        type: Function
    },
    handleToBottom: {
        type: Function
    },
    loading: {
        type: Boolean,
        default: false
    },
    disconnect: {
        type: Function
    },
    autoScrollEnabled: {
        type: Boolean,
        default: true
    }
})

const emit = defineEmits(["update:modelValue"])

const state = reactive({
    model: "deepseek",
    think: false,
    network: false
})

const isEmpty = computed(() => trim(props.modelValue) === "")

let recorder

async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    recorder = new RecordRTC(stream, {
        type: "audio",
        mimeType: "audio/webm"
    })
    recorder.startRecording()
}

function stopRecording() {
    recorder.stopRecording(() => {
        const blob = recorder.getBlob()
        const url = URL.createObjectURL(blob)
        // 使用或下载录音

        console.log(url)
    })
}

function handleItemClick(e) {
    if (e.key === "screenshot") {
        // console.log("截图")
        screenshot((image) => {
            console.log(image)
        })
    }
}

function init() {}

onMounted(() => {
    init()
})
</script>

<style lang="less" scoped>
.message-input {
    border-top: 1px solid #e7e7e7;
    // border-radius: 8px;
    //  margin-right: 12px;
    padding-bottom: 10px;
    // padding-inline: 10px;
    // padding-top: 10px;
    position: relative;
    background-color: var(--bg-color, rgb(248, 249, 250)); ;
    .textarea {
        padding: 5px 16px;
        color: var(--text-color, #333);
    }

    .menu {
        padding: 12px 20px;
        display: flex;
        .menu-item {
            padding: 6px;
            margin-right: 16px;
            cursor: pointer;
            font-size: 16px;
            color: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            &:hover {
                background-color: rgba(48, 50, 54, 0.05);
                border-radius: 4px;
                transition: all 0.3s;
            }
        }
    }

    .input-footer {
        display: flex;
        justify-content: space-between;
        padding: 0 16px 10px 16px;
    }

    .go-bottom {
        position: absolute;
        top: -42px;
        left: 50%;
        margin-left: -16px;
    }

    .tip-brand {
        font-size: 12px;
        color: #00000042;
        text-align: center;
        padding: 0 20px;
        // padding-top: 12px;
    }
}
</style>
