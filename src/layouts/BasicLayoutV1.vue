<!--
 * @Descripttion: 登录后布局组件
 * @version: 1.0.0
 * @Author: lai_hq@qq.com
 * @Date: 2021-12-23 13:35:18
 * @LastEditors: lai_hq@qq.com
 * @LastEditTime: 2023-06-19 00:08:41
-->
<template>
    <a-layout class="layout">
        <a-layout-header class="header header-fixed">
            <div class="collapsed-container" :style="{ marginLeft: collapsed ? '70px' : '200px' }">
                <menu-unfold-outlined :class="{
                    'collapsed-warp': true,
                    'is-collapsed': collapsed
                }" @click="handleChangeCollapsed" />
                <Breadcrumb style="margin-left: 20px" />
            </div>
            <User />
        </a-layout-header>
        <a-layout class="page-container-warp">
            <a-layout class="page-container" :style="`${!collapsed ? 'padding-left:208px' : 'padding-left:80px;'}`">
                <a-layout-sider class="layout-sider" width="208" style="background: #fff" v-model:collapsed="collapsed">
                    <div class="logo-container">
                        <Logo :collapsed="collapsed" />
                    </div>
                    <my-menu v-model:collapsed="collapsed" />
                </a-layout-sider>
                <a-layout-content :style="{ margin: 0 }">
                    <Tags></Tags>
                    <div class="router-view-container">
                        <router-view class="router-view" v-slot="{ Component }">
                            <transition enter-active-class="animate__animated animate__fadeIn">
                                <component :is="Component" :key="$route.path" />
                            </transition>
                            <div id="components-back-top-demo-custom" title="回到顶部">
                                <a-back-top>
                                    <vertical-align-top-outlined class="back-top-icon" />
                                </a-back-top>
                            </div>
                        </router-view>
                    </div>
                </a-layout-content>
                <!-- <a-layout-footer class="page-footer-warp">
                    {{ copyright }} ©2023 <a-button type="link" @click="$router.push('/updateLog')">v{{ curVersion }}</a-button>
                </a-layout-footer> -->
            </a-layout>
        </a-layout>
    </a-layout>
</template>
<script>
import { defineComponent, toRefs, reactive } from "vue"
import { MenuUnfoldOutlined, VerticalAlignTopOutlined } from "@ant-design/icons-vue"
import Logo from "./Logo"
import User from "./User"
import Breadcrumb from "./Breadcrumb"
import MyMenu from "./Menu"
import Tags from "./Tags"

import config from "../../config"
const { copyright, curVersion } = config
export default defineComponent({
    name: "BasicLayout",
    components: {
        User,
        Logo,
        Breadcrumb,
        MyMenu,
        Tags,
        MenuUnfoldOutlined,
        VerticalAlignTopOutlined
    },
    setup() {
        const state = reactive({
            collapsed: false
        })
        const handleChangeCollapsed = () => {
            state.collapsed = !state.collapsed
        }
        return {
            ...toRefs(state),
            copyright,
            curVersion,
            handleChangeCollapsed
        }
    }
})
</script>
<style lang="less" scoped>
@header-height: 58px;
@header-bg-color: #fff;
@page-bg-color: #f7f8fa;
// @page-bg-color: #fff;

.layout {
    min-height: 100vh;
    background: #fff;
}

.header {
    display: flex;
    justify-content: space-between;
    padding: 0 24px;
    // margin-bottom: 2px;
    height: @header-height;
    background: @header-bg-color;
    border-bottom: 1px solid #f0f0f0;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.08);
}

.header-fixed {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 10;
}

:deep(.layout-sider) {
    position: fixed;
    top: 0;
    left: 0;
    overflow: scroll;
    height: 100%;
    z-index: 10;

    &::-webkit-scrollbar {
        display: none;
    }

    .ant-menu:not(.ant-menu-horizontal) .ant-menu-item-selected {
        // background-color: @page-bg-color;
        background-color: #e8f8f3;
        border-radius: 8px;
        // margin: 4px;
    }

    .ant-menu-vertical .ant-menu-item::after,
    .ant-menu-vertical-left .ant-menu-item::after,
    .ant-menu-vertical-right .ant-menu-item::after,
    .ant-menu-inline .ant-menu-item::after {
        position: absolute;
        inset: 8px 208px 8px 0;
        border-radius: 5px;
        border-right: 4px solid @primary-color;
    }

    .ant-menu-vertical>.ant-menu-item,
    .ant-menu-vertical-left>.ant-menu-item,
    .ant-menu-vertical-right>.ant-menu-item,
    .ant-menu-inline>.ant-menu-item,
    .ant-menu-vertical>.ant-menu-submenu>.ant-menu-submenu-title,
    .ant-menu-vertical-left>.ant-menu-submenu>.ant-menu-submenu-title,
    .ant-menu-vertical-right>.ant-menu-submenu>.ant-menu-submenu-title,
    .ant-menu-inline>.ant-menu-submenu>.ant-menu-submenu-title {
        height: 40px;
        line-height: 40px;
        margin: 4px;
        width: calc(100% - 8px);
    }

    .ant-menu-sub.ant-menu-inline>.ant-menu-item,
    .ant-menu-sub.ant-menu-inline>.ant-menu-submenu>.ant-menu-submenu-title {
        height: 40px;
        line-height: 40px;
        margin: 4px;
        width: calc(100% - 8px);
    }
}

.page-container-warp {
    padding-top: @header-height;
    min-height: 100%;
    box-sizing: border-box;
    background: #ffff;

    .collapsed-warp {
        cursor: pointer;
        padding: 0 10px;
        transition: all 0.25s;
    }

    .is-collapsed {
        transform: rotateY(180deg);
    }
}

.page-container {
    // min-height: calc(100vh - @header-height);
    // background: @page-bg-color;
    background: #fff;
}

.page-footer-warp {
    text-align: center;
    background: @page-bg-color;
}

#components-back-top-demo-custom .ant-back-top {
    right: 40px;
    bottom: 120px;
}

#components-back-top-demo-custom .back-top-icon {
    width: 40px;
    height: 40px;
    font-size: 25px;
    text-align: center;
    color: #fff;
    background-color: @primary-color;
    border-radius: 50%;
    line-height: 50px;
}

.logo-container {
    display: flex;
    align-items: center;
    justify-content: center;
    // padding: 20px 0;
    height: @header-height;
    border-right: 1px solid #f0f0f0;
}

.collapsed-container {
    margin-left: 200px;
    display: flex;
    align-items: center;
}

.router-view-container {
    min-height: calc(100% - 38px);
    background: @page-bg-color;
    padding: 2px 10px 10px 10px;
}

.router-view {
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}
</style>
