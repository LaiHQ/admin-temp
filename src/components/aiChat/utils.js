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



export const speech = {
    _utterance: null,       // 当前语音实例
    _isPlaying: false,      // 是否正在播放
    _isPaused: false,       // 是否处于暂停状态

    /**
     * 播放文本语音
     * @param {string} text - 要朗读的文本
     * @param {object} [options] - 配置选项
     * @param {number} [options.rate=1] - 语速 (0.1-10)
     * @param {number} [options.pitch=1] - 音高 (0-2)
     * @param {number} [options.volume=1] - 音量 (0-1)
     * @param {string} [options.lang="zh-CN"] - 语言代码
     * @param {string} [options.voice] - 指定语音名称或语言代码
     * @returns {Promise<void>} 播放完成后resolve
     */
    async play(text, options = {}) {
        // 停止当前播放
        this.stop();

        if (!window.speechSynthesis) {
            throw new Error("浏览器不支持语音合成功能");
        }

        return new Promise((resolve, reject) => {
            this._utterance = new SpeechSynthesisUtterance(text);
            this._isPlaying = true;
            this._isPaused = false;

            // 设置语音参数
            this._utterance.rate = options.rate || 1.2;      // 语速
            this._utterance.pitch = options.pitch || 1;     // 音调
            this._utterance.volume = options.volume || 1;  // 音量
            this._utterance.lang = options.lang || "zh-CN"; // 语言

            // 选择指定语音
            if (options.voice) {
                const voices = speechSynthesis.getVoices();
                const selectedVoice = voices.find(
                    (v) => v.name === options.voice || v.lang === options.voice
                );
                if (selectedVoice) this._utterance.voice = selectedVoice;
            }

            // 播放结束事件
            this._utterance.onend = () => {
                this._isPlaying = false;
                resolve();
            };
            
            // 播放错误事件
            this._utterance.onerror = (event) => {
                this._isPlaying = false;
                reject(event.error);
            };

            // 开始播放
            speechSynthesis.speak(this._utterance);
        });
    },

    /**
     * 停止当前播放
     */
    stop() {
        if (this._isPlaying) {
            speechSynthesis.cancel();
            this._isPlaying = false;
            this._isPaused = false;
            this._utterance = null;
        }
    },

    /**
     * 暂停播放
     */
    pause() {
        if (this._isPlaying && !this._isPaused) {
            speechSynthesis.pause();
            this._isPaused = true;
        }
    },

    /**
     * 继续播放
     */
    resume() {
        if (this._isPlaying && this._isPaused) {
            speechSynthesis.resume();
            this._isPaused = false;
        }
    },

    /**
     * 获取可用语音列表
     * @returns {Promise<SpeechSynthesisVoice[]>} 可用的语音列表
     */
    getVoices() {
        return new Promise((resolve) => {
            const voices = speechSynthesis.getVoices();
            if (voices.length) {
                resolve(voices);
            } else {
                // 如果语音列表未加载，等待加载完成
                speechSynthesis.onvoiceschanged = () => {
                    resolve(speechSynthesis.getVoices());
                };
            }
        });
    },

    /**
     * 检查是否正在播放
     * @returns {boolean} 正在播放返回true
     */
    isPlaying() {
        return this._isPlaying;
    },

    /**
     * 检查是否处于暂停状态
     * @returns {boolean} 暂停状态返回true
     */
    isPaused() {
        return this._isPaused;
    },

    /**
     * 获取当前播放状态
     * @returns {string} 'playing'-播放中 | 'paused'-已暂停 | 'stopped'-已停止
     */
    getState() {
        if (this._isPaused) return 'paused';
        if (this._isPlaying) return 'playing';
        return 'stopped';
    },

    /**
     * 设置语音参数（适用于下次播放）
     * @param {object} options - 语音参数
     * @param {number} [options.rate] - 语速
     * @param {number} [options.pitch] - 音高
     * @param {number} [options.volume] - 音量
     */
    setOptions(options) {
        if (this._utterance) {
            if (options.rate !== undefined) this._utterance.rate = options.rate;
            if (options.pitch !== undefined) this._utterance.pitch = options.pitch;
            if (options.volume !== undefined) this._utterance.volume = options.volume;
        }
    }
};