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


