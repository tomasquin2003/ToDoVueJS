# ToDoVueJS

### Requisitos

- Node.js 18+ (recomendado 20+).

- npm (viene con Node).

- VS Code (recomendado) y extensión Tailwind CSS IntelliSense (opcional pero útil).

```
project-root/
└── frontend/
    ├── index.html
    ├── package.json
    ├── postcss.config.cjs
    ├── tailwind.config.cjs
    └── src/
        ├── main.js
        ├── index.css
        ├── App.vue
        ├── stores/
        │   └── todoStore.ts
        └── components/
            ├── TodoList.vue
            └── AISidebar.vue
```

## 1) Crear el proyecto (Vite + Vue)

Abre una terminal y ejecuta en la raiz del proyecto:

```
# scaffold frontend con Vite (elige "vue" si te lo pide)
npm create vite@latest frontend -- --template vue

cd frontend

npm install

```

## 2) Instalar dependencias adicionales
```
# dentro de frontend/

npm install pinia

# Tailwind v4 + PostCSS plugin recomendado por la guía v4

npm install -D tailwindcss @tailwindcss/postcss postcss autoprefixer
```

Si prefieres crear los archivos de configuración automáticamente:

```npx tailwindcss init -p```
(Esto puede generar  ```tailwind.config.js``` y ```postcss.config.js``` — en algunos setups con ```"type": "module" ```  es mejor renombrar a ```.cjs```. Esta guía usa ```.cjs``` para evitar conflictos ESM/CJS.)


## 3) Configuración mínima de PostCSS / Tailwind (Tailwind v4)

Crea ```postcss.config.cjs``` en la raíz ```frontend/``` con:

```

// postcss.config.cjs
module.exports = {
  plugins: [
    require('@tailwindcss/postcss'),
    require('autoprefixer'),
  ],
}
```

Crea ```tailwind.config.cjs```:

```

// tailwind.config.cjs
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

**Nota:** si tu ```package.json``` tiene ```"type": "module"```, usa archivos ```.cjs``` para PostCSS/Tailwind config para evitar errores de ESM/CJS.


## 4) src/index.css (Tailwind v4 minimal)

Crea o reemplaza ```src/index.css``` con:

```
/* src/index.css - Tailwind v4 import */
@import "tailwindcss";

/* utilidades locales (opcionales) */
.btn { @apply px-4 py-2 rounded-md bg-indigo-600 text-white; }
.btn-outline { @apply border px-3 py-2 rounded-md; }

```

**Importante:** en Tailwind v4 se usa ```@import "tailwindcss"```; (no ```@tailwind base;``` etc.).


## 5) Habilitar Pinia en src/main.js

```
// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './index.css'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')

```

## 6) Store (Pinia) — src/stores/todoStore.ts

Crea src/stores/todoStore.ts (TypeScript):

```
// src/stores/todoStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export type Todo = { id: number; text: string; done: boolean }

export const useTodoStore = defineStore('todo', () => {
  const todos = ref<Todo[]>(
    JSON.parse(localStorage.getItem('todos') || '[]')
  )

  function persist() {
    localStorage.setItem('todos', JSON.stringify(todos.value))
  }

  function add(text: string) {
    todos.value.push({ id: Date.now(), text, done: false })
    persist()
  }

  function remove(id: number) {
    todos.value = todos.value.filter(t => t.id !== id)
    persist()
  }

  function toggle(id: number) {
    const t = todos.value.find(x => x.id === id)
    if (t) t.done = !t.done
    persist()
  }

  function updateText(id: number, text: string) {
    const t = todos.value.find(x => x.id === id)
    if (t) t.text = text
    persist()
  }

  function clearDone() {
    todos.value = todos.value.filter(t => !t.done)
    persist()
  }

  function reorder(newList: Todo[]) {
    todos.value = newList
    persist()
  }

  return { todos, add, remove, toggle, updateText, clearDone, reorder }
})
```

## 7) Componentes: UI principal

**src/components/TodoList.vue**

```
<template>
  <div class="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
    <h1 class="text-2xl font-bold mb-4">To-Do</h1>

    <form @submit.prevent="onAdd" class="flex gap-2 mb-4">
      <input v-model="text" placeholder="Añade una tarea..." class="flex-1 rounded-md p-2 border" />
      <button class="btn">Añadir</button>
    </form>

    <ul class="space-y-2">
      <li v-for="t in store.todos" :key="t.id" class="flex items-center gap-3">
        <input type="checkbox" v-model="t.done" @change="store.toggle(t.id)" />
        <input v-model="t.text" @blur="() => store.updateText(t.id, t.text)" class="flex-1 bg-transparent outline-none" />
        <button @click="store.remove(t.id)" class="text-red-500">✖</button>
      </li>
    </ul>

    <div class="mt-4 flex justify-between items-center text-sm">
      <div class="text-slate-500">{{ remaining }} pendientes</div>
      <button @click="store.clearDone" class="btn-outline">Limpiar hechas</button>
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

