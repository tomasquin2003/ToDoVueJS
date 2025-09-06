import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTodoStore = defineStore('todo', () => {
  const todos = ref<{ id: number; text: string; done: boolean }[]>(
    JSON.parse(localStorage.getItem('todos') || '[]')
  )

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
  function persist() {
    localStorage.setItem('todos', JSON.stringify(todos.value))
  }

  return { todos, add, remove, toggle, updateText, clearDone }
})
