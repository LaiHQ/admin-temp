<template>
    <div class="custom-edge-label" v-if="text || isHovered || isSelected">
       {{ isHovered }}
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    text: {
        type: String,
        default: '',
    },
    showLabel: {
        type: Boolean,
        default: false,
    },
    isHovered: {
        type: Boolean,
        default: false,
    },
    isSelected: {
        type: Boolean,
        default: false,
    },
})
</script>

<style lang="less" scoped>
.custom-edge-label {
    padding: 2px 6px;
    background-color: #fff;
    border: 1px solid #e6e8ee;
    border-radius: 3px;
    font-size: 12px;
    pointer-events: none;
}
</style>

