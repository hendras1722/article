<template>
  <div class="h-screen bg-gray-50 overflow-hidden">
    <div :class="[
      'fixed min-h-full left-0 z-50 bg-white shadow-lg transition-all duration-300 ease-in-out',
      sidebarCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'w-64'
    ]" :style="!sidebarCollapsed && sidebarWidth ? `width: ${sidebarWidth}px` : ''">
      <div class="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        <div class="flex items-center space-x-3 font-bold" v-if="!sidebarCollapsed">
          Hendra
        </div>
        <div v-else class="flex items-center space-x-3 font-bold">H</div>
      </div>

      <nav class="flex-1 px-2 py-4 space-y-1" aria-label="Sidebar">
        <UNavigationMenu :collapsed="sidebarCollapsed" :items="items" color="primary" orientation="vertical" />
      </nav>

      <div v-if="!sidebarCollapsed"
        class="absolute right-0 top-0 bottom-0 w-1 bg-transparent hover:bg-blue-500 cursor-col-resize transition-colors duration-150 group"
        @mousedown="startResize">
        <div class="w-full h-full group-hover:bg-blue-500 transition-colors duration-150"></div>
      </div>
    </div>


    <div v-if="!sidebarCollapsed"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
      @click="toggleSidebar"></div>

    <div :class="[
      'flex flex-col transition-all duration-300 ease-in-out min-h-screen',
      sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
    ]" :style="!sidebarCollapsed && sidebarWidth ? `margin-left: ${sidebarWidth}px` : ''">
      <header class="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4">
        <div class="flex items-center space-x-4">
          <UButton icon="i-heroicons-bars-3-16-solid" variant="ghost" @click="toggleSidebar">
          </UButton>
        </div>

        <div class="flex items-center space-x-4">

          <!-- Profile -->
          <div class="flex items-center space-x-3 gap-3 capitalize">
            {{ getMe.getMe?.username }}
            <div
              class="w-8 h-8 bg-gradient-to-r rounded-full flex items-center justify-center font-bold text-white uppercase"
              :style="{ backgroundColor: colorFromName(getMe.getMe?.username ? getMe.getMe?.username.slice(0, 1) : '') }">
              {{ getMe.getMe?.username.slice(0, 1) }}
            </div>
          </div>

          <UButton @click="async () => {
            await cookies.remove('token', {
              path: '/'
            })
            getMe.removeGetMe()
            router.push('/login')
          }">Logout</UButton>
        </div>
      </header>

      <main class="flex-1 p-6 overflow-auto max-h-[calc(100vh-64px)]">
        <div class="mx-auto">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <RouterView />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useCookies } from '@vueuse/integrations/useCookies'
import { useGetMe } from '../store/getme'
import { colorFromName } from '../utils/ColorFromName'

defineOptions({
  name: 'AdminLayout'
})

const route = useRoute()
const sidebarCollapsed = ref(false)
const sidebarWidth = ref(256)
const isResizing = ref(false)
const cookies = useCookies()
const router = useRouter()
const getMe = useGetMe()

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}


const startResize = (e: MouseEvent) => {
  isResizing.value = true
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

const handleResize = (e: MouseEvent) => {
  if (!isResizing.value) return

  const newWidth = e.clientX
  if (newWidth >= 200 && newWidth <= 400) {
    sidebarWidth.value = newWidth
  }
}

const stopResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

// Handle responsive behavior
onMounted(() => {
  const handleResize = () => {
    if (window.innerWidth < 1024) {
      sidebarCollapsed.value = true
    }
  }

  window.addEventListener('resize', handleResize)
  handleResize()

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })
})


const items = computed(() => [
  {
    label: 'Article',
    to: '/admin/article',
    icon: 'i-lucide-newspaper',
    active: route.path === '/admin/article',
    class: 'h-[50px]',
    activeClass: '!text-blue-600 !bg-blue-500 rounded-lg'
  },
  {
    label: 'Category',
    to: '/admin/category',
    active: route.path === '/admin/category',
    class: 'h-[50px]',
    icon: 'i-lucide-swatch-book'
  },

])
</script>