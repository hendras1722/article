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
      }">Add Article</UButton>
    </div>
    <div class="flex flex-col gap-5 mt-5">
      <UTable :loading="loadingTable" :data="getData.data" :columns="columns" class="flex-1">
        <template #description-cell="{ row }">
          <div class="max-w-[130px] text-ellipsis line-clamp-2 whitespace-nowrap">
            <span v-html="row.original.description.replace(/<img[^>]*>/g, '').slice(0, 50)">
            </span>
          </div>
        </template>
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
    <UModal :title="isEdit ? 'Edit Article' : 'Add Article'" v-model:open="openModal">
      <template #body>
        <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
          <UFormField label="Title" name="title" required>
            <UInput v-model="state.title" class="w-full" />
          </UFormField>

          <UFormField label="Description" name="description" required>
            <Tiptap v-model="state.description" />
          </UFormField>

          <UFormField label="Category" name="category" required>
            <USelect v-model="state.category" :items="getCategory" class="w-full" />
          </UFormField>

          <UFormField label="Gambar" name="cover_image_url" required>
            <UFileUpload v-model="file" :dropzone="false" class="w-96 h-48 flex items-center justify-center">
              <template #file>
                <div v-if="loadingUpload && !state.cover_image_url"
                  class="flex items-center justify-center bg-black/25 h-full ">
                  loading...
                </div>
                <div v-else>
                  <img :src="state.cover_image_url"
                    class="h-48  absolute w-full flex items-center justify-center object-cover" alt="upload" />
                  <UButton variant="solid" color="error" class="absolute bottom-0 w-full flex justify-center" @click="() => {
                    state.cover_image_url = ''
                    file = null
                  }">Delete</UButton>
                </div>
              </template>
            </UFileUpload>
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
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useMyFetch } from '../../composable/useApi';
import { useRoute } from 'vue-router';
import { debounce } from 'radash';
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { useGetMe } from '../../store/getme';

interface Article {
  data: Items[]
  meta: Meta;
}

interface Items {
  id: number;
  documentId: string;
  title: string;
  description: string;
  cover_image_url: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
  user: UserClass;
  locale: null;
  category: Category | null;
}

interface Meta {
  pagination: Pagination;
}

interface Pagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

interface UserClass {
  id: number;
  documentId: string;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
  locale: null;
}

interface Category {
  id: number;
  documentId: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
  locale: null;
}


const schema = z.object({
  title: z.string().min(3, 'Must be at least 3 characters'),
  description: z.string().min(8, 'Must be at least 8 characters'),
  cover_image_url: z.string().min(3, 'Image required'),
  category: z.number().min(1, 'Category required').nullable()
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  category: null,
  cover_image_url: '',
  description: '',
  title: ''
})
const fileFormData = ref<FormData | null>()
const openModalDelete = ref(false)

const toast = useToast()

const route = useRoute()
const apiUrl = ref('/api/articles?pagination[page]=1&pagination[pageSize]=10&populate[user]=*&populate[category]=*&sort[0]=createdAt:desc')
const payload = ref<{ data: Schema }>({
  data: {
    category: null,
    cover_image_url: '',
    description: '',
    title: ''
  }
})
const params = ref({ page: 1, pageSize: 10, title: '' })
const openModal = ref(false)
const file = ref<File | null>(null)
const isEdit = ref('')
const loadingTable = ref(false)
const selected = ref<Items>()
const getMe = useGetMe()

const debounceChange = debounce({ delay: 500 }, async (query: string) => {
  const url = new URLSearchParams(route.query as Record<string, string>)
  url.set('pagination[page]', String(params.value.page))
  url.set('pagination[pageSize]', String(params.value.pageSize))
  if (getMe.getMe?.documentId) {
    url.set('filters[user][documentId][$eqi]', String(getMe.getMe?.documentId))
  }
  if (query) {
    url.set('filters[title][$eqi]', String(query))
  }
  url.set('sort[0]', 'createdAt:desc')
  apiUrl.value = `/api/articles?${url.toString()}`
  await execute()
})

const columns: TableColumn<Items>[] = [
  {
    accessorKey: 'documentId',
    header: 'ID'
  },
  {
    accessorKey: 'title',
    header: 'Title'
  },
  {
    accessorKey: 'description',
    header: 'Content',
  },
  {
    accessorKey: 'actions',
    header: ''
  }
]

