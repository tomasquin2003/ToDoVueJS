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
