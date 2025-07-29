<template>
  <div class="flex flex-col w-full min-h-screen">
    <nav class="border-b border-slate-300 px-[100px] py-5 ">
      <div class="md:text-5xl text-xl font-bold text-shadow-2xs flex items-center justify-between">
        <div>Article</div>
        <div>
          <div v-if="getMe.getMe?.id" class="flex items-center gap-5">
            <UButton @click="router.push('/admin/article')" variant="outline">Bikin Artikel</UButton>
            <UButton variant="link" @click="async () => {
              await cookies.remove('token', {
                path: '/'
              })
              getMe.removeGetMe()
              router.push('/login')
            }">
              <LogOut class="text-primary" />

            </UButton>
          </div>
          <UButton v-else variant="outline" @click="router.push('/login')">Login</UButton>

        </div>
      </div>
    </nav>
    <main class="flex-1 md:px-[100px] px-[50px] py-6">
      <section id="Jumbotron" class="flex flex-col gap-5">
        <div class="text-primary bg-violet-100 font-bold w-fit px-5 py-2 text-center rounded-full">Article Blog</div>
        <h1 class="font-bold text-5xl">Cari Artikel yang kamu butuhkan</h1>
        <p class="text-sm">Kamu juga bisa bikin blog kamu sendiri</p>
        <RouterLink
          :to="'/article' + `/${getData.data?.filter(item => item.cover_image_url) && getData.data?.filter(item => item.cover_image_url)?.[0]?.documentId}`">
          <div class="relative" v-if="getData.data?.filter(item => item.cover_image_url).length > 0">
            <img @error="(e) => {
              if (e.currentTarget) {
                (e.currentTarget as HTMLImageElement).src = 'https://demofree.sirv.com/nope-not-here.jpg'
              }
            }"
              :src="getData.data?.filter(item => item.cover_image_url) && getData.data?.filter(item => item.cover_image_url)?.[0].cover_image_url || ''"
              class="w-full h-[500px] rounded-2xl object-cover" alt="jumbotron" />
            <div class="h-full w-full opacity-30 brightness-100 bg-green-700 absolute top-0 rounded-2xl"></div>
            <div class="absolute h-[150px] p-5 bottom-0 w-full 
              bg-black/30 backdrop-blur-md 
              rounded-bl-2xl rounded-br-2xl text-white">
              <div class="flex justify-between">
                <div class="text-2xl font-bold">{{getData.data?.filter(item => item.cover_image_url) &&
                  getData.data?.filter(item => item.cover_image_url)?.[0].title}}</div>
                <ArrowUpRight class="w-8 h-8" />
              </div>
              <p class="mt-2 text-sm font-normal line-clamp-1" v-html="getData.data?.filter(item => item.cover_image_url) &&
                getData.data?.filter(item => item.cover_image_url)?.[0].description"></p>
              <div class="md:mt-4  mt-0 flex justify-between md:gap-10 gap-3 md:flex-row flex-col">
                <div class="flex md:gap-10 gap-3 items-center">
                  <div class="flex gap-3 items-center">
                    <div
                      class="md:w-8 md:h-8 h-6 w-6 flex justify-center items-center font-bold p-1 rounded-full uppercase"
                      :style="{
                        backgroundColor: colorFromName(getData.data?.filter(item => item.cover_image_url) && getData.data?.filter(item =>
                          item.cover_image_url)?.[0].user.username.slice(0, 1))
                      }">
                      {{getData.data?.filter(item => item.cover_image_url) && getData.data?.filter(item =>
                        item.cover_image_url)?.[0].user.username.slice(0, 1)}}
                    </div>
                    <div class="capitalize md:text-sm text-nowrap"> {{getData.data?.filter(item => item.cover_image_url)
                      &&
                      getData.data?.filter(item =>
                        item.cover_image_url)?.[0].user.username}}</div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div
                      class="md:w-8 md:h-8 h-6 w-8 flex justify-center items-center rounded-full border-2 border-white bg-transparent">
                      <Calendar class="md:w-4 md:h-4 h-3 w-3" />
                    </div>
                    <span class="font-semibold md:text-sm text-xs"> {{getData.data?.filter(item => item.cover_image_url)
                      &&
                      format(new Date(getData.data?.filter(item =>
                        item.cover_image_url)?.[0].createdAt), 'MMM dd, yyyy')}}</span>
                  </div>
                </div>
                <div v-if="getData.data?.filter(item => item.cover_image_url) && getData.data?.filter(item =>
                  item.cover_image_url)?.[0].category?.name"
                  class="border-2 border-white text-xs md:text-sm text-nowrap w-fit text-white h-fit rounded-full px-2 py-1 flex items-center font-semibold">
                  {{getData.data?.filter(item => item.cover_image_url) && getData.data?.filter(item =>
                    item.cover_image_url)?.[0].category?.name}}
                </div>
              </div>
            </div>

          </div>

        </RouterLink>
      </section>
      <section id="content" class="mt-10">
        <div class="flex justify-between">
          <UInput class="w-50" placeholder="Search" v-model="paramsFilter.search">
            <template #leading>
              <Search class="w-4 h-4 text-slate-400" />
            </template>
          </UInput>
          <USelectMenu v-model="paramsFilter.category" :items="getCategory.data" class="w-48" />
        </div>
        <div class="border-2 rounded-full my-5 border-slate-300 h-1"></div>
        <div class="flex flex-col ">
          <div
            :class="['grid grid-rows-1 gap-5', getData.data.length > 0 ? 'md:grid-cols-3 grid-cols-1' : 'grid-cols-1']">
            <div v-for="item in 6" :key="item" v-if="isFetching">
              <USkeleton class="h-[200px] w-full" />
              <USkeleton class="h-[10px] w-[50px] mt-3" />
              <USkeleton class="h-[10px] w-full mt-3" />
              <USkeleton class="h-[30px] w-full mt-3" />
              <div class="flex gap-10 justify-between mt-3 items-center">
                <div class="flex gap-3 items-center">
                  <USkeleton class="h-8 w-8 rounded-full mt-3" />
                  <USkeleton class="h-[10px] w-[50px] mt-3" />
                </div>
                <div class="flex items-center gap-3">
                  <USkeleton class="h-[10px] w-[50px] mt-3" />
                </div>
              </div>
            </div>
            <template v-else v-for="(item) in getData.data" :key="index+'article'">
              <router-link :to="'/article/' + item.documentId">
                <div class="w-full p-5 rounded-xl">
                  <img :src="item.cover_image_url" alt="img_article" @error="(e) => {
                    if (e.currentTarget) {
                      (e.currentTarget as HTMLImageElement).src = 'https://demofree.sirv.com/nope-not-here.jpg'
                    }
                  }" class=" w-full h-[200px] object-cover rounded-xl my-3" loading="lazy" />
                  <small class="font-bold text-primary">{{ item.category?.name }}</small>
                  <h3 class="text-lg font-bold line-clamp-2">{{ item.title }}</h3>
                  <p class="line-clamp-2 mt-2" v-html="item.description"></p>
                  <div class="flex gap-10 justify-between mt-3 items-center">
                    <div class="flex gap-3 items-center ">
                      <div
                        class="w-8 h-8 flex justify-center items-center font-bold p-1 rounded-full uppercase text-white"
                        :style="{
                          backgroundColor: colorFromName(getData.data?.filter(item => item.cover_image_url) && getData.data?.filter(item =>
                            item.cover_image_url)?.[0].user.username.slice(0, 1))
                        }">
                        {{getData.data?.filter(item => item.cover_image_url) && getData.data?.filter(item =>
                          item.cover_image_url)?.[0].user.username.slice(0, 1)}}
                      </div>
                      <div class="capitalize"> {{getData.data?.filter(item => item.cover_image_url) &&
                        getData.data?.filter(item =>
                          item.cover_image_url)?.[0].user.username}}</div>
                    </div>
                    <div class="flex items-center gap-3"
                      v-if="readMe.filter(read => read.documentId === item.documentId).length > 0">
                      read {{formatDistanceToNowStrict(new Date(Number(readMe.filter(read => read.documentId ===
                        item.documentId)?.[0]?.created_at)))}}


                    </div>
                  </div>
                </div>
              </router-link>

            </template>
            <template v-if="getData.data.length === 0">
              <div>
                <h2 class="text-2xl font-bold text-center ">❝Article Not Found❞</h2>
              </div>
            </template>
          </div>
          <div class="grid place-items-center mt-5" v-if="getData.data.length > 0">
            <UPagination v-model:page="paramsFilter.page" :total="getData.meta.pagination.total" :sibling-count="1"
              show-edges />

          </div>
        </div>
      </section>

    </main>
    <footer class="w-full grid place-items-center p-2">
      <di class="text-center">Copyright @ 2025</di>
    </footer>
  </div>

