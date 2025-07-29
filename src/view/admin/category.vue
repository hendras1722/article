<template>
  <div>
    <div class="flex justify-between">
      <UInput v-model="params.title">
        <template #leading>
          <Search class="w-4 h-4 text-slate-400" />
        </template>
      </UInput>
      <UButton @click="() => {
        isEdit = ''
        openModal = true
      }">Add Category</UButton>
    </div>
    <div class="flex flex-col gap-5 mt-5">
      <UTable :loading="loadingTable" :data="getData.data" :columns="columns" class="flex-1">
        <template #actions-cell="{ row }">
          <div class="flex gap-2">
            <UButton variant="soft" color="info" size="xs" @click="handleEdit(row.original)">Edit</UButton>
            <UButton variant="soft" color="error" size="xs" @click="handleDelete(row.original)">Delete</UButton>
          </div>
        </template>
      </UTable>
      <UPagination class="bg-transparent grid place-items-center " v-model:page="params.page" color="neutral"
        variant="subtle" :total="getData.meta.pagination.total" />
    </div>
    <UModal title="Delete Category" v-model:open="openModalDelete">
      <template #body>
        Apakah Kamu Yakin Ingin Menghapus Category Ini?
      </template>
      <template #footer>
        <UButton color="error" @click="onDelete">Delete</UButton>
      </template>
    </UModal>
    <UModal :title="isEdit ? 'Edit Category' : 'Add Category'" v-model:open="openModal">
      <template #body>
        <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
          <UFormField label="Title" name="name" required>
            <UInput v-model="state.name" class="w-full" />
          </UFormField>


          <UButton type="submit" class="w-full flex justify-center">
            Submit
          </UButton>
        </UForm>

      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
import { TableColumn } from '@nuxt/ui';
import { Search } from 'lucide-vue-next';
import { computed, reactive, ref, watch } from 'vue';
import { useMyFetch } from '../../composable/useApi';
import { useRoute } from 'vue-router';
import { debounce } from 'radash';
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { BaseResponse } from '../../type/BaseResponse';
import type { Category } from '../../type/Category';



const schema = z.object({
  name: z.string().min(3, 'Must be at least 3 characters'),
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  name: '',
})

const selected = ref<Category>()
const toast = useToast()
const route = useRoute()
const apiUrl = ref('/api/categories?pagination[page]=1&pagination[pageSize]=10&sort[0]=createdAt:desc')
const payload = ref<{ data: Schema }>({
  data: {
    name: '',
  }
})
const params = ref({ page: 1, pageSize: 10, title: '' })
const openModal = ref(false)
const openModalDelete = ref(false)
const isEdit = ref('')
const loadingTable = ref(false)

const debounceChange = debounce({ delay: 500 }, async (query: string) => {
  const url = new URLSearchParams(route.query as Record<string, string>)

  url.set('pagination[page]', "1")
  url.set('pagination[pageSize]', String(params.value.pageSize))
  if (query) {
    url.set('filters[name][$eqi]', String(query))
  }

  url.set('sort[0]', 'createdAt:desc')
  apiUrl.value = `/api/categories?${url.toString()}`
  await execute()
})

const columns: TableColumn<Category>[] = [
  {
    accessorKey: 'documentId',
    header: 'ID'
  },
  {
    accessorKey: 'name',
    header: 'Category'
  },
  {
    accessorKey: 'actions',
    header: ''
  }
]

const { data, isFetching, execute } = useMyFetch<string>(apiUrl)

watch(isFetching, (newValue) => {
  loadingTable.value = newValue
})

const getData = computed(() => {
  return data.value ? JSON.parse(data.value) as BaseResponse<Category[]> : { data: [], meta: { pagination: { page: 0, pageSize: 0, pageCount: 0, total: 0 } } } as BaseResponse<Category[]>
})

watch(params, (newValue) => {
  const url = new URLSearchParams(route.query as Record<string, string>)
  url.set('pagination[page]', String(newValue.page))
  url.set('pagination[pageSize]', String(newValue.pageSize))
  if (newValue.title) {
    debounceChange(newValue.title)
    return
  }
  url.set('sort[0]', 'createdAt:desc')

  apiUrl.value = `/api/categories?${url.toString()}`
  execute()
}, {
  deep: true
})



const { execute: executeCreate, error: errorCreate } = useMyFetch('/api/categories', {
  immediate: false,

}).post(payload)

async function onDelete() {
  const { execute: executeDelete, error: errorDelete } = useMyFetch('/api/categories/' + selected.value?.documentId, {
    immediate: false,

  }).delete()
  await executeDelete()
  if (!errorDelete.value) {
    toast.add({ title: 'Success', description: 'The form has been deleted.', color: 'success' })
    execute()
    openModalDelete.value = false
    return
  }
  toast.add({ title: 'Error', description: errorDelete.value, color: 'error' })
}

async function handleDelete(item: Category) {
  selected.value = item
  openModalDelete.value = true
}


function handleEdit(item: Category) {
  isEdit.value = '/api/categories/' + item.documentId
  openModal.value = true
  state.name = item.name
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  payload.value.data = { ...event.data }
  if (isEdit.value) {
    const { execute: executeEdit, error: errorEdit, } = useMyFetch(isEdit.value, {
      immediate: false,
    }).put(payload)
    await executeEdit()
    if (!errorEdit.value) {
      toast.add({ title: 'Success', description: 'The form has been edited.', color: 'success' })
      openModal.value = false
      isEdit.value = ''
      execute()
      state.name = ''
    }
  } else {
    await executeCreate()
    if (!errorCreate.value) {
      toast.add({ title: 'Success', description: 'The form has been submitted.', color: 'success' })
      openModal.value = false
      execute()
      state.name = ''
    }
  }
}



</script>