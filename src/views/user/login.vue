<!--
 * @Descripttion: 登录页
 * @version: 1.0.0
 * @Author: lai_hq@qq.com
 * @Date: 2023-03-07 10:22:35
 * @LastEditors: lai_hq@qq.com
 * @LastEditTime: 2023-06-18 23:39:54
-->
<template>
    <div class="login">
        <div class="container">
            <div class="top">
                <div class="top-header">
                    <a href="/">
                        <img src="@/assets/logo.jpg" class="logo" alt="logo" />
                        <span class="title">{{ title }}</span>
                    </a>
                </div>
                <div class="desc">{{ description }}</div>
            </div>
            <div class="main">
                <a-form>
                    <a-tabs centered>
                        <a-tab-pane key="1" tab="账户密码登录">
                            <a-form-item v-bind="validateInfos.username">
                                <a-input size="large" placeholder="账号" v-model:value="modelRef.username">
                                    <template #prefix>
                                        <user-outlined />
                                    </template>
                                </a-input>
                            </a-form-item>
                            <a-form-item v-bind="validateInfos.pwd">
                                <a-input-password size="large" placeholder="密码" v-model:value="modelRef.pwd">
                                    <template #prefix>
                                        <lock-outlined />
                                    </template>
                                </a-input-password>
                            </a-form-item>
                        </a-tab-pane>
                    </a-tabs>
                    <a-form-item>
                        <a-checkbox>自动登录</a-checkbox>
                        <span class="forge-password" style="float: right">忘记密码</span>
                    </a-form-item>
                    <a-form-item style="margin-top: 24px">
                        <a-button size="large" type="primary" @click="submit" class="login-button" :loading="state.loginBtn" :disabled="state.loginBtn">确定</a-button>
                    </a-form-item>
                </a-form>
            </div>
            <footer class="footer">
                <div class="links">
                    <a href="">帮助</a>
                    <a href="">隐私</a>
                    <a href="">条款</a>
                </div>
                <div class="copyright">
                    Copyright © {{ copyright }}
                    <a href="https://beian.miit.gov.cn/" target="_blank" style="padding: 0 3px">{{ filingNo }}</a>
                    <strong>v{{ curVersion }}</strong>
                </div>
            </footer>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, toRaw, h } from "vue"
import { UserOutlined, LockOutlined, SmileOutlined } from "@ant-design/icons-vue"
import { Form } from "ant-design-vue"
import config from "../../../config"
import useStore from "@/store"
import { useRouter, useRoute } from "vue-router"
import { notification } from "ant-design-vue"
const router = useRouter()
const route = useRoute()
const { user } = useStore()
const { curVersion, title, filingNo, copyright, description } = config
const useForm = Form.useForm
const modelRef = reactive({
    username: "",
    pwd: ""
})
const rulesRef = reactive({
    username: [
        {
            required: true,
            message: "请输入账号"
        }
    ],
    pwd: [
        {
            required: true,
            message: "请输入密码"
        }
    ]
})
const state = reactive({
    loginBtn: false
})
const { resetFields, validate, validateInfos } = useForm(modelRef, rulesRef)

function timeFix() {
    const time = new Date()
    const hour = time.getHours()
    return hour < 9 ? "早上好" : hour <= 11 ? "上午好" : hour <= 13 ? "中午好" : hour < 20 ? "下午好" : "晚上好"
}
function submit() {
    validate()
        .then(async () => {
            state.loginBtn = true
            // login,getUserInfo
            user.setupInfo(toRaw(modelRef))
            localStorage.setItem("token", "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiIxODMyMDc4MjY3NSIsInNjb3BlIjpbImFsbCJdLCJyb2xlcyI6bnVsbCwibmFtZSI6Iui1luWNjuW8uiIsImlkIjoxNTE1OTU0NDc5NzAyODI3MDA5LCJ1c2VyVHlwZSI6bnVsbCwiZXhwIjoxNzUyODIyNzUxLCJiaWQiOjE1MTU5NDQ4NDMyMzc5MjQ4NjUsImp0aSI6ImUzZDFmZWNlLTEyNmQtNDVhNy1hYmU5LTg5ZGYwYjlhM2U0NyIsImNsaWVudF9pZCI6InlpZGUtY2xvdWQiLCJ1c2VybmFtZSI6IjE4MzIwNzgyNjc1In0.pGaf5yNg-_T2CSZivPiWnfbi_a2VDJg4iD__J2Lnx1QWyl2Imoko0xgKzse1jL-ehBwIRLrl2yB9VRL-nzot2xjYFgiqC6fKGkN9PJ20hUxqzdTJ1VgaYZYVhJlYv9rYd242ywWiWCHCCCsL2AaZdkiy3WE48rtgtWEMIQm0uEDYX_uNxH1iUBHgzQsh1xxDG0bRGOLYfZqRvViUKNmY5-DRxnt2KbrAhKP2cbpRKWQj22l8V7MrtM3xBczNGkhMIaEGX0BkMPAMxTDyL54NI2i9Tq7OLRl5b_ZH624cQzhdGJ51I1JcKgqfGj1axlZW5EdN8_BgbcWANMOUwQCZ0Q")

            await router.replace({
                path: "/"
            })
            notification.open({
                message: "欢迎",
                description: `${timeFix()}，欢迎回来`,
                icon: () => h(SmileOutlined, { style: "color: #108ee9" })
            })
        })
        .catch((err) => {
            console.log("error", err)
        })
        .finally(() => {
            state.loginBtn = false
        })
}
// import { login, getUserInfo } from "@/api"
// onMounted(() => {
//     console.log("login")
//     login({
//         username: "",
//         password: ""
//     })
//         .then((res) => {
//             console.log(res)
//         })
//         .catch(() => {})

//     getUserInfo()
//         .then((res) => {
//             console.log("UserInfo", res)
//         })
//         .catch(() => {})
// })
</script>

<style lang="less" scoped>
.login {
    height: 100%;

    .container {
        position: relative;
        padding: 110px 0 144px;
        width: 100%;
        min-height: 100%;
        background: #f0f2f5 url("@/assets/icons/login-bg.svg") no-repeat 50%;
        background-size: 100%;
    }

    .top {
        text-align: center;

        .top-header {
            height: 44px;
            line-height: 44px;

            .badge {
                position: absolute;
                display: inline-block;
                margin-top: -10px;
                margin-left: -12px;
                opacity: 0.8;
                line-height: 1;
                vertical-align: middle;
            }

            .logo {
                margin-right: 16px;
                height: 44px;
                border-style: none;
                border-radius: 50%;
                vertical-align: top;
            }

            .title {
                position: relative;
                top: 2px;
                font-size: 33px;
                font-family: Avenir, "Helvetica Neue", Arial, Helvetica, sans-serif;
                color: rgb(0 0 0 / 85%);
                font-weight: 600;
            }
        }

        .desc {
            margin-top: 12px;
            margin-bottom: 40px;
            font-size: 14px;
            color: rgb(0 0 0 / 45%);
        }
    }

    .main {
        margin: 0 auto;
        width: 368px;
        min-width: 260px;

        .login-button {
            width: 100%;
        }
    }

    .footer {
        position: absolute;
        bottom: 0;
        padding: 0 16px;
        margin: 48px 0 24px;
        width: 100%;
        text-align: center;

        .links {
            margin-bottom: 8px;
            font-size: 14px;

            a {
                margin-right: 40px;
            }
        }

        .copyright {
            font-size: 14px;
            color: rgb(0 0 0 / 45%);
        }
    }
}
</style>
