<template>
  <div class="w-96 p-6 bg-white rounded-2xl shadow-lg space-y-4">
    <h2 class="font-semibold text-lg">AI Assistant</h2>

    <textarea v-model="prompt" rows="3" placeholder="Pídele al asistente..." class="w-full p-2 border rounded"></textarea>

    <div class="flex gap-2">
      <button @click="ask('resume')" class="flex-1 btn">Resumir tareas</button>
      <button @click="ask('prioritize')" class="flex-1 btn-outline">Priorizar</button>
    </div>

    <div class="mt-2">
      <button @click="ask('generate_3')" class="w-full py-2 border rounded">Generar 3 tareas</button>
    </div>

    <div v-if="loading" class="mt-3 text-sm text-slate-500">Consultando AI...</div>

    <div v-if="response" class="mt-3 p-3 bg-slate-50 rounded">
      <pre class="whitespace-pre-wrap text-sm">{{ response }}</pre>
      <div class="mt-2 flex gap-2">
        <button @click="applySuggested" class="px-3 py-1 border rounded">Aplicar sugerencias</button>
        <button @click="copy" class="px-3 py-1 border rounded">Copiar</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTodoStore } from '../stores/todoStore'

const prompt = ref('')
const response = ref('')
const loading = ref(false)
const store = useTodoStore()

async function ask(mode: string) {
  loading.value = true
  response.value = ''
  const payloadPrompt = prompt.value || (mode === 'resume' ? 'Resume las tareas en 3 bullets.' : (mode === 'prioritize' ? 'Prioriza estas tareas del más urgente al menos urgente.' : 'Genera 3 tareas útiles para hoy.'))
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        prompt: payloadPrompt,
        mode,
        tasks: store.todos
      })
    })
    const data = await res.json()
    response.value = data.assistant ?? JSON.stringify(data)
  } catch (e: any) {
    response.value = 'Error: ' + e.message
  } finally {
    loading.value = false
  }
}

function applySuggested(){
  const lines = (response.value || '').split('\n').map(l => l.trim()).filter(Boolean).slice(0,5)
  for (const l of lines){
    const text = l.replace(/^\d+[\).\s-]+/, '')
    store.add(text)
  }
}

function copy(){
  navigator.clipboard?.writeText(response.value)
}
</script>

<style>
.btn { background:#4f46e5; color:white; padding:.5rem; border-radius:.375rem }
.btn-outline { border:1px solid #c7d2fe; padding:.5rem; border-radius:.375rem }
</style>
