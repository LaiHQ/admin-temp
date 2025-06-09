<template>
    <div class="logo-warp">
        <a href="/" class="tohome" title="首页">
            <a-avatar class="icon" :src="logo" :size="38" />
            <span class="name" v-show="!collapsed">{{ title }}</span>
        </a>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

import config from "../../../config"

const { title, logo } = config

export default defineComponent({
    name: "Logo",
    props: {
        collapsed: {
            type: Boolean,
            default: false
        }
    },
    components: {},
    setup() {
        return {
            title,
            logo
        }
    }
})
</script>

<style scoped lang="less">
.logo-warp {
    .tohome {
        display: flex;
        align-items: center;
        color: #333;
    }

    .icon {
        margin-right: 16px;
    }

    .name {
        // color: #fff;
        transform: all 0.23s;
    }
}
</style>
