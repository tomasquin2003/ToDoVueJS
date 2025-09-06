<template>
  <div class="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
    <h1 class="text-2xl font-bold mb-4">To-Do + AI Assistant</h1>

    <form @submit.prevent="onAdd" class="flex gap-2 mb-4">
      <input v-model="text" placeholder="Añade una tarea..." class="flex-1 rounded-md p-2 border" />
      <button class="px-4 py-2 bg-indigo-600 text-white rounded-md">Añadir</button>
    </form>

    <ul class="space-y-2">
      <li v-for="t in store.todos" :key="t.id" class="flex items-center gap-3">
        <input type="checkbox" v-model="t.done" @change="store.toggle(t.id)" />
        <input v-model="t.text" @blur="() => store.updateText(t.id, t.text)" class="flex-1 bg-transparent" />
        <button @click="store.remove(t.id)" class="text-red-500">✖</button>
      </li>
    </ul>

    <div class="mt-4 flex justify-between items-center">
      <div class="text-sm text-slate-500">{{ remaining }} tareas pendientes</div>
      <div class="flex gap-2">
        <button @click="store.clearDone" class="text-sm px-3 py-1 border rounded">Limpiar hechas</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTodoStore } from '../stores/todoStore'

const store = useTodoStore()
const text = ref('')

function onAdd() {
  if (!text.value.trim()) return
  store.add(text.value.trim())
  text.value = ''
}

const remaining = computed(() => store.todos.filter(t => !t.done).length)
</script>
