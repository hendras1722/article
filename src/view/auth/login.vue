<template>
  <div class="flex items-center justify-center h-screen">
    <div class="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
      <h1 class="text-2xl font-bold mb-2 text-center">Login</h1>
      <UForm :schema="schema" :state="state" class="space-y-4 " @submit="onSubmit">
        <UFormField label="Email" name="identifier" required>
          <UInput v-model="state.identifier" class="w-full" />
        </UFormField>

        <UFormField label="Password" name="password" required>
          <UInput v-model="state.password" type="password" class="w-full" />
        </UFormField>

        <UButton :disabled="isFetching" type="submit" class="w-full !inline-grid place-items-center" variant="solid"
          color="primary">
          Submit
        </UButton>
      </UForm>
      <p class="mt-4 text-center text-gray-600">
        Belum punya akun?
        <router-link to="/register" class="text-blue-500 hover:underline">Daftar sekarang</router-link>
      </p>
    </div>

  </div>
</template>

<script setup lang="ts">
import z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { reactive } from 'vue'
import { useMyFetch } from '../../composable/useApi'
import { useCookies } from '@vueuse/integrations/useCookies'

import { useRouter } from 'vue-router'

const schema = z.object({
  identifier: z.string().email('Invalid email').min(1, 'Email is required'),
  password: z.string().nonempty('Password is required')
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  identifier: '',
  password: ''
})


const toast = useToast()
const cookies = useCookies()


const router = useRouter()

const { execute, isFetching, error, data } = useMyFetch<string>('/api/auth/local', {
  immediate: false,
}).post(state)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  await execute()
  if (error.value) {
    toast.add({
      title: 'Error',
      description: error.value.message,
      color: 'success',
    })
  } else {
    cookies.set('token', data.value && JSON.parse(data.value).jwt || '')
    toast.add({
      title: 'Success',
      description: 'Login Berhasil',
      color: 'success',
    })
    router.push('/')

  }
}
</script>