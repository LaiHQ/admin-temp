import { defineStore } from "pinia"

const useSystem = defineStore("system", {
    state: () => {
        return {
            primaryColor: "#00B781",
            language: "zh-cn",
            theme: "light"
        }
    },
    getters: {
        getCurrentTheme(state) {
            return state.theme
        },
        getPrimaryColor(state) {
            return state.primaryColor
        },
        getLanguage(state) {
            return state.language
        }
    },
    actions: {
        setPrimaryColor(color: string) {
            this.primaryColor = color
        },
        setLanguage(language: string) {
            this.language = language
        },
        setCurrentTheme(theme: string) {
            this.theme = theme
        }
    },
    persist: {
        key: "system",
        paths: ["primaryColor", "language", "theme"],
        debug: import.meta.env.VITE_USER_NODE_ENV === "production",
        storage: {
            setItem(key: string, value: string) {
                window.localStorage.setItem(key, value)
            },
            getItem(key: string): string | null {
                return window.localStorage.getItem(key)
            }
        },
        beforeRestore: (ctx) => {
            console.log(`beforeRestore '${ctx.store.$id}'`)
        },

        afterRestore: (ctx) => {
            console.log(`afterRestore '${ctx.store.$id}'`)
        }
    }
})

export default useSystem as any
