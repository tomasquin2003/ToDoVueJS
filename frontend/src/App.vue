<template>
  <div class="min-h-screen p-8 flex gap-6">
    <TodoList />
    <AISidebar />
  </div>
</template>

<script setup lang="ts">
import TodoList from './components/TodoList.vue'
import AISidebar from './components/AISidebar.vue'
</script>
