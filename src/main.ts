import './assets/main.css'

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import uiPlugin from '@nuxt/ui/vue-plugin'

import App from './App.vue'
import AdminLayout from './layouts/AdminLayout.vue'
import { useGetMe } from './store/getme'
import { createPinia } from 'pinia'
import { useCookies } from '@vueuse/integrations/useCookies'
import { useMyFetch } from './composable/useApi'

const app = createApp(App)

const router = createRouter({
  routes: [
    {
      path: '/',
      component: () => import('./view/home.vue'),
      meta: {
        layout: 'default',
      },
    },
    {
      path: '/article/:id',
      component: () => import('./view/detail.vue'),
      meta: {},
    },
    {
      path: '/admin/article',
      component: AdminLayout,
      children: [
        {
          path: '',
          component: () => import('./view/admin/article.vue'),
        },
      ],
      meta: {},
    },
    {
      path: '/admin/category',
      component: AdminLayout,
      children: [
        {
          path: '',
          component: () => import('./view/admin/category.vue'),
        },
      ],
      meta: {},
    },
    {
      path: '/login',
      component: () => import('./view/auth/login.vue'),
      meta: {},
    },
    {
      path: '/register',
      component: () => import('./view/auth/register.vue'),
      meta: {},
    },
  ],
  history: createWebHistory(),
})
const pinia = createPinia()
app.use(pinia)

router.beforeEach(async (to, _, next) => {
  const getMe = useGetMe()
  const cookies = useCookies()
  const token = cookies.get('token')

  if (!token && !['/login', '/register'].includes(to.path)) {
    return next('/login')
  }
  if (token) {
    const { data } = await useMyFetch<string>('/api/users/me')
    getMe.setGetMe(data.value ? JSON.parse(data.value) : '')
  }

  next()
})

app.use(uiPlugin)
app.use(router)

app.mount('#app')
