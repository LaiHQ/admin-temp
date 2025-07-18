<template>
    <div class="home">
        <AiChat height="400px"></AiChat>
    </div>
</template>

<script setup>
import { onMounted, reactive, watch } from "vue"
import AiChat from "@/components/aiChat"

// import {getSystemRouter} from "@/api"

// http.get("/system/menu/getRouters",{}).then((res) => {
//     console.log(res)
// })

// getSystemRouter().then(res=>{
//     console.log(res)
// })

const state = reactive({})

onMounted(() => {})
</script>

<style scoped>
.home {
    height: calc(100vh - 120px);
}
</style>
