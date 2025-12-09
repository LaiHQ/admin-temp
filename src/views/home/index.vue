<template>
    <div class="home">
      
        <AiChat :tags="state.tags" :height="`calc(100vh - 420px)`" style="border: 1px solid #e5e5e5;" title="前端小助手"></AiChat>

       

       
    </div>
</template>

<script setup>
import { onMounted, reactive, watch } from "vue"
import AiChat from "@/components/aiChat"
import axios from 'axios'


const state = reactive({
    tags: []
})

function queryTags() {
    axios.get('http://localhost:11434/api/tags').then(res=>{
      console.log(res.data.models)
      state.tags = res.data.models
    })
}


async function streamChatWithFetch(messages, model = 'deepseek-r1:8b',callback) {
  try {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log('\n--- 流结束 ---');
        break;
      }

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {        
         try {
            const data = JSON.parse(line);            
            if (data.message?.content) {
              const content = data.message.content;             
              fullResponse += content;
              callback(fullResponse)
            }            
            if (data.done) {
              console.log('\n生成完成');
            }
            
          } catch (e) {
            // 忽略解析错误
          }
      }
    }

  
    return fullResponse;

  } catch (error) {
    console.error('错误:', error.message);
  }
}
//  streamChatWithFetch([
//   { role: 'user', content: '你好，请用中文回答' }
// ],'deepseek-unlocked:latest',(res)=>{
//   console.log(res)
// });



// import {getSystemRouter} from "@/api"

// http.get("/system/menu/getRouters",{}).then((res) => {
//     console.log(res)
// })

// getSystemRouter().then(res=>{
//     console.log(res)
// })

onMounted(() => {

  queryTags()
})
</script>

<style scoped>
.home {
    height: calc(100vh - 120px);
}
</style>
