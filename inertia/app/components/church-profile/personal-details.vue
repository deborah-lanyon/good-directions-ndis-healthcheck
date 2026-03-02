<template>
  <Card>
    <CardHeader>
      <div class="flex justify-between items-center w-full">
        <div>
          <CardTitle class="text-2xl">Operations Manager</CardTitle>
        </div>
        <button
          :class="[
            'cursor-pointer px-12 py-2 rounded-full text-sm leading-5 font-medium',
            isEditing ? 'bg-tertiary text-white' : 'text-primary',
          ]"
          type="button"
          @click="toggleEditing"
        >
          {{ isEditing ? 'Save' : 'Update' }}
        </button>
      </div>
    </CardHeader>
    <CardContent>
      <div class="mt-4">
        <div class="grid grid-cols-[3fr_7fr] gap-1 py-3 border-b border-[#fcfbf8]">
          <label for="full-name" class="text-sm leading-5 font-medium text-gray-500"
            >Full Name</label
          >
          <input
            type="text"
            name="full-name"
            id="full-name"
            v-model="user.fullName"
            :class="[
              'text-gray-900 focus:ring-0 focus:outline-none text-sm leading-5 font-normal',
              isEditing ? 'border-gray-200 border p-2 rounded-lg' : '',
            ]"
            placeholder="John Doe"
            :disabled="!isEditing"
          />
        </div>
        <div class="grid grid-cols-[3fr_7fr] gap-1 py-3 border-b border-[#fcfbf8]">
          <label for="email" class="text-sm leading-5 font-medium text-gray-500">Email</label>
          <input
            type="text"
            name="email"
            id="email"
            v-model="user.email"
            :class="[
              'text-gray-900 focus:ring-0 focus:outline-none text-sm leading-5 font-normal',
              isEditing ? 'border-gray-200 border p-2 rounded-lg' : '',
            ]"
            placeholder="john.doe@example.com"
            :disabled="!isEditing"
          />
        </div>
        <div class="grid grid-cols-[3fr_7fr] gap-1 py-3 border-b border-[#fcfbf8]">
          <label for="phone" class="text-sm leading-5 font-medium text-gray-500"
            >Phone Number</label
          >
          <input
            type="tel"
            name="phone"
            id="phone"
            v-model="user.phone"
            :class="[
              'text-gray-900 focus:ring-0 focus:outline-none text-sm leading-5 font-normal',
              isEditing ? 'border-gray-200 border p-2 rounded-lg' : '',
            ]"
            placeholder="+61 123 456 789"
            :disabled="!isEditing"
          />
        </div>
      </div>
    </CardContent>
  </Card>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import type { User } from '~/app/types'
import { router } from '@inertiajs/vue3'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/app/components/ui/card'

const props = defineProps<{
  user: User
}>()

const isEditing = ref(false)

const save = async () => {
  router.put(
    '/users',
    { fullName: props.user.fullName, email: props.user.email, phone: props.user.phone },
    {
      preserveScroll: true,
      onSuccess: () => {
        isEditing.value = false
      },
      onError: () => {
        console.error('Failed to save user')
      },
      onFinish: () => {
        console.log('User saved')
      },
    }
  )
}

const toggleEditing = () => {
  if (isEditing.value) {
    // If currently editing, save before toggling
    save()
  } else {
    // If not editing, just toggle to editing mode
    isEditing.value = true
  }
}
</script>
