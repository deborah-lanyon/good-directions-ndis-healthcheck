<template>
  <AdminSidebarLayout page-title="User Management" page-subtitle="Manage all user accounts and permissions">
      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex justify-end mb-4">
          <button
            @click="showCreateModal = true"
            class="px-4 py-2 bg-tertiary hover:bg-[#e55d4d] text-white rounded-lg font-medium transition-colors"
          >
            Create User
          </button>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent class="p-4">
              <div class="text-sm text-gray-600">Total Users</div>
              <div class="text-2xl font-bold text-gray-900">{{ stats.total }}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent class="p-4">
              <div class="text-sm text-gray-600">Super Admins</div>
              <div class="text-2xl font-bold text-purple-600">
                {{ stats.byRole?.super_admin || 0 }}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent class="p-4">
              <div class="text-sm text-gray-600">Church Admins</div>
              <div class="text-2xl font-bold text-blue-600">
                {{ stats.byRole?.church_admin || 0 }}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent class="p-4">
              <div class="text-sm text-gray-600">Visitors</div>
              <div class="text-2xl font-bold text-green-600">{{ stats.byRole?.visitor || 0 }}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <!-- Filters and Search -->
      <Card class="mb-6">
        <CardContent class="p-4">
          <div class="flex flex-col md:flex-row gap-4">
            <!-- Search -->
            <div class="flex-1 relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by name or email..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                class="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <!-- Role Filter -->
            <select
              v-model="roleFilter"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="church_admin">Church Admin</option>
              <option value="visitor">Visitor</option>
            </select>

            <!-- Status Filter -->
            <select
              v-model="statusFilter"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <!-- Users Table -->
      <Card>
        <CardContent class="p-0">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    User
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Role
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Assignment
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Created
                  </th>
                  <th
                    class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div>
                        <div class="text-sm font-medium text-gray-900">
                          {{ user.fullName || 'N/A' }}
                        </div>
                        <div class="text-sm text-gray-500">{{ user.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="getRoleBadgeClass(user.role)"
                    >
                      {{ formatRole(user.role) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="getStatusBadgeClass(user.adminApprovalStatus)"
                    >
                      {{ user.adminApprovalStatus }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div v-if="user.church" class="text-sm text-gray-900">
                      {{ user.church.churchName }}
                      <span class="text-gray-500">(Church)</span>
                    </div>
                    <div v-else-if="user.visitor" class="text-sm text-gray-900">
                      {{ user.visitor.name }}
                      <span class="text-gray-500">(Visitor)</span>
                    </div>
                    <div v-else class="text-sm text-gray-400">No assignment</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(user.createdAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button @click="editUser(user)" class="text-blue-600 hover:text-blue-900 mr-3">
                      Edit
                    </button>
                    <button
                      @click="changeRole(user)"
                      class="text-purple-600 hover:text-purple-900 mr-3"
                    >
                      Role
                    </button>
                    <button
                      @click="resetPassword(user.id)"
                      class="text-orange-600 hover:text-orange-900 mr-3"
                    >
                      Reset PW
                    </button>
                    <button
                      @click="deleteUserConfirm(user)"
                      class="text-red-600 hover:text-red-900"
                      :disabled="user.id === currentUserId"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div v-if="filteredUsers.length === 0" class="text-center py-12">
            <svg
              class="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p class="mt-1 text-sm text-gray-500">Try adjusting your search or filters</p>
          </div>
        </CardContent>
      </Card>
    <!-- Create User Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 overflow-y-auto flex items-center justify-center p-4"
      style="z-index: 9999; background-color: rgba(0, 0, 0, 0.5)"
      @click.self="showCreateModal = false"
    >
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Create User</h3>

        <form @submit.prevent="createUser">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                v-model="createForm.fullName"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                v-model="createForm.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                v-model="createForm.role"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="church_admin">Church Admin</option>
                <option value="visitor">Visitor</option>
              </select>
            </div>
          </div>

          <div class="bg-blue-50 border-l-4 border-blue-400 p-3 mt-4">
            <p class="text-sm text-blue-700">
              The user will be created with approved status and sent a password setup email.
            </p>
          </div>

          <div class="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              @click="showCreateModal = false"
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="creating"
              class="px-4 py-2 bg-tertiary hover:bg-[#e55d4d] text-white rounded-lg font-medium disabled:opacity-50"
            >
              {{ creating ? 'Creating...' : 'Create User' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 overflow-y-auto flex items-center justify-center p-4"
      style="z-index: 9999; background-color: rgba(0, 0, 0, 0.5)"
      @click.self="showEditModal = false"
    >
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Edit User</h3>

        <form @submit.prevent="updateUser">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                v-model="editForm.fullName"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                v-model="editForm.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                v-model="editForm.adminApprovalStatus"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div class="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              @click="showEditModal = false"
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="updating"
              class="px-4 py-2 bg-tertiary hover:bg-[#e55d4d] text-white rounded-lg font-medium disabled:opacity-50"
            >
              {{ updating ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Change Role Modal -->
    <div
      v-if="showRoleModal"
      class="fixed inset-0 overflow-y-auto flex items-center justify-center p-4"
      style="z-index: 9999; background-color: rgba(0, 0, 0, 0.5)"
      @click.self="showRoleModal = false"
    >
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Change User Role</h3>

        <form @submit.prevent="updateRole">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Select New Role</label>
            <select
              v-model="roleForm.role"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="super_admin">Super Admin</option>
              <option value="church_admin">Church Admin</option>
              <option value="visitor">Visitor</option>
            </select>
          </div>

          <div class="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
            <p class="text-sm text-yellow-700">
              Changing roles may affect user permissions and access. This action cannot be undone
              automatically.
            </p>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="showRoleModal = false"
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="updating"
              class="px-4 py-2 bg-tertiary hover:bg-[#e55d4d] text-white rounded-lg font-medium disabled:opacity-50"
            >
              {{ updating ? 'Changing...' : 'Change Role' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :show="confirmation.show"
      :title="confirmation.title"
      :message="confirmation.message"
      :confirm-text="confirmation.confirmText"
      :cancel-text="confirmation.cancelText"
      :variant="confirmation.variant"
      :loading="confirmation.loading"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />

    <!-- Toast Notification -->
    <Toast :show="toast.show" :type="toast.type" :message="toast.message" @close="closeToast" />
  </AdminSidebarLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { router, usePage } from '@inertiajs/vue3'
import axios from 'axios'
import AdminSidebarLayout from '~/app/components/layouts/admin-sidebar-layout.vue'
import Toast from '~/app/components/shared/toast.vue'
import ConfirmationModal from '~/app/components/shared/confirmation-modal.vue'
import { Card, CardContent } from '~/app/components/ui/card'

interface User {
  id: number
  fullName: string | null
  email: string
  role: 'super_admin' | 'church_admin' | 'visitor'
  adminApprovalStatus: 'pending' | 'approved' | 'rejected'
  createdAt: string
  church?: {
    id: number
    churchName: string
  }
  visitor?: {
    id: number
    name: string
    streetGroup?: {
      name: string
      territory?: {
        name: string
      }
    }
  }
}

interface Stats {
  total: number
  byRole: Record<string, number>
  byStatus: Record<string, number>
  recentUsers: any[]
}

const props = defineProps<{
  users: User[]
  stats: Stats
}>()

const page = usePage()
const currentUserId = computed(() => (page.props.user as any)?.id)

const searchQuery = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showRoleModal = ref(false)
const updating = ref(false)
const creating = ref(false)

const createForm = ref({
  fullName: '',
  email: '',
  role: 'church_admin' as 'church_admin' | 'visitor',
})

const editForm = ref({
  id: 0,
  fullName: '',
  email: '',
  adminApprovalStatus: 'pending' as 'pending' | 'approved' | 'rejected',
})

const roleForm = ref({
  id: 0,
  role: 'church_admin' as 'super_admin' | 'church_admin' | 'visitor',
})

const toast = ref({
  show: false,
  type: 'success' as 'success' | 'error' | 'info',
  message: '',
})

const confirmation = ref({
  show: false,
  title: '',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'danger' as 'danger' | 'warning',
  loading: false,
  action: null as (() => Promise<void>) | null,
})

const filteredUsers = computed(() => {
  return props.users.filter((user) => {
    const matchesSearch =
      !searchQuery.value ||
      user.fullName?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesRole = !roleFilter.value || user.role === roleFilter.value
    const matchesStatus = !statusFilter.value || user.adminApprovalStatus === statusFilter.value

    return matchesSearch && matchesRole && matchesStatus
  })
})

function getRoleBadgeClass(role: string) {
  const classes = {
    super_admin: 'bg-purple-100 text-purple-800',
    church_admin: 'bg-blue-100 text-blue-800',
    visitor: 'bg-green-100 text-green-800',
  }
  return classes[role as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

function getStatusBadgeClass(status: string) {
  const classes = {
    approved: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-800',
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

function formatRole(role: string) {
  const labels = {
    super_admin: 'Super Admin',
    church_admin: 'Church Admin',
    visitor: 'Visitor',
  }
  return labels[role as keyof typeof labels] || role
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString()
}

function editUser(user: User) {
  editForm.value = {
    id: user.id,
    fullName: user.fullName || '',
    email: user.email,
    adminApprovalStatus: user.adminApprovalStatus,
  }
  showEditModal.value = true
}

function changeRole(user: User) {
  roleForm.value = {
    id: user.id,
    role: user.role,
  }
  showRoleModal.value = true
}

async function createUser() {
  creating.value = true
  try {
    const response = await axios.post('/api/admin/users', {
      fullName: createForm.value.fullName,
      email: createForm.value.email,
      role: createForm.value.role,
    })

    showToast('success', response.data.message || 'User created successfully')
    showCreateModal.value = false
    createForm.value = { fullName: '', email: '', role: 'church_admin' }
    router.reload()
  } catch (error: any) {
    showToast('error', error.response?.data?.error || 'Failed to create user')
  } finally {
    creating.value = false
  }
}

async function updateUser() {
  updating.value = true
  try {
    const response = await axios.put(`/api/admin/users/${editForm.value.id}`, {
      fullName: editForm.value.fullName,
      email: editForm.value.email,
      adminApprovalStatus: editForm.value.adminApprovalStatus,
    })

    showToast('success', response.data.message || 'User updated successfully')
    showEditModal.value = false
    router.reload()
  } catch (error: any) {
    showToast('error', error.response?.data?.error || 'Failed to update user')
  } finally {
    updating.value = false
  }
}

async function updateRole() {
  updating.value = true
  try {
    const response = await axios.put(`/api/admin/users/${roleForm.value.id}/role`, {
      role: roleForm.value.role,
    })

    showToast('success', response.data.message || 'Role changed successfully')
    showRoleModal.value = false
    router.reload()
  } catch (error: any) {
    showToast('error', error.response?.data?.error || 'Failed to change role')
  } finally {
    updating.value = false
  }
}

async function resetPassword(userId: number) {
  confirmation.value = {
    show: true,
    title: 'Reset Password',
    message: 'Send a password reset email to this user?',
    confirmText: 'Send Reset Email',
    cancelText: 'Cancel',
    variant: 'warning',
    loading: false,
    action: async () => {
      try {
        const response = await axios.post(`/api/admin/users/${userId}/reset-password`)
        showToast('success', response.data.message || 'Password reset email sent')
      } catch (error: any) {
        showToast('error', error.response?.data?.error || 'Failed to send reset email')
      }
    },
  }
}

function deleteUserConfirm(user: User) {
  if (user.id === currentUserId.value) {
    showToast('error', 'You cannot delete your own account')
    return
  }

  confirmation.value = {
    show: true,
    title: 'Delete User',
    message: `Are you sure you want to delete ${user.fullName || user.email}? This action cannot be undone.`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
    variant: 'danger',
    loading: false,
    action: async () => {
      try {
        const response = await axios.delete(`/api/admin/users/${user.id}`)
        showToast('success', response.data.message || 'User deleted successfully')
        router.reload()
      } catch (error: any) {
        showToast('error', error.response?.data?.error || 'Failed to delete user')
      }
    },
  }
}

async function handleConfirm() {
  if (confirmation.value.action) {
    confirmation.value.loading = true
    try {
      await confirmation.value.action()
    } finally {
      confirmation.value.loading = false
      confirmation.value.show = false
    }
  }
}

function handleCancel() {
  confirmation.value.show = false
}

function showToast(type: 'success' | 'error' | 'info', message: string) {
  toast.value = { show: true, type, message }
}

function closeToast() {
  toast.value.show = false
}
</script>
