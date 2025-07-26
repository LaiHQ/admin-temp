export async function screenshot(cb) {
    try {
        // 请求屏幕共享权限
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                // displaySurface: "monitor" // 提示优先选择屏幕
            }, // 截取整个屏幕
            audio: false
        })

        const videoTrack = stream.getVideoTracks()[0]
        const imageCapture = new ImageCapture(videoTrack)
        const bitmap = await imageCapture.grabFrame()

        // 绘制到 Canvas 并导出
        const canvas = document.createElement("canvas")
        canvas.width = bitmap.width
        canvas.height = bitmap.height
        const ctx = canvas.getContext("2d")
        ctx.drawImage(bitmap, 0, 0)

        const image = canvas.toDataURL("image/png")
        videoTrack.stop() // 关闭屏幕共享

        cb && cb(image)
        // 下载截图
        // const link = document.createElement("a")
        // link.href = image
        // link.download = "screen-capture.png"
        // link.click()
    } catch (err) {
        console.error("截图失败:", err)
    }
}

function copyToClipboardFallback(text) {
    const textarea = document.createElement("textarea")
    textarea.value = text
    textarea.style.position = "fixed" // 防止页面滚动
    document.body.appendChild(textarea)
    textarea.select()

    try {
        const successful = document.execCommand("copy")
        const msg = successful ? "成功" : "失败"
        console.log("复制文本 " + msg)
        return successful
    } catch (err) {
        console.error("无法复制文本: ", err)
        return false
    } finally {
        document.body.removeChild(textarea)
    }
}

export async function copyText(text) {
    if (navigator.clipboard) {
        try {
            await navigator.clipboard.writeText(text)
            return true
        } catch (err) {
            console.error("Clipboard API 失败，使用降级方案", err)
            // 继续尝试降级方案
        }
    }

    // 降级方案
    return copyToClipboardFallback(text)
}



const speechUtils = {
    /**
     * 播放文字
     * @param {string} text - 要播放的文字
     * @param {object} [options] - 选项
     */
    speak(text, options = {}) {
        return new Promise((resolve, reject) => {
            if (!window.speechSynthesis) {
                reject(new Error("Speech synthesis not supported"))
                return
            }

            const utterance = new SpeechSynthesisUtterance(text)

            // 设置参数
            utterance.rate = options.rate || 1
            utterance.pitch = options.pitch || 1
            utterance.volume = options.volume || 1
            utterance.lang = options.lang || "zh-CN"

            // 语音选择
            if (options.voice) {
                const voices = speechSynthesis.getVoices()
                const selectedVoice = voices.find((v) => v.name === options.voice || v.lang === options.voice)
                if (selectedVoice) utterance.voice = selectedVoice
            }

            // 事件处理
            utterance.onend = () => resolve()
            utterance.onerror = (event) => reject(event.error)

            speechSynthesis.speak(utterance)
        })
    },

    /**
     * 停止当前播放
     */
    stop() {
        speechSynthesis.cancel()
    },

    /**
     * 暂停当前播放
     */
    pause() {
        speechSynthesis.pause()
    },

    /**
     * 继续播放
     */
    resume() {
        speechSynthesis.resume()
    },

    /**
     * 获取可用语音列表
     */
    getVoices() {
        return new Promise((resolve) => {
            const voices = speechSynthesis.getVoices()
            if (voices.length) {
                resolve(voices)
            } else {
                speechSynthesis.onvoiceschanged = () => {
                    resolve(speechSynthesis.getVoices())
                }
            }
        })
    }
}

function speak() {
    // 使用示例
    speechUtils
        .speak("你好，这是一个增强版语音示例",{
            lang: "zh-CN"
        })
        .then(() => console.log("播放完成"))
        .catch((err) => console.error("播放失败:", err))
}

// 获取语音列表
// speechUtils.getVoices().then((voicesList) => {
//     const list = voicesList.filter((item) => item.lang === "zh-CN")
//     console.log("可用语音:", list)
// })