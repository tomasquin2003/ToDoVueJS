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
        ├── composables/
        │   └── useDarkMode.ts
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

```--template vue ```  indica que queremos una plantilla de Vue 3 lista para empezar.

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

- PostCSS actúa como procesador intermedio que aplica plugins (Tailwind y Autoprefixer).

- El archivo ```tailwind.config.cjs``` indica dónde buscar clases CSS en el código.


## 4) src/index.css (Tailwind v4 minimal)

Crea ```src/index.css``` con:

```
/* src/index.css - Tailwind v4 import */
@import "tailwindcss";

html {
  color-scheme: light dark;
}

/* Tailwind v4: habilitar dark mode por clase */
@custom-variant dark (&:where(.dark, .dark *));

/* Transiciones de listas */
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(4px); }
.list-enter-active, .list-leave-active { transition: all 200ms ease; }
.list-move { transition: transform 200ms ease; }

```

```@import "tailwindcss"``` carga las utilidades.

Se define ```dark``` como variante, permitiendo aplicar modo oscuro por clase ```(.dark)```.

Se agregan transiciones suaves para animaciones de lista, mejorando la UX.

**Importante:** en Tailwind v4 se usa ```@import "tailwindcss"```; (no ```@tailwind base;``` etc.).


## 5) Habilitar Pinia en src/main.js
tu main.js debe verse asi:

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

```createApp``` crea la instancia raíz.

```app.use(createPinia())``` inyecta el store global para que cualquier componente acceda al estado centralizado.

```app.mount``` monta la app en el DOM (#app en index.html).

## 6) Store (Pinia) — src/stores/todoStore.ts


Crea src/stores/todoStore.ts (TypeScript):

```
// src/stores/todoStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

type Priority = 'low' | 'medium' | 'high'
type Task = { id: number; text: string; done: boolean; priority: Priority; dueDate: string | null }

export const useTodoStore = defineStore('todo', () => {
  const loaded = JSON.parse(localStorage.getItem('todos') || '[]') as any[]
  const todos = ref<Task[]>(
    Array.isArray(loaded)
      ? loaded.map((t: any) => ({
          id: Number(t?.id) || Date.now(),
          text: String(t?.text ?? ''),
          done: Boolean(t?.done),
          priority: (t?.priority === 'low' || t?.priority === 'medium' || t?.priority === 'high') ? t.priority : 'medium',
          dueDate: typeof t?.dueDate === 'string' ? t.dueDate : null,
        }))
      : []
  )

  function add(text: string, priority: Priority = 'medium', dueDate: string | null = null) {
    todos.value.push({ id: Date.now(), text, done: false, priority, dueDate })
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
  function setDone(id: number, done: boolean) {
    const t = todos.value.find(x => x.id === id)
    if (t) t.done = done
    persist()
  }
  function updateText(id: number, text: string) {
    const t = todos.value.find(x => x.id === id)
    if (t) t.text = text
    persist()
  }
  function updatePriority(id: number, priority: Priority) {
    const t = todos.value.find(x => x.id === id)
    if (t) t.priority = priority
    persist()
  }
  function updateDueDate(id: number, dueDate: string | null) {
    const t = todos.value.find(x => x.id === id)
    if (t) t.dueDate = dueDate && dueDate.length > 0 ? dueDate : null
    persist()
  }
  function clearDone() {
    todos.value = todos.value.filter(t => !t.done)
    persist()
  }
  function persist() {
    localStorage.setItem('todos', JSON.stringify(todos.value))
  }

  return { todos, add, remove, toggle, setDone, updateText, updatePriority, updateDueDate, clearDone }
})

```
Definimos un store ```useTodoStore``` con:

Estado reactivo (todos).

Acciones: add, remove, toggle, updateText, etc.

Persistencia en ```localStorage``` para mantener tareas entre recargas.

## 7) Componentes: UI principal

**src/components/TodoList.vue**

```
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

```
aqui incluimos: 

- Formulario para añadir tareas con texto, prioridad y fecha.

- Lista de tareas pendientes y hechas, con edición en línea.

- Animaciones con TransitionGroup.

- Botón para limpiar tareas completadas.

## 8) Añadir modo oscuro
crea src/composables/useDarkMode.ts de la siguiente manera:

```
import { ref, onMounted, watchEffect } from 'vue'

const STORAGE_KEY = 'color-scheme'

export function useDarkMode() {
  const isDark = ref(false)

  function applyClass(value: boolean) {
    const root = document.documentElement
    if (value) root.classList.add('dark')
    else root.classList.remove('dark')
  }

  function loadInitial() {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') {
      isDark.value = stored === 'dark'
    } else {
      isDark.value = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyClass(isDark.value)
  }

  function toggle() {
    isDark.value = !isDark.value
  }

  onMounted(loadInitial)

  watchEffect(() => {
    applyClass(isDark.value)
    localStorage.setItem(STORAGE_KEY, isDark.value ? 'dark' : 'light')
  })

  return { isDark, toggle }
}




```

creamos un composable que encapsula la lógica de modo oscuro:

- Detecta configuración del sistema.

-  Guarda preferencia en localStorage.

- Alterna clase .dark en ```<html>```.

## 9) src/App.vue

Definimos el layout global.

Integramos el botón de modo oscuro con el composable.

Centralizamos la UI principal.

```
<template>
  <div class="min-h-screen p-8 flex gap-6 bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
    <div class="absolute top-4 right-4 flex items-center gap-2">
      <button @click="toggle()" class="px-3 py-1 text-sm border rounded">
        {{ isDark ? 'Claro' : 'Oscuro' }}
      </button>
    </div>
    <TodoList />
  </div>
  
</template>

<script setup lang="ts">
import TodoList from './components/TodoList.vue';
import { useDarkMode } from './composables/useDarkMode';

const { isDark, toggle } = useDarkMode()
</script>


```

## 10) Ejecutar la app en desarrollo

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