/*
 * @Descripttion: 入口文件
 * @version: 1.0.0
 * @Author: lai_hq@qq.com
 * @Date: 2023-02-20 19:52:42
 * @LastEditors: lai_hq@qq.com
 * @LastEditTime: 2023-06-18 22:47:00
 */

import { createApp } from "vue"
import App from "./App.vue"
import { createPinia } from "pinia"
import piniaPluginPersistedstate from "pinia-plugin-persistedstate"
import router from "./router"
import "animate.css/animate.min.css"
import { name, version } from "../package.json"
import "./style/reset.css"
import "virtual:svg-icons-register"
import { HomeOutlined, UnorderedListOutlined, SettingOutlined } from "@ant-design/icons-vue"

const app = createApp(App)

const icons = [HomeOutlined, UnorderedListOutlined, SettingOutlined]

for (const i in icons) {
    app.component(icons[i].displayName, icons[i])
}

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(router)
    .use(pinia)
    .mount("#app")
    .$nextTick(() => {
        window.localStorage.setItem(`${name}-version`, version)
    })
