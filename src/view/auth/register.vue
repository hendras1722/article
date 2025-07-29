<template>
  <div class="flex items-center justify-center h-screen">
    <div class="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
      <h1 class="text-2xl font-bold mb-2 text-center">Register</h1>
      <UForm :schema="schema" :state="state" class="space-y-4 " @submit="onSubmit">
        <UFormField label="Username" name="username" required>
          <UInput v-model="state.username" class="w-full" />
        </UFormField>
        <UFormField label="Email" name="email" required>
          <UInput v-model="state.email" class="w-full" />
        </UFormField>

        <UFormField label="Password" name="password" required>
          <UInput v-model="state.password" type="password" class="w-full" />
        </UFormField>

        <UButton :disabled="isFetching" type="submit" class="w-full !inline-grid place-items-center" variant="solid"
          color="primary">
          Register
        </UButton>
      </UForm>
      <p class="mt-4 text-center text-gray-600">
        Sudah punya akun?
        <router-link to="/login" class="text-blue-500 hover:underline">Login sekarang</router-link>
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
  email: z.string().email('Invalid email').min(1, 'Email is required'),
  username: z.string().nonempty('Username is required'),

  password: z.string().nonempty('Password is required')
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  username: '',
  email: '',
  password: ''
})


const toast = useToast()
const router = useRouter()

const { execute, isFetching, error, data } = useMyFetch<string>('/api/auth/local/register', {
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
    toast.add({
      title: 'Success',
      description: 'Register Berhasil',
      color: 'success',
    })
    router.push('/login')

  }
}
</script>