<template>
  <Card>
    <CardHeader>
      <div class="flex justify-between items-center w-full">
        <div>
          <CardTitle class="text-2xl">Visitor Notifications</CardTitle>
          <CardDescription>Receive per-property notifications like a visitor</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div class="flex items-center justify-between py-3">
        <div class="space-y-1">
          <p class="text-sm font-medium text-gray-900">I also visit properties</p>
          <p class="text-sm text-gray-500">
            Enable this to receive individual property notifications based on your assigned street
            groups, just like a visitor.
          </p>
        </div>
        <button
          type="button"
          :class="[
            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2',
            enabled ? 'bg-teal-600' : 'bg-gray-200',
            submitting ? 'opacity-50 cursor-not-allowed' : '',
          ]"
          role="switch"
          :aria-checked="enabled"
          :disabled="submitting"
          @click="toggle"
        >
          <span
            :class="[
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              enabled ? 'translate-x-5' : 'translate-x-0',
            ]"
          />
        </button>
      </div>
      <div v-if="enabled" class="mt-3 p-3 bg-teal-50 rounded-lg border border-teal-100">
        <p class="text-sm text-teal-800">
          Your visitor record is active. Go to
          <a href="/team-management" class="font-medium underline hover:text-teal-900"
            >Team Management</a
          >
          to assign yourself to street groups.
        </p>
      </div>
    </CardContent>
  </Card>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { router } from '@inertiajs/vue3'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/app/components/ui/card'

const props = defineProps<{
  adminVisitorEnabled: boolean
}>()

const enabled = ref(props.adminVisitorEnabled)
const submitting = ref(false)

const toggle = () => {
  if (submitting.value) return
  submitting.value = true
  const newState = !enabled.value

  router.post(
    '/api/visitors/toggle-admin-visitor',
    { enabled: newState },
    {
      preserveScroll: true,
      onSuccess: () => {
        enabled.value = newState
      },
      onFinish: () => {
        submitting.value = false
      },
    }
  )
}
</script>