```

**src/components/AISidebar.vue (panel de utilidades local)**

```

<template>
  <div class="w-96 p-6 bg-white rounded-2xl shadow-lg space-y-4">
    <h2 class="font-semibold text-lg">Acciones rápidas</h2>

    <textarea v-model="note" rows="3" placeholder="Nota (opcional)..." class="w-full p-2 border rounded"></textarea>

    <div class="grid grid-cols-2 gap-2">
      <button @click="resume" class="btn">Resumir</button>
      <button @click="prioritize" class="btn-outline">Priorizar</button>
    </div>

    <button @click="generate3" class="w-full py-2 border rounded">Generar 3 tareas</button>

    <div v-if="response" class="mt-2 p-3 bg-slate-50 rounded">
      <pre class="whitespace-pre-wrap text-sm">{{ response }}</pre>
      <div class="mt-2 flex gap-2" v-if="suggestions.length">
        <button @click="applySuggested" class="btn-outline">Aplicar sugerencias</button>
        <button @click="clear" class="btn-outline">Limpiar</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTodoStore } from '../stores/todoStore'

const store = useTodoStore()
const note = ref('')
const response = ref('')
const suggestions = ref<string[]>([])

function resume() {
  const total = store.todos.length
  const done = store.todos.filter(t => t.done).length
  const pending = total - done
  const first = store.todos.slice(0, 3).map((t, i) => `${i + 1}. ${t.text}${t.done ? ' ✅' : ''}`).join('\n') || 'No hay tareas aún.'
  response.value = `Resumen:\n• Total: ${total}\n• Hechas: ${done}\n• Pendientes: ${pending}\n\nPrimeras:\n${first}`
  suggestions.value = []
}

function prioritize() {
  const pending = store.todos.filter(t => !t.done)
  const done = store.todos.filter(t => t.done)
  store.reorder([ ...pending, ...done ])
  response.value = 'Prioridad aplicada: pendientes primero.'
  suggestions.value = []
}

function generate3() {
  const bank = [
    'Revisar correo importante',
    'Organizar tareas de la semana',
    'Subir cambios a Git con mensaje claro',
    'Limpiar la carpeta de descargas',
    'Repasar apuntes de la materia',
    'Planear 3 objetivos para hoy'
  ]
  const pick = (arr: string[], n: number) => arr.sort(() => Math.random() - 0.5).slice(0, n)
  suggestions.value = pick(bank, 3)
  response.value = suggestions.value.map((s, i) => `${i + 1}. ${s}`).join('\n')
}

function applySuggested() {
  for (const s of suggestions.value) store.add(s)
  response.value = 'Tareas agregadas ✅'
  suggestions.value = []
}

function clear() {
  response.value = ''
  suggestions.value = []
}
</script>

<style>
.btn { @apply bg-indigo-600 text-white py-2 rounded-md; }
.btn-outline { @apply border py-2 rounded-md; }
</style>

```

## 8) src/App.vue

```
<template>
  <div class="min-h-screen p-8 flex gap-6 bg-slate-100">
    <TodoList />
    <AISidebar />
  </div>
</template>

<script setup>
import TodoList from './components/TodoList.vue'
import AISidebar from './components/AISidebar.vue'
</script>

```

## 9) Ejecutar la app en desarrollo

Dentro de **frontend/**:

```
npm run dev
```

Abre la URL que te muestre Vite (por defecto http://localhost:5173).

Para build de producción:
```
npm run build
npm run preview
```