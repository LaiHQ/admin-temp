<template>
    <div class="home">
        <AiChat  :height="`calc(100vh - 420px)`" style="border: 1px solid #e5e5e5;" title="前端小助手"></AiChat>

        <!-- <div style="width: 792px; height: 1123px; border: 1px solid #333; position: relative; ">
            <div style="position: absolute; left: 600px; top: 700px; width: 200px; height: 200px; border: 1px solid #333"></div>
        </div>

        <div style="width: 375px; height: 667px; border: 1px solid #333; position: relative">
            <div
                :style="{
                    left: `${600 / scale}px`,
                    top: `${700 / scale}px`,
                    width: `${200 / scale}px`,
                    height: `${200 / scale}px`
                }"
                style="position: absolute; border: 1px solid #333"
            ></div>
        </div> -->
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

const scale = parseFloat((792 / 375).toFixed(2))

const state = reactive({})


onMounted(() => {})
</script>

<style scoped>
.home {
    height: calc(100vh - 120px);
}
</style>
