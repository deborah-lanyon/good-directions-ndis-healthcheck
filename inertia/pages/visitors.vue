<template>
  <SidebarLayout pageTitle="Team Members" pageSubtitle="Manage church visitors and assign them to street groups">
    <!-- Create Button -->
    <div class="mb-6">
      <Button @click="showCreateDialog = true" class="bg-tertiary hover:bg-[#e59a00]">
        + Create Team Member
      </Button>
    </div>

    <!-- Visitors List -->
    <div v-if="visitors.length === 0" class="text-center py-12">
      <p class="text-gray-500 text-lg">No visitors yet. Create your first one to get started!</p>
    </div>

    <div v-else>
      <!-- Desktop: Table -->
      <div class="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Street Groups</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="visitor in visitors" :key="visitor.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ visitor.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ visitor.email || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ visitor.phone || '-' }}</div>
              </td>
              <td class="px-6 py-4">
                <div v-if="visitor.streetGroups && visitor.streetGroups.length > 0" class="text-sm text-gray-900">
                  <span v-for="(group, index) in visitor.streetGroups" :key="group.id">
                    {{ group.name }}<span v-if="index < visitor.streetGroups.length - 1">, </span>
                  </span>
                </div>
                <div v-else class="text-sm text-gray-400 italic">Not assigned</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span v-if="visitor.hasAccess" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                <span v-else class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">Needs Invitation</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end items-center gap-2">
                  <button
                    v-if="!visitor.hasAccess"
                    @click="sendInvitation(visitor)"
                    :class="['inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed', visitor.invitationSentAt ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700']"
                    :disabled="!visitor.email"
                    :title="visitor.email ? (visitor.invitationSentAt ? 'Resend invitation email' : 'Send invitation email') : 'Add email address first'"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {{ visitor.invitationSentAt ? 'Invite Sent' : 'Send Invite' }}
                  </button>
                  <button @click="viewAsVisitor(visitor)" class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md" title="View portal as this visitor">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View as Visitor
                  </button>
                  <button v-if="visitor.hasAccess" @click="revokeAccess(visitor)" class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-md">Put on Hold</button>
                  <button @click="editVisitor(visitor)" class="text-gray-400 hover:text-tertiary" title="Edit visitor">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button @click="deleteVisitor(visitor)" class="text-gray-400 hover:text-red-600" title="Delete visitor">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile: Cards -->
      <div class="md:hidden space-y-3">
        <div
          v-for="visitor in visitors"
          :key="visitor.id"
          class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
        >
          <div class="flex items-start justify-between mb-2">
            <div>
              <h3 class="text-sm font-semibold text-gray-900">{{ visitor.name }}</h3>
              <p v-if="visitor.email" class="text-xs text-gray-500 mt-0.5">{{ visitor.email }}</p>
              <p v-if="visitor.phone" class="text-xs text-gray-500">{{ visitor.phone }}</p>
            </div>
            <span
              v-if="visitor.hasAccess"
              class="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex-shrink-0"
            >Active</span>
            <span
              v-else
              class="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 flex-shrink-0"
            >Needs Invitation</span>
          </div>
          <div v-if="visitor.streetGroups && visitor.streetGroups.length > 0" class="mb-3">
            <p class="text-xs text-gray-500">
              <span class="font-medium">Groups:</span>
              <span v-for="(group, index) in visitor.streetGroups" :key="group.id">
                {{ group.name }}<span v-if="index < visitor.streetGroups.length - 1">, </span>
              </span>
            </p>
          </div>
          <div v-else class="mb-3">
            <p class="text-xs text-gray-400 italic">No street groups assigned</p>
          </div>
          <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
            <button
              v-if="!visitor.hasAccess"
              @click="sendInvitation(visitor)"
              :class="['inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white rounded-md disabled:opacity-50', visitor.invitationSentAt ? 'bg-orange-500' : 'bg-blue-600']"
              :disabled="!visitor.email"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {{ visitor.invitationSentAt ? 'Invite Sent' : 'Send Invite' }}
            </button>
            <button @click="viewAsVisitor(visitor)" class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-teal-600 rounded-md">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View
            </button>
            <button v-if="visitor.hasAccess" @click="revokeAccess(visitor)" class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-orange-500 rounded-md">Hold</button>
            <div class="flex-1"></div>
            <button @click="editVisitor(visitor)" class="text-gray-400 hover:text-tertiary p-1" title="Edit">
              <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button @click="deleteVisitor(visitor)" class="text-gray-400 hover:text-red-600 p-1" title="Delete">
              <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <Dialog
      :open="showCreateDialog || !!selectedVisitor"
      @update:open="(open: boolean) => !open && closeDialog()"
    >
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle class="text-2xl">
            {{ selectedVisitor ? 'Edit Team Member' : 'Create Team Member' }}
          </DialogTitle>
        </DialogHeader>

        <form @submit.prevent="saveVisitor" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Full name"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="form.email"
              type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              v-model="form.phone"
              type="tel"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+61 XXX XXX XXX"
            />
          </div>

          <div class="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" @click="closeDialog"> Cancel </Button>
            <Button
              type="submit"
              :disabled="isSaving"
              class="bg-tertiary hover:bg-[#e59a00] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isSaving" class="flex items-center gap-2">
                <svg
                  class="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </span>
              <span v-else>{{ selectedVisitor ? 'Update Team Member' : 'Create Team Member' }}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Toast Notification -->
    <Toast
      :show="toast.show"
      :type="toast.type"
      :message="toast.message"
      @close="toast.show = false"
    />
  </SidebarLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { router } from '@inertiajs/vue3'
