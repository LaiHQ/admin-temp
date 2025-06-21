import useUserInfoStore from "./user"
import useSystemStore from "./system"
// 统一导出useStore方法
export default function useStore() {
    return {
        user: useUserInfoStore(),
        system: useSystemStore()
    }
}
