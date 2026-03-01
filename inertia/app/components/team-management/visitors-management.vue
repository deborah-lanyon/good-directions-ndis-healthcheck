<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg p-6 min-w-0">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h3 class="text-2xl font-semibold text-gray-900">Delivery Management</h3>
          <p class="text-sm text-gray-600 mt-1">
            Manage deliveries and assign them to street groups
          </p>
        </div>
        <button
          @click="showCreateDialog = true"
          class="inline-flex items-center rounded-md bg-primary hover:bg-primary/90 px-4 py-2 text-sm font-semibold text-white shadow-sm"
        >
          <span class="mr-2">+</span>
          Create Delivery
        </button>
      </div>

      <!-- Visitors List -->
      <div v-if="visitors.length === 0" class="text-center py-12">
        <p class="text-gray-500 text-lg">No deliveries yet. Create your first one to get started!</p>
      </div>

      <div v-else class="bg-white rounded-lg shadow overflow-x-auto border border-gray-200">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Phone
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Street Groups
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="visitor in visitors" :key="visitor.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium text-gray-900">{{ visitor.name }}</span>
                  <span
                    v-if="visitor.isAdminVisitor"
                    class="px-1.5 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-700"
                  >
                    Admin
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ visitor.email || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ visitor.phone || '-' }}</div>
              </td>
              <td class="px-6 py-4">
                <div
                  v-if="visitor.streetGroups && visitor.streetGroups.length > 0"
                  class="text-sm text-gray-900"
                >
                  <span v-for="(group, index) in visitor.streetGroups" :key="group.id">
                    {{ group.name }}<span v-if="index < visitor.streetGroups.length - 1">, </span>
                  </span>
                </div>
                <div v-else class="text-sm text-gray-400 italic">Not assigned</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  v-if="visitor.hasAccess"
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"
                >
                  Active
                </span>
                <span
                  v-else
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800"
                >
                  Needs Invitation
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div v-if="visitor.isAdminVisitor" class="text-xs text-gray-400 italic">
                  Managed via Organisation Profile
                </div>
                <div v-else class="flex justify-end items-center gap-2">
                  <button
                    v-if="!visitor.hasAccess"
                    @click="sendInvitation(visitor)"
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                    :disabled="!visitor.email"
                    :title="visitor.email ? 'Send invitation email' : 'Add email address first'"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Send Invite
                  </button>
                  <button
                    v-if="visitor.hasAccess"
                    @click="revokeAccess(visitor)"
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-md"
                  >
                    Put on Hold
                  </button>
                  <button
                    @click="editVisitor(visitor)"
                    class="text-gray-400 hover:text-tertiary"
                    title="Edit visitor"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                  <button
                    @click="deleteVisitor(visitor)"
                    class="text-gray-400 hover:text-red-600"
                    title="Delete visitor"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <Dialog
      :open="showCreateDialog || !!selectedVisitor"
      @update:open="(open) => !open && closeDialog()"
    >
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle class="text-2xl">
            {{ selectedVisitor ? 'Edit Delivery' : 'Create Delivery' }}
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
              <span v-else>{{ selectedVisitor ? 'Update Delivery' : 'Create Delivery' }}</span>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { router, usePage } from '@inertiajs/vue3'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/app/components/ui/dialog'
import Toast from '~/app/components/shared/toast.vue'

interface Visitor {
  id: number
  name: string
  email: string | null
  phone: string | null
  hasAccess: boolean
  isAdminVisitor?: boolean
  streetGroups?: Array<{
    id: number
    name: string
  }>
}

const props = defineProps<{
  visitors: Visitor[]
  streetGroups: any[]
}>()

const showCreateDialog = ref(false)
const selectedVisitor = ref<Visitor | null>(null)
const isSaving = ref(false)
const toast = ref({ show: false, type: 'success' as 'success' | 'error', message: '' })

const form = reactive({
  name: '',
  email: '',
  phone: '',
})

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
          preserveScroll: true,
          onSuccess: () => {
            const flash = (usePage().props as any).flash
            if (flash?.error) {
              showToast('error', flash.error)
            } else {
              showToast('success', flash?.success || 'Visitor updated successfully')
              closeDialog()
            }
          },
          onError: (errors) => {
            showToast(
              'error',
              Object.values(errors).flat().join(', ') || 'Failed to update visitor'
            )
          },
          onFinish: () => {
            isSaving.value = false
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
          preserveScroll: true,
          onSuccess: () => {
            const flash = (usePage().props as any).flash
            if (flash?.error) {
              showToast('error', flash.error)
            } else {
              showToast('success', flash?.success || 'Visitor created successfully')
              closeDialog()
            }
          },
          onError: (errors) => {
            showToast(
              'error',
              Object.values(errors).flat().join(', ') || 'Failed to create visitor'
            )
          },
          onFinish: () => {
            isSaving.value = false
          },
        }
      )
    }
  } catch (error) {
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
      showToast('success', 'Visitor deleted successfully')
      router.reload()
    },
    onError: () => {
      showToast('error', 'Failed to delete visitor')
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
        showToast('success', 'Invitation sent successfully')
      },
      onError: () => {
        showToast('error', 'Failed to send invitation')
      },
    }
  )
}

async function revokeAccess(visitor: Visitor) {
  if (!confirm(`Revoke access for ${visitor.name}?`)) {
    return
  }

  router.post(
    `/api/visitors/${visitor.id}/revoke-access`,
    {},
    {
      onSuccess: () => {
        showToast('success', 'Access revoked successfully')
      },
      onError: () => {
        showToast('error', 'Failed to revoke access')
      },
    }
  )
}

function showToast(type: 'success' | 'error', message: string) {
  toast.value = { show: true, type, message }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}
</script>
