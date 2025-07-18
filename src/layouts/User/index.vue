<template>
    <div class="user-wrapper">
        <div class="content-wrapper">
            <template v-if="isDev">
                <a-tooltip placement="bottom">
                    <template #title>
                        <span>{{ system.theme === "light" ? "默认主题" : "暗黑主题" }}</span>
                    </template>
                    <a-switch v-model:checked="system.theme" checkedValue="dark" unCheckedValue="light"
                        style="margin-right: 10px" @change="system.setCurrentTheme">
                        <template #checkedChildren>
                            <div class="moon"></div>
                        </template>
                        <template #unCheckedChildren>
                            <div class="sun"></div>
                        </template>
                    </a-switch>
                </a-tooltip>
                <a-dropdown arrow placement="bottom" :trigger="['click']">
                    <a-tooltip placement="top">
                        <template #title>
                            <span>主题色</span>
                        </template>
                        <a-button type="text">
                            <template #icon>
                                <div :style="{ backgroundColor: system.primaryColor, width: '20px', height: '20px', margin: 'auto', borderRadius: '4px' }"></div>
                            </template>
                        </a-button>
                    </a-tooltip>
                    <template #overlay>
                        <a-menu>
                            <a-menu-item disabled style="padding: 0">
                                <SketchPicker v-model="system.primaryColor" @update:modelValue="changePrimary" />
                            </a-menu-item>
                        </a-menu>
                    </template>
                </a-dropdown>

                <a-tooltip placement="bottom">
                    <template #title>
                        <span>开发文档</span>
                    </template>
                    <a-button type="text" href="http://localhost:8090/" target="_blank">
                        <template #icon>
                            <BugOutlined />
                        </template>
                    </a-button>
                </a-tooltip>
            </template>
            <a-dropdown @visibleChange="userVisibleChange">
                <span class="action">
                    <a-avatar class="avatar" size="small" :src="avatar" />
                    <span class="nickname">{{ nickname }}
                        <caret-down-outlined :class="`caretup-${userVisible}`" />
                    </span>
                </span>
                <template #overlay>
                    <a-menu class="user-dropdown-menu-wrapper">
                        <a-menu-item key="0">
                            <router-link to="/account/center">
                                <user-outlined />
                                个人中心
                            </router-link>
                        </a-menu-item>
                        <a-menu-item key="1">
                            <key-outlined />
                            修改密码
                        </a-menu-item>
                        <a-menu-item key="2" disabled>
                            <setting-outlined />
                            测试
                        </a-menu-item>
                        <a-menu-divider />
                        <a-menu-item key="3">
                            <a href="javascript:;" @click="handleLogout">
                                <poweroff-outlined />
                                退出登录
                            </a>
                        </a-menu-item>
                    </a-menu>
                </template>
            </a-dropdown>
        </div>
    </div>
</template>

<script>
import { ExclamationCircleOutlined, BugOutlined, CaretDownOutlined, UserOutlined, KeyOutlined, SettingOutlined, PoweroffOutlined } from "@ant-design/icons-vue"
import { reactive, createVNode, defineComponent, toRefs } from "vue"
import { Modal, message } from "ant-design-vue"
import { useRouter } from "vue-router"
import useStore from "@/store"
import { debounce } from "@/utils"

import { SketchPicker } from "vue-color"
import "vue-color/style.css"

export default defineComponent({
    name: "User",
    components: {
        CaretDownOutlined,
        UserOutlined,
        KeyOutlined,
        SettingOutlined,
        PoweroffOutlined,
        BugOutlined,
        SketchPicker
    },
    setup() {
        const state = reactive({
            avatar: "",
            nickname: "张三",
            userVisible: false,
            color: ""
        })
        const { system } = useStore()
        const userVisibleChange = (v) => {
            state.userVisible = v
        }
        const router = useRouter()
        const handleLogout = () => {
            Modal.confirm({
                title: "提示",
                icon: createVNode(ExclamationCircleOutlined),
                content: "真的要注销登录吗 ?",
                okText: "确定",
                cancelText: "取消",
                onOk() {
                    localStorage.removeItem("token")
                    message.success("安全退出")
                    setTimeout(() => {
                        router.replace("/user/login")
                    }, 500)
                },
                onCancel() {
                    console.log("Cancel")
                },
                class: "test"
            })
        }
        const isDev = import.meta.env.MODE === "development"

        const changePrimary = debounce((e) => {
            system.setPrimaryColor(e)
        }, 500)

        return {
            ...toRefs(state),
            system,
            handleLogout,
            userVisibleChange,
            changePrimary,
            isDev
        }
    }
})
</script>

<style scoped lang="less">
.user-wrapper {
    height: 100%;
}

.content-wrapper {
    display: flex;
    align-items: center;
    height: 100%;

    .action {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0 16px;
        height: 100%;
        transition: all 0.3s;
        cursor: pointer;
    }

    .avatar {
        margin-right: 8px;
    }

    .nickname {
        font-size: 14px;
        color: var(--text-color, #333);
    }

    .caretup-false {
        transition: all 0.25s;
        transform: rotate(0);
    }

    .caretup-true {
        transition: all 0.25s;
        transform: rotate(180deg);
    }

    :deep(.ant-switch-inner-checked) {
        display: flex;
        height: 22px;
        align-items: center;
    }

    :deep(.ant-switch-inner-unchecked) {
        display: flex;
        height: 22px;
        align-items: center;
    }

    .sun {
        width: 12px;
        height: 12px;
        background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='4'/%3E%3Cpath d='M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41'/%3E%3C/svg%3E") no-repeat;
    }

    .moon {
        width: 12px;
        height: 12px;
        background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z'/%3E%3C/svg%3E") no-repeat;
    }
}
</style>
