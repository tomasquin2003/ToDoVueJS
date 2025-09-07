<template>
  <div class="max-w-xl mx-auto p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
    <h1 class="text-2xl font-bold mb-4">To-Do</h1>

    <form @submit.prevent="onAdd" class="flex gap-2 mb-4">
      <input v-model="text" placeholder="Añade una tarea..." class="flex-1 rounded-md p-2 border" />
      <select v-model="priority" class="rounded-md p-2 border">
        <option value="low">Baja</option>
        <option value="medium">Media</option>
        <option value="high">Alta</option>
      </select>
      <input type="date" v-model="dueDate" class="rounded-md p-2 border" />
      <button class="px-4 py-2 bg-indigo-600 text-white rounded-md">Añadir</button>
    </form>

    <h2 class="mt-2 font-semibold">Pendientes</h2>
    <TransitionGroup name="list" tag="ul" class="space-y-2">
      <li v-for="t in pendingTodos" :key="t.id" class="flex items-center gap-3">
        <input type="checkbox" :checked="t.done" @change="(e:any) => store.setDone(t.id, e.target.checked)" />
        <input v-model="t.text" @blur="() => store.updateText(t.id, t.text)" class="flex-1 bg-transparent" />
        <select :value="t.priority" @change="(e:any) => store.updatePriority(t.id, e.target.value)" class="rounded-md p-1 border">
          <option value="low">Baja</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
        </select>
        <input type="date" :value="t.dueDate || ''" @input="(e:any) => store.updateDueDate(t.id, e.target.value)" class="rounded-md p-1 border" />
        <button @click="store.remove(t.id)" class="text-red-500">✖</button>
      </li>
    </TransitionGroup>

    <h2 class="mt-6 font-semibold">Hechas</h2>
    <TransitionGroup name="list" tag="ul" class="space-y-2">
      <li v-for="t in doneTodos" :key="t.id" class="flex items-center gap-3 opacity-70">
        <input type="checkbox" :checked="t.done" @change="(e:any) => store.setDone(t.id, e.target.checked)" />
        <input v-model="t.text" @blur="() => store.updateText(t.id, t.text)" class="flex-1 bg-transparent line-through" />
        <select :value="t.priority" @change="(e:any) => store.updatePriority(t.id, e.target.value)" class="rounded-md p-1 border">
          <option value="low">Baja</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
        </select>
        <input type="date" :value="t.dueDate || ''" @input="(e:any) => store.updateDueDate(t.id, e.target.value)" class="rounded-md p-1 border" />
        <button @click="store.remove(t.id)" class="text-red-500">✖</button>
      </li>
    </TransitionGroup>

    <div class="mt-4 flex justify-between items-center">
      <div class="text-sm text-slate-500">{{ remaining }} tareas pendientes</div>
      <div class="flex gap-2">
        <button @click="store.clearDone" class="text-sm px-3 py-1 border rounded">Limpiar hechas</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTodoStore } from '../stores/todoStore'

const store = useTodoStore()
const text = ref('')
const priority = ref<'low'|'medium'|'high'>('medium')
const dueDate = ref('')

function onAdd() {
  if (!text.value.trim()) return
  store.add(text.value.trim(), priority.value, dueDate.value || null)
  text.value = ''
  priority.value = 'medium'
  dueDate.value = ''
}

const remaining = computed(() => store.todos.filter(t => !t.done).length)
const pendingTodos = computed(() => store.todos.filter(t => !t.done))
const doneTodos = computed(() => store.todos.filter(t => t.done))
</script>
