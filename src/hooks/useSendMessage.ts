import { ref, Ref, watch, watchEffect, nextTick } from "vue"
import { trim, debounce } from "@/utils/index"
import http from "@/utils/http"
import { v4 as uuid } from "uuid"

const autoScrollEnabled = ref(true)
const SCROLL_THRESHOLD = 50 // 距离底部的阈值，单位px

const handleScroll = (e: any) => {
    const distanceToBottom = e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight
    // 如果距离底部超过阈值，则认为用户不再希望自动滚动
    autoScrollEnabled.value = distanceToBottom <= SCROLL_THRESHOLD
}

/**
 * @param messages - 消息列表的响应式引用，类型为数组。当数组内容变化时会触发滚动操作。
 * @returns 一个响应式引用，指向用于滚动定位的 DOM 元素，可将其绑定到需要滚动到的目标元素上。
 */
export const useScrollToBottom = (messages: Ref<never[], never[]>) => {
    // autoScrollEnabled = true
    const refDom = ref<HTMLDivElement | null>(null)
    const scrollToBottom = () => {
        if (messages.value) {
            if (autoScrollEnabled.value) {
                refDom.value?.scrollIntoView({ behavior: "instant" })
            }
        }
    }
    watchEffect(() => {
        scrollToBottom()
    })
    return refDom
}

/**
 * 发送 SSE 请求的函数。
 *
 * @param params - 请求参数对象。
 */
export const useSendMessageWithSse = (url: string) => {
    const loading = ref(false)
    const disconnect = ref<(() => void) | undefined>()
    const data = ref<{ data: string; [key: string]: any }>({ data: "" })
    async function send(params: Record<string, any>) {
        try {
            loading.value = true
            const { stop, done, answer, response } = await http.sse(url, params)
            watch([done, answer], ([load, res]) => {
                if (!load) {
                    data.value = res
                } else {
                    loading.value = false
                    disconnect.value = undefined
                }
            })
            disconnect.value = stop
            return Promise.resolve(response)
        } catch (error) {
            console.error("SSE 请求出错:", error)
            loading.value = false
            return Promise.resolve(error)
        }
    }
    return {
        loading,
        send,
        answer: data,
        disconnect
    }
}

// 消息管理
export const useSelectDerivedMessages = () => {
    const derivedMessages = ref([])
    const setDerivedMessages = (list: any) => {
        derivedMessages.value = list
    }

    const refDom = useScrollToBottom(derivedMessages)

    const addNewestQuestion = (message = {}, answer = "") => {
        setDerivedMessages([
            ...derivedMessages.value,
            {
                ...message,
                id: uuid()
            },
            {
                role: "assistant",
                content: answer,
                id: uuid()
            }
        ])
    }

    const addNewestAnswer = (answer: string) => {
        setDerivedMessages([
            ...(derivedMessages.value?.slice(0, -1) ?? []),
            {
                role: "assistant",
                content: answer,
                timestamp: new Date().getTime(),
                id: uuid()
            }
        ])
    }

    const removeLatestMessage = () => {
        setDerivedMessages(derivedMessages.value?.slice(0, -2) ?? [])
    }

    return {
        derivedMessages,
        setDerivedMessages,
        addNewestQuestion,
        addNewestAnswer,
        refDom,
        removeLatestMessage
    }
}

// 回话页面相关 hook
export const useSendMessage = (conversationId: string) => {
    const value = ref("")
    const { loading, send, answer, disconnect } = useSendMessageWithSse("http://localhost:3000/ai/stream")
    const { derivedMessages, addNewestQuestion, addNewestAnswer, refDom, setDerivedMessages } = useSelectDerivedMessages()

    const toBottom = (behavior: "auto" | "instant" | "smooth" = "instant") => {
        nextTick(() => {
            refDom.value?.scrollIntoView({ behavior })
            autoScrollEnabled.value = true
        })
    }

    const handleInputChange = (e: any) => {
        const val = e.target?.value ?? e.detail.value
        const nextValue = val.replaceAll("\\n", "\n").replaceAll("\\t", "\t")
        value.value = nextValue
    }
    const handlePressEnter = () => {
        if (trim(value.value) === "") return
        if (loading.value) return
        // 1.发送消息
        beforeSendMessage(value.value)
        // 2.添加 新问题组装数据
        addNewestQuestion(
            {
                content: value.value,
                id: uuid,
                role: "user",
                timestamp: new Date().getTime()
            },
            "思考中🤔"
        )
        // 3.清空输入框
        value.value = ""

        // 4. 定位到底部
        toBottom()
    }
    // 发送消息  id 会话
    const sendMessage = async (message, id?: string) => {
        const res = await send({
            query: message
        })

        // console.log("_____", res)
    }

    const beforeSendMessage = async (message) => {
        // 如果是旧会话，直接发送消息

        if (conversationId !== "") {
            sendMessage(message)
        } else {
            // 1.创建会话
            // const { data } = await setConversation(value.value)
            // if (data.retcode === 0) {
            //     const id = data.data.id
            //     sendMessage(message, id)
            // }
        }
    }
    let _temp = ""
    watch([answer, loading], ([val, isEnd]) => {
        if (!isEnd) {
            _temp = ""
        } else {
            if (val.data) {
                _temp += val.data
                addNewestAnswer(_temp)
            }
        }
    })

    return {
        handleInputChange,
        handlePressEnter,
        handleScroll,
        autoScrollEnabled,
        setDerivedMessages,
        value,
        refDom,
        loading,
        derivedMessages,
        disconnect,
        handleToBottom: toBottom
    }
}