import SidebarLayout from '~/app/components/layouts/sidebar-layout.vue'
import Button from '@/components/ui/button/Button.vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/app/components/ui/dialog'
import Toast from '~/app/components/shared/toast.vue'

interface Visitor {
  id: number
  name: string
  email: string | null
  phone: string | null
  hasAccess: boolean
  invitationSentAt: string | null
  streetGroups?: Array<{
    id: number
    name: string
  }>
}

interface Props {
  visitors?: Visitor[]
}

const props = defineProps<Props>()
const visitors = computed(() => props.visitors || [])

const showCreateDialog = ref(false)
const selectedVisitor = ref<Visitor | null>(null)
const isSaving = ref(false)
const toast = ref({ show: false, type: 'success' as 'success' | 'error', message: '' })

const form = reactive({
  name: '',
  email: '',
  phone: '',
})

function showToast(type: 'success' | 'error', message: string) {
  toast.value = { show: true, type, message }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

function resetForm() {
  form.name = ''
  form.email = ''
  form.phone = ''
}

function closeDialog() {
  showCreateDialog.value = false
  selectedVisitor.value = null
  resetForm()
}

function editVisitor(visitor: Visitor) {
  selectedVisitor.value = visitor
  form.name = visitor.name
  form.email = visitor.email || ''
  form.phone = visitor.phone || ''
}

async function saveVisitor() {
  isSaving.value = true

  try {
    if (selectedVisitor.value) {
      // Update existing visitor
      router.put(
        `/api/visitors/${selectedVisitor.value.id}`,
        {
          name: form.name,
          email: form.email || null,
          phone: form.phone || null,
        },
        {
          onSuccess: () => {
            showToast('success', 'Visitor updated successfully')
            closeDialog()
          },
          onError: (errors) => {
            showToast(
              'error',
              Object.values(errors).flat().join(', ') || 'Failed to update visitor'
            )
          },
        }
      )
    } else {
      // Create new visitor
      router.post(
        '/api/visitors',
        {
          name: form.name,
          email: form.email || null,
          phone: form.phone || null,
        },
        {
          onSuccess: () => {
            showToast('success', 'Visitor created successfully')
            closeDialog()
          },
          onError: (errors) => {
            showToast(
              'error',
              Object.values(errors).flat().join(', ') || 'Failed to create visitor'
            )
          },
        }
      )
    }
  } finally {
    isSaving.value = false
  }
}

async function deleteVisitor(visitor: Visitor) {
  if (!confirm(`Are you sure you want to delete ${visitor.name}? This action cannot be undone.`)) {
    return
  }

  router.delete(`/api/visitors/${visitor.id}`, {
    preserveScroll: true,
    onSuccess: () => {
      showToast('success', 'Team member deleted successfully')
    },
    onError: () => {
      showToast('error', 'Failed to delete team member')
    },
  })
}

async function sendInvitation(visitor: Visitor) {
  if (!visitor.email) {
    showToast('error', 'Cannot send invitation: visitor has no email address')
    return
  }

  router.post(
    `/api/visitors/${visitor.id}/send-invitation`,
    {},
    {
      onSuccess: () => {
        showToast('success', 'Invitation sent successfully!')
      },
      onError: () => {
        showToast('error', 'Failed to send invitation')
      },
    }
  )
}

function viewAsVisitor(visitor: Visitor) {
  router.post(`/api/visitors/${visitor.id}/act-as`, {}, {
    onError: () => {
      showToast('error', 'Failed to switch to visitor view')
    },
  })
}

async function revokeAccess(visitor: Visitor) {
  if (!confirm(`Put ${visitor.name} on hold? They will need a new invitation to regain access.`)) {
    return
  }

  router.post(
    `/api/visitors/${visitor.id}/revoke-access`,
    {},
    {
      onSuccess: () => {
        showToast('success', 'Team member put on hold')
      },
      onError: () => {
        showToast('error', 'Failed to put team member on hold')
      },
    }
  )
}
</script>
