<template>
  <div class="flex flex-col w-full min-h-screen lg:px-[400px] md:px-[100px] px-[50px] py-[50px]">
    <div class="flex justify-between items-center mb-5">
      <RouterLink to="/" class="underline text-sm">Kembali</RouterLink>

      <div class="flex gap-3 items-center">
        <div class="w-8 h-8 flex justify-center items-center font-bold p-1 text-white rounded-full uppercase"
          :style="{ backgroundColor: colorFromName((getData.data || {})?.user.username.slice(0, 1)) }">
          {{ (getData.data || {})?.user.username.slice(0, 1) }}
        </div>
        <div class="capitalize">{{ (getData.data || {})?.user.username }}</div>
      </div>
    </div>
    <div>
      <img :src="(getData.data || {})?.cover_image_url" class="w-full h-[500px] my-3 rounded-2xl object-cover"
        alt="logo" />
      <small class="font-bold text-primary">{{ (getData.data || {})?.category?.name }}</small>
      <h1 class="text-2xl font-bold line-clamp-2 mt-2">{{ (getData.data || {})?.title }}</h1>
      <p class="mt-2" v-html="(getData.data || {})?.description"></p>
    </div>
    <UButton variant="link" class="w-fit mt-5" size="xs" v-if="isSupported" @click="() => {
      share({
        title: 'Article ' + getData.data?.title,
        text: getData.data?.description,
        url: route.fullPath
      })
    }">
      <ExternalLink /> Share this article
    </UButton>
    <div class="border-2 border-slate-300 rounded-full my-5"></div>
    <div>Maybe you like this</div>
    <div class="grid md:grid-cols-3 grid-cols-1 grid-rows-1 gap-5">
      <template v-for="(item) in getDataList.data" :key="item.documentId">

        <RouterLink to="">
          <div class="w-full rounded-xl">
            <img :src="item.cover_image_url" alt="logo" class="w-full h-[200px] object-cover rounded-xl my-3"
              loading="lazy" />
            <small class="font-bold text-primary">{{ item.category?.name }}</small>
            <h3 class="text-lg font-bold line-clamp-2">{{ item.title }}</h3>
            <p class="line-clamp-2 mt-2" v-html="item.description"></p>
            <div class="flex gap-10 justify-between mt-3 items-center">
              <div class="flex gap-3 items-center">
                <div class="w-8 h-8 flex justify-center items-center font-bold p-1 text-white rounded-full uppercase"
                  :style="{ backgroundColor: colorFromName((getData.data || {})?.user.username.slice(0, 1)) }">
                  {{ item.user.username.slice(0, 1) }}
                </div>
                <div>{{ item.user.username }}</div>
              </div>
            </div>
          </div>
        </RouterLink>
      </template>
    </div>

    <div class="border-2 border-slate-300 rounded-full my-5"></div>
    <div class="text-2xl font-bold">Comments</div>
    <UTextarea placeholder="Write your comment" class="mt-3" :rows="4" v-model="payload.data.content" />
    <UButton icon="i-lucide-send-horizontal" class="flex justify-center mt-5"
      :disabled="!payload.data.content || loading" @click="handleSubmit" :loading="loading || loadingGet">
      Send
    </UButton>
    <div class="mt-3">
      <div v-for="(item, index) in getListComment" :key="index" class="flex justify-between items-end gap-2">
        <div class="relative w-full">
          <small class="text-[8px] text-slate-600">{{ item.user.username }} Say:</small>
          <div v-if="isEdit !== item.id"
            class="border-3 border-slate-200 rounded-lg p-3 whitespace-pre-line w-full italic">
            ❝ {{ item.content }} ❞
          </div>
          <div v-else class="border-3 border-slate-200 rounded-lg p-3 flex justify-between gap-5 items-center">
            <UInput variant="none" class="w-full" v-model="payloadEdit.data.content" :disabled="loadingEdit" />
            <UButton class="rounded-full h-[30px] w-[30px]" @click="handleEdit" :disabled="loadingEdit || loadingGet"
              :loading="loadingEdit">
              <SendHorizontal />
            </UButton>
          </div>
          <div class="m-1" v-if="isEdit !== item.id">
            <UButton variant="link" @click="() => {
              isEdit = item.id
              payloadEdit.data.content = item.content
            }" color="info" size="xs"><small class="text-[10px]">Edit</small>
            </UButton>
            <UPopover v-model:open="open[item.documentId]">
              <UButton variant="link" color="error" size="xs"><small class="text-[10px]">Delete</small></UButton>

              <template #content>
                <div class="bg-white p-3 flex gap-3 flex-row">
                  <UButton variant="link" color="neutral" @click="() => {
                    open[item.documentId] = false
                  }">Cancel</UButton>
                  <UButton color="error" @click="() => {
                    fetchDelete()
                  }" :loading="loadingDelete || loadingGet">Delete</UButton>

                </div>
              </template>
            </UPopover>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { RouterLink, useRoute } from 'vue-router';
import { colorFromName } from '../utils/ColorFromName';
import { useMyFetch } from '../composable/useApi';
import { computed, onMounted, ref, watch } from 'vue';
import { ExternalLink, SendHorizontal } from 'lucide-vue-next';
import { useShare } from '@vueuse/core';
import { BaseResponse } from '../type/BaseResponse';
import { Article } from '../type/Article';
import { Comments } from '../type/Comments';