</template>

<script lang="ts" setup>
import { ArrowUpRight, Calendar, LogOut, Search } from 'lucide-vue-next';
import { colorFromName } from '../utils/ColorFromName';
import { SelectMenuItem } from '@nuxt/ui';
import { computed, onMounted, ref, watch } from 'vue';

import { useMyFetch } from '../composable/useApi';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { debounce } from 'radash';
import { useGetMe } from '../store/getme';
import { BaseResponse, Pagination } from '../type/BaseResponse';
import { Category } from '../type/Category';
import { Article } from '../type/Article';
import { useCookies } from '@vueuse/integrations/useCookies'

const route = useRoute()
const router = useRouter()
const cookies = useCookies()

const paramsFilter = ref({
  page: 1,
  pageSize: 6,
  search: '',
  category: {
    label: '',
    value: ''
  }
})
const apiUrl = ref('/api/articles?pagination[page]=1&pagination[pageSize]=5&populate[user]=*&populate[category]=*&sort[0]=createdAt:desc')
const getMe = useGetMe()
const readMe = ref<{ documentId: string, created_at: string }[]>([])

const debounceChange = debounce({ delay: 500 }, async (query: string) => {
  const url = new URLSearchParams(route.query as Record<string, string>)
  url.set('populate[category]', '*')
  url.set('populate[user]', '*')
  url.set('sort[0]', 'createdAt:desc')
  url.set('pagination[pageSize]', '6')
  url.set('pagination[page]', '1')
  if (query) {
    url.set('filters[title][$eqi]', query)
    router.push({
      query: {
        ...route.query,
        'pagination[page]': 1,
        'filters[title][$eqi]': query
      }
    })
  } else {
    url.delete('filters[title][$eqi]')
    router.push({
      query: {
        'pagination[page]': 1,
        'pagination[pageSize]': 6,
        'populate[user]': '*',
        'populate[category]': '*',
        'sort[0]': 'createdAt:desc'
      }
    })
  }
})

