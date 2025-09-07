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