const route = useRoute()
const isEdit = ref<number | null>(null)
const open = ref<{ [key: string]: boolean }>({})

const loading = ref(false)
const loadingEdit = ref(false)
const loadingDelete = ref(false)
const loadingGet = ref(false)
const { share, isSupported } = useShare()

const payload = ref<{ data: { content: string; article: number | null } }>({
  data: {
    content: "",
    article: null
  }
})

const payloadEdit = ref<{ data: { content: string; article: number | null } }>({
  data: {
    content: "",
    article: null
  }
})

const { data, error, isFetching } = useMyFetch<string>(`/api/articles/${route.params.id}` + '?populate[category]=*&populate[user]=*', {
  immediate: !!(route.params.id)
})

const apiUrl = ref(`/api/articles`)
const apiUrlComments = ref('')

const getData = computed(() => data.value ? JSON.parse(data.value) as BaseResponse<Article> : {} as BaseResponse<Article>)

const { data: ListData, execute } = useMyFetch<string>(apiUrl, {
  immediate: false
})

const { data: ListComment, execute: executeComment, isFetching: isFetchingComment } = useMyFetch<string>('/api/comments?populate[article]=*&sort[0]=createdAt:desc&populate[user]=*')

const getListComment = computed(() => {
  if (!ListComment.value) return []
  if (JSON.parse(ListComment.value).data.length === 0) return []
  const getDocumentId = (JSON.parse(ListComment.value) as BaseResponse<Comments[]>).data.filter((item) => {
    return item.article && (String(item.article.documentId) === route.params.id)
  })?.[0].documentId
  apiUrlComments.value = `/api/comments/${getDocumentId}`
  return (JSON.parse(ListComment.value) as BaseResponse<Comments[]>).data.filter((item) => {
    return item.article && (String(item.article.documentId) === route.params.id)
  })
})

watch(isFetching, (newValue, oldValue) => {
  if (!newValue && !error.value && oldValue) {
    apiUrl.value = `/api/articles` + `?pagination[page]=1&pagination[pageSize]=3&populate[user]=*&populate[category]=*&filters[category][name][$eqi]=${getData.value.data ? getData.value.data?.category?.name : undefined}&sort[0]=createdAt:desc`
    payloadEdit.value.data.article = getData.value.data ? getData.value.data.id : null
    execute()
  }
})

const getDataList = computed(() => {
  return ListData.value ? JSON.parse(ListData.value) as BaseResponse<Article[]> : {} as BaseResponse<Article[]>
})

const { execute: fetchEdit, statusCode: statusCodeEdit, isFetching: isFetchingEdit, error: errorEdit } = useMyFetch(apiUrlComments, {
  immediate: false
}).put(payloadEdit)

const { execute: fetchPost, statusCode, isFetching: isFetchingPost, error: errorPost } = useMyFetch(`/api/comments`, {
  immediate: false
}).post(payload)

const { execute: fetchDelete, isFetching: isFetchingDelete, statusCode: statusCodeDelete, error: errorDelete } = useMyFetch(apiUrlComments, {
  immediate: false
}).delete()

function handleEdit() {
  fetchEdit()
}

const toast = useToast()

watch([isFetchingPost, isFetchingEdit], async (newValue) => {
  loading.value = newValue[0]
  loadingEdit.value = newValue[1]

  if (!newValue[0] && (statusCode.value && (statusCode.value >= 200) && (statusCode.value < 300))) {
    await executeComment()
    payload.value.data.content = ''
    toast.add({
      title: 'Sukses',
      description: 'Komentar berhasil ditambahkan',
      color: 'success',
    })
    toast.remove(0)
    return
  }

  if (!newValue[1] && (statusCodeEdit.value && (Number(statusCodeEdit.value) >= 200) && (Number(statusCodeEdit.value) < 300))) {
    isEdit.value = null
    alert('wewe')
    await executeComment()
    payloadEdit.value.data.content = ''
    toast.add({
      title: 'Sukses',
      description: 'Komentar berhasil diedit',
      color: 'success',
    })
    toast.remove(0)
    return
  }

  if (errorPost.value || errorEdit.value) {
    toast.add({
      title: 'Gagal',
      description: 'Komentar gagal dipost',
      color: 'error',
    })
  }

}, {
  deep: true
})

watch(isFetchingDelete, async (newValue) => {
  loadingDelete.value = newValue
  if (!newValue && (statusCodeDelete.value && (statusCodeDelete.value >= 200) && (statusCodeDelete.value < 300))) {
    await executeComment()
    toast.add({
      title: 'Sukses',
      description: 'Komentar berhasil dihapus',
      color: 'success',
    })
    toast.remove(0)
  }

  if (errorDelete.value) {
    toast.add({
      title: 'Gagal',
      description: 'Komentar gagal dihapus',
      color: 'error',
    })
  }
}, {
  deep: true
})

watch(isFetchingComment, async (newValue) => {
  loadingGet.value = newValue
}, {
  deep: true
})

async function handleSubmit() {
  const id = getData.value.data.id
  payload.value.data.article = id
  await fetchPost()

}

onMounted(() => {
  const getRead = JSON.parse(localStorage.getItem('read') || '[]')
  if (getRead.length > 0) {
    localStorage.setItem('read', JSON.stringify([...getRead, { documentId: route.params.id, created_at: Date.now() }]))
  } else {
    localStorage.setItem('read', JSON.stringify([{ documentId: route.params.id, created_at: Date.now() }]))
  }
})
</script>