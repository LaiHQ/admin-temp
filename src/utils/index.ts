/*
 * @Descripttion: 工具函数
 * @version: 1.0.0
 * @Author: lai_hq@qq.com
 * @Date: 2023-03-14 09:42:23
 * @LastEditors: lai_hq@126.com
 * @LastEditTime: 2023-04-02 00:52:28
 */
export const log = (options?: unknown) => {
    if (typeof options !== "object") {
        // eslint-disable-next-line no-undef
        console.log(options)
        return
    }
    const defaultOptions = {
        label: "",
        value: "",
        color: "#FFF",
        labelColor: "#606060",
        valueColor: "#1475b2",
        url: "",
        ...options
    }
    const { label, value, color, labelColor, valueColor, url } = defaultOptions
    const labelStyle = `padding: 3px; border-radius: 3px 0 0 3px;color: ${color}; background:${labelColor}`
    const valueStyle = `padding: 3px 6px 3px 0; border-radius: 0 3px 3px 0;color:${color}; background:${valueColor}`
    console.log(`%c ${label} %c  ${value}`, labelStyle, valueStyle, url)
}

export function printItemInfo() {
    const clientVersion = document.querySelector("meta[name*='version']")

    if (clientVersion) {
        // eslint-disable-next-line no-unsafe-optional-chaining
        const [version, time] = clientVersion?.content.split("-")
        log({
            label: "Version",
            value: `v${version}`
        })
        log({
            label: "Build Date",
            value: new Date(+time).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })
        })
    }
    log({
        label: "Environment",
        value: `${import.meta.env.VITE_USER_NODE_ENV}`,
        valueColor: "#42c02e"
    })
}

/**
 * @description: 上报错误日志
 */
export function reportErrorLog(info: object) {
    console.error("上报错误日志：", info)
}

/**
 * @description: 函数防抖
 * @param {function} function 执行函数
 * @param {delay} delay 时间
 */
export function debounce(fn: Function, delay: number) {
    let timer = 0
    return function (this: any, ...args: any[]) {
        const context = this
        if (timer) {
            clearTimeout(timer)
        }
        timer = setTimeout(() => {
            fn.apply(context, args)
        }, delay)
    }
}

/**
 * @description: 控制全局Loading开关
 * @param {string} display "show" | "hide" 显示或者隐藏
 * @param {string} tip 提示文字
 */
export function globalLogin(display: "show" | "hide", tip?: string) {
    const loginDom = document.getElementsByTagName("loading-card")[0]
    if (loginDom) {
        loginDom.setAttribute("tip", tip || "loading...")
        loginDom.setAttribute("spinning", display)
    }
}

export function setRootVariable(name: string, value: string) {
    document.documentElement.style.setProperty(name, value)
}

export function trim(string: string, chars?: string) {
    if (string === null) {
        return ""
    }

    const str = String(string)

    // 如果没有指定chars，使用默认的空白字符
    if (chars === undefined) {
        return str.trim()
    }

    // 处理空字符串情况
    if (chars === "") {
        return str
    }

    const escapedChars = escapeRegExp(chars)
    const pattern = new RegExp(`^[${escapedChars}]+|[${escapedChars}]+$`, "g")

    return str.replace(pattern, "")
}

function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