const { data, isFetching } = useMyFetch<string>(apiUrl, {
  refetch: true,
  immediate: !route.query['pagination[page]']
})

const { data: category } = useMyFetch<string>('/api/categories')

const getCategory = computed(() => {
  const itemCategory = category.value ? (JSON.parse(category.value) as BaseResponse<Category[]>) : { data: [], meta: { pagination: {} as Pagination } } as BaseResponse<Category[]>
  return {
    ...itemCategory,
    data: [{
      label: 'Semua',
      value: ''
    }, ...itemCategory.data.map((item: Category) => {
      return {
        label: item.name,
        value: String(item.name)
      }
    })] satisfies SelectMenuItem[]
  }
})

const getData = computed(() => data.value ? (JSON.parse(data.value) as BaseResponse<Article[]>) : { data: [], meta: { pagination: {} as Pagination } } as BaseResponse<Article[]>)

watch(paramsFilter,
  (newValue) => {
    const url = new URLSearchParams(route.query as Record<string, string>)

    url.set('pagination[pageSize]', String(newValue.pageSize))
    url.set('populate[category]', '*')
    url.set('populate[user]', '*')
    url.set('sort[0]', 'createdAt:desc')
    if (newValue.search) {
      debounceChange(newValue.search)
      return
    }

    if (newValue.category.value) {
      url.set('filters[category][name][$eqi]', newValue.category.value)
    } else {
      url.delete('filters[category][name][$eqi]')
    }
    apiUrl.value = '/api/articles' + `?${url}`
    router.push({
      query: {
        'pagination[page]': String(newValue.page),
        'pagination[pageSize]': String(newValue.pageSize),
        'populate[category]': '*',
        'populate[user]': '*',
        'sort[0]': 'createdAt:desc'
      }
    })
  }, {
  deep: true
});

watch(() => route.query, (newValue) => {
  paramsFilter.value = {
    ...paramsFilter.value,
    page: Number(newValue['pagination[page]']) || 1,
    pageSize: Number(newValue['pagination[pageSize]']) || 6
  }
  apiUrl.value = '/api/articles' + `?${new URLSearchParams(route.query as Record<string, string>)}`
}, {
  immediate: true
})

onMounted(() => {
  const getRead = localStorage.getItem('read')
  if (getRead) {
    readMe.value = JSON.parse(getRead)
  }
})
</script>
