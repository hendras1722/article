<template>
  <UPopover>
    <UButton color="neutral" variant="subtle" icon="i-lucide-calendar">
      <template v-if="modelValue.start">
        <template v-if="modelValue.end">
          {{ df.format(modelValue.start.toDate(getLocalTimeZone())) }} - {{
            df.format(modelValue.end.toDate(getLocalTimeZone())) }}
        </template>

        <template v-else>
          {{ df.format(modelValue.start.toDate(getLocalTimeZone())) }}
        </template>
      </template>
      <template v-else>
        Pick a date
      </template>
    </UButton>

    <template #content>
      <UCalendar v-model="modelValue" class="p-2" :number-of-months="2" range :min-value="minDate" />
    </template>
  </UPopover>
</template>

<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'

const minDate = new CalendarDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())

const modelValue = defineModel({
  default: {
    start: new CalendarDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
    end: undefined
  }
})

const df = new DateFormatter('id-ID', {
  dateStyle: 'medium'
})


</script>