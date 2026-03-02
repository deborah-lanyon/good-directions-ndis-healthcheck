<template>
  <SidebarLayout page-title="Respondents">
    <!-- No territory selected -->
    <div v-if="!churchId" class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
      <p class="font-karla text-yellow-800">Please select a territory first to view respondents.</p>
    </div>

    <template v-else>
      <!-- Summary -->
      <div class="flex items-center justify-between mb-6">
        <div class="font-karla text-sm text-gray-600">
          {{ respondentList.length }} respondent(s)
        </div>
        <div class="flex items-center gap-2">
          <select
            v-model="statusFilter"
            class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg font-karla"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="healthcheck_scheduled">Scheduled</option>
            <option value="healthcheck_completed">Completed</option>
          </select>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredRespondents.length === 0" class="bg-white rounded-lg p-8 border border-gray-200 text-center">
        <p class="font-karla text-gray-500">
          {{ statusFilter === 'all' ? 'No respondents yet. They will appear here when someone registers via a tracking link.' : 'No respondents with this status.' }}
        </p>
      </div>

      <!-- Respondent Cards -->
      <div class="space-y-3">
        <div
          v-for="respondent in filteredRespondents"
          :key="respondent.id"
          class="bg-white rounded-lg border border-gray-200 p-4 md:p-5 hover:shadow-md transition-shadow"
        >
          <div class="flex flex-col md:flex-row md:items-start gap-4">
            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-1">
                <h3 class="font-caprasimo text-lg text-primary truncate">{{ respondent.name }}</h3>
                <span :class="statusBadgeClass(respondent.status)" class="px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap">
                  {{ formatStatus(respondent.status) }}
                </span>
              </div>
              <div class="font-karla text-sm text-gray-600 space-y-0.5">
                <p>{{ respondent.email }}</p>
                <p v-if="respondent.phone">{{ respondent.phone }}</p>
                <p v-if="respondent.propertyAddress" class="text-gray-400">
                  Property: {{ respondent.propertyAddress }}
                </p>
                <p v-if="respondent.trackingCode" class="text-gray-400">
                  Code: {{ respondent.trackingCode }}
                </p>
                <p class="text-xs text-gray-400">
                  Registered {{ formatDate(respondent.createdAt) }}
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col gap-2 md:w-48 flex-shrink-0">
              <select
                :value="respondent.status"
                @change="updateStatus(respondent.id, ($event.target as HTMLSelectElement).value)"
                class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg font-karla"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="healthcheck_scheduled">Scheduled</option>
                <option value="healthcheck_completed">Completed</option>
              </select>
              <button
                @click="openNotesDialog(respondent)"
                class="w-full px-2 py-1.5 text-xs bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-md font-karla transition-colors text-left"
              >
                {{ respondent.notes ? 'Edit Notes' : 'Add Notes' }}
              </button>
            </div>
          </div>

          <!-- Notes preview -->
          <div v-if="respondent.notes" class="mt-3 pt-3 border-t border-gray-100">
            <p class="font-karla text-xs text-gray-500 italic">{{ respondent.notes }}</p>
          </div>
        </div>
      </div>
    </template>

    <!-- Notes Dialog -->
    <div v-if="showNotesDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg max-w-md w-full mx-4 p-6">
        <h3 class="font-caprasimo text-xl text-primary mb-4">
          Notes for {{ editingRespondent?.name }}
        </h3>
        <textarea
          v-model="editNotes"
          rows="4"
          placeholder="Add notes about this respondent..."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg font-karla text-sm resize-none"
        ></textarea>
        <div class="flex gap-3 mt-4">
          <button
            @click="saveNotes"
            class="flex-1 px-4 py-2 bg-tertiary text-white font-medium rounded-lg hover:bg-[#e59a00] transition-colors font-karla"
          >
            Save
          </button>
          <button
            @click="showNotesDialog = false"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors font-karla"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <NotificationModal
      :show="notification.show"
      :type="notification.type"
      :title="notification.title"
      :message="notification.message"
      @close="notification.show = false"
    />
  </SidebarLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import SidebarLayout from '~/app/components/layouts/sidebar-layout.vue'
import NotificationModal from '~/app/components/shared/notification-modal.vue'

interface Respondent {
  id: number
  name: string
  email: string
  phone: string | null
  trackingCode: string | null
  status: string
  propertyAddress: string | null
  notes: string | null
  createdAt: string | null
}

const props = defineProps<{
  respondents: Respondent[]
  churchId: number | null
}>()

const respondentList = ref<Respondent[]>([...props.respondents])
const statusFilter = ref('all')

const showNotesDialog = ref(false)
const editingRespondent = ref<Respondent | null>(null)
const editNotes = ref('')

const notification = ref({
  show: false,
  type: 'info' as 'success' | 'error' | 'info',
  title: '',
  message: '',
})

const showNotification = (type: 'success' | 'error' | 'info', title: string, message: string) => {
  notification.value = { show: true, type, title, message }
}

const filteredRespondents = computed(() => {
  if (statusFilter.value === 'all') return respondentList.value
  return respondentList.value.filter((r) => r.status === statusFilter.value)
})

const getCsrfToken = () => {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1]
}

const updateStatus = async (respondentId: number, newStatus: string) => {
  try {
    const csrfToken = getCsrfToken()
    const response = await fetch(`/api/respondents/${respondentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': csrfToken ? decodeURIComponent(csrfToken) : '',
      },
      credentials: 'same-origin',
      body: JSON.stringify({ status: newStatus }),
    })

    if (response.ok) {
      const r = respondentList.value.find((r) => r.id === respondentId)
      if (r) r.status = newStatus
      showNotification('success', 'Updated', 'Respondent status updated.')
    } else {
      showNotification('error', 'Error', 'Failed to update status')
    }
  } catch (error) {
    showNotification('error', 'Error', 'An error occurred')
  }
}

const openNotesDialog = (respondent: Respondent) => {
  editingRespondent.value = respondent
  editNotes.value = respondent.notes || ''
  showNotesDialog.value = true
}

const saveNotes = async () => {
  if (!editingRespondent.value) return

  try {
    const csrfToken = getCsrfToken()
    const response = await fetch(`/api/respondents/${editingRespondent.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': csrfToken ? decodeURIComponent(csrfToken) : '',
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        status: editingRespondent.value.status,
        notes: editNotes.value,
      }),
    })

    if (response.ok) {
      editingRespondent.value.notes = editNotes.value
      showNotesDialog.value = false
      showNotification('success', 'Saved', 'Notes updated successfully.')
    } else {
      showNotification('error', 'Error', 'Failed to save notes')
    }
  } catch (error) {
    showNotification('error', 'Error', 'An error occurred')
  }
}

const statusBadgeClass = (status: string) => {
  switch (status) {
    case 'new':
      return 'bg-blue-100 text-blue-700'
    case 'contacted':
      return 'bg-yellow-100 text-yellow-700'
    case 'healthcheck_scheduled':
      return 'bg-purple-100 text-purple-700'
    case 'healthcheck_completed':
      return 'bg-green-100 text-green-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const formatStatus = (status: string) => {
  switch (status) {
    case 'new':
      return 'New'
    case 'contacted':
      return 'Contacted'
    case 'healthcheck_scheduled':
      return 'Scheduled'
    case 'healthcheck_completed':
      return 'Completed'
    default:
      return status
  }
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>
