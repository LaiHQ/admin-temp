<template>
    <div class="message-input">
        <a-textarea :bordered="false" :value="modelValue" @change="handleInputChange" @pressEnter="handlePressEnter" placeholder="请输入" :auto-size="{ minRows: 3, maxRows: 10 }" />

        <div class="input-footer">
            <div class="model"></div>
            <div class="handle">
                <a-button v-if="!loading && isEmpty && !disconnect" type="primary" shape="circle" :disabled="isEmpty" @click="handlePressEnter">
                    <ArrowUpOutlined />
                </a-button>
                <a-button v-if="!loading && !isEmpty" type="primary" shape="circle" :disabled="isEmpty" @click="handlePressEnter">
                    <ArrowUpOutlined />
                </a-button>
                <a-button type="primary" ghost v-if="loading && isEmpty && !disconnect" shape="circle" @click="disconnect">
                    <LoadingOutlined />
                </a-button>
                <a-button type="primary" ghost v-if="loading && disconnect" shape="circle" @click="disconnect">
                    <div style="width: 14px; height: 14px; background-color: #d9d9d9; margin: 0 auto"></div>
                </a-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, reactive } from "vue"
import { trim } from "@/utils"
import { ArrowUpOutlined, LoadingOutlined, PauseCircleOutlined } from "@ant-design/icons-vue"

const props = defineProps({
    modelValue: {
        type: String,
        default: ""
    },
    handleInputChange: {
        type: Function,
        default: () => {}
    },
    handlePressEnter: {
        type: Function,
        default: () => {}
    },
    loading: {
        type: Boolean,
        default: false
    },
    disconnect: {
        type: Function
    }
})

const emit = defineEmits(["update:modelValue"])

const state = reactive({})

const isEmpty = computed(() => trim(props.modelValue) === "")

function init() {}

onMounted(() => {
    init()
})
</script>

<style lang="less" scoped>
.message-input {
    margin-right: 12px;
    border: 1px solid #dce0e9;
    border-radius: 8px;
    padding-bottom: 10px;
    padding-inline: 10px;
    padding-top: 10px;

    .input-footer {
        display: flex;
        justify-content: space-between;
    }
}
</style>