const { data, isFetching, execute } = useMyFetch<string>(apiUrl, {
  refetch: true,
  immediate: false
})

watch(isFetching, (newValue) => {
  loadingTable.value = newValue
})

const getData = computed(() => {
  return data.value ? JSON.parse(data.value) as Article : { data: [], meta: { pagination: { page: 0, pageSize: 0, pageCount: 0, total: 0 } } } as Article
})
onMounted(() => {
  apiUrl.value = `/api/articles?pagination[page]=1&pagination[pageSize]=10&populate[user]=*&populate[category]=*&sort[0]=createdAt:desc&filters[user][documentId][$eqi]=${getMe.getMe?.documentId}`
})

watch(params, (newValue) => {
  const url = new URLSearchParams(route.query as Record<string, string>)
  url.set('pagination[page]', String(newValue.page))
  url.set('pagination[pageSize]', String(newValue.pageSize))
  if (getMe.getMe?.documentId) {
    url.set('filters[user][documentId][$eqi]', String(getMe.getMe?.documentId))
  }
  if (newValue.title) {
    debounceChange(newValue.title)
    return
  }
  url.set('sort[0]', 'createdAt:desc')

  apiUrl.value = `/api/articles?${url.toString()}`
  execute()
}, {
  deep: true
})


const { data: category } = useMyFetch<string>('/api/categories')

const getCategory = computed(() => {
  return category.value ? JSON.parse(category.value).data.map((item: Category) => ({ label: item.name, value: item.id })) : []
})

const { formData, execute: upload, response, isFetching: isUploading } = useMyFetch('/api/upload', {
  immediate: false,

}).post(fileFormData)

const { execute: executeCreate, error: errorCreate } = useMyFetch('/api/articles', {
  immediate: false,

}).post(payload)

function handleDelete(item: Items) {
  selected.value = item
  openModalDelete.value = true
}

async function onDelete() {
  const { execute: executeDelete, error: errorDelete } = useMyFetch('/api/articles/' + selected.value?.documentId, {
    immediate: false,
  }).delete()
  await executeDelete()
  if (!errorDelete.value) {
    toast.add({ title: 'Success', description: 'Article has been deleted.', color: 'success' })
    execute()
    openModalDelete.value = false
    return
  }
  toast.add({ title: 'Error', description: errorDelete.value, color: 'error' })
}

function handleEdit(item: Items) {
  isEdit.value = item.documentId
  openModal.value = true
  state.title = item.title
  state.description = item.description
  state.cover_image_url = item.cover_image_url

  if (item.cover_image_url) {
    fetch(item.cover_image_url).then(response => response.blob()).then(blob => {
      file.value = new File([blob], item.cover_image_url.split('/').pop() ?? '')
    })
  }
  state.category = item.category?.id ?? null
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  payload.value.data = { ...event.data, category: event.data.category || null }
  if (isEdit.value) {
    const { execute: executeEdit, error: errorEdit } = useMyFetch('/api/articles/' + isEdit.value, {
      immediate: false,

    }).put(payload)
    await executeEdit()
    if (!errorEdit.value) {
      toast.add({ title: 'Success', description: 'The form has been edited.', color: 'success' })
      openModal.value = false
      execute()
      state.title = ''
      state.description = ''
      state.cover_image_url = ''
      state.category = null
      isEdit.value = ''
    }
  } else {
    await executeCreate()
    if (!errorCreate.value) {
      toast.add({ title: 'Success', description: 'The form has been submitted.', color: 'success' })
      openModal.value = false
      execute()
      state.title = ''
      state.description = ''
      state.cover_image_url = ''
      state.category = null
    }
  }
}

const loadingUpload = ref(false)

watch(isUploading, (newValue) => {
  loadingUpload.value = newValue
})

watch(file, async (newValue: File | null) => {
  if (newValue && !state.cover_image_url) {
    const form = new FormData()
    form.append('files', newValue)
    fileFormData.value = form
    formData()
    await upload()
    if (response.value?.ok) {
      const result = await response.value.json()
      state.cover_image_url = result[0].url
    }
  }
})

</script>