<template>
  <div>
    <Navigation />
    <Container class="py-[70px]">
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-4">
          <button @click="router.visit('/street-groups')" class="text-gray-600 hover:text-gray-900">
            ← Back to Street Groups
          </button>
        </div>
        <h2 class="text-tertiary font-caprasimo text-2xl md:text-[30px] leading-[150%] mb-2">
          {{ streetGroup.name }} - Visitors
        </h2>
        <p v-if="streetGroup.description" class="text-gray-600">{{ streetGroup.description }}</p>
      </div>

      <!-- Add Visitor Button -->
      <div class="mb-6">
        <Button @click="showAddDialog = true" class="bg-tertiary hover:bg-[#e59a00]">
          + Add Visitor
        </Button>
      </div>

      <!-- Visitors List -->
      <div v-if="visitors.length === 0" class="text-center py-12">
        <p class="text-gray-500 text-lg">
          No visitors assigned yet. Add your first visitor to get started!
        </p>
      </div>

      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
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
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="visitor in visitors" :key="visitor.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ visitor.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ visitor.email || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ visitor.phone || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  @click="editVisitor(visitor)"
                  class="text-blue-600 hover:text-blue-900 mr-4"
                >
                  Edit
                </button>
                <button @click="deleteVisitor(visitor)" class="text-red-600 hover:text-red-900">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Container>

    <!-- Add/Edit Visitor Dialog -->
    <Dialog
      :open="showAddDialog || !!selectedVisitor"
      @update:open="(open: boolean) => !open && closeDialog()"
    >
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle class="text-2xl">
            {{ selectedVisitor ? 'Edit Visitor' : 'Add Visitor' }}
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
              placeholder="Enter visitor name"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="form.email"
              type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="visitor@example.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              v-model="form.phone"
              type="tel"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0400 000 000"
            />
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" @click="closeDialog()"> Cancel </Button>
            <Button type="submit" class="bg-tertiary hover:bg-[#e59a00]">
              {{ selectedVisitor ? 'Update' : 'Add' }} Visitor
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { router } from '@inertiajs/vue3'
import axios from 'axios'
import Navigation from '../app/components/shared/navigation.vue'
import Container from '../app/components/container.vue'
import Button from '../components/ui/button/Button.vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../app/components/ui/dialog'

interface Visitor {
  id: number
  name: string
  email: string | null
  phone: string | null
}

interface StreetGroup {
  id: number
  name: string
  description: string | null
}

const props = defineProps<{
  streetGroup: StreetGroup
  visitors: Visitor[]
}>()

const showAddDialog = ref(false)
const selectedVisitor = ref<Visitor | null>(null)

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
  showAddDialog.value = false
  selectedVisitor.value = null
  resetForm()
}

function editVisitor(visitor: Visitor) {
  selectedVisitor.value = visitor
  form.name = visitor.name
  form.email = visitor.email || ''
  form.phone = visitor.phone || ''
}

async function deleteVisitor(visitor: Visitor) {
  if (!confirm(`Are you sure you want to delete "${visitor.name}"?`)) {
    return
  }

  try {
    await axios.delete(`/api/visitors/${visitor.id}`)
    router.reload()
  } catch (error: any) {
    console.error('Failed to delete visitor:', error)
    alert(error.response?.data?.message || 'Failed to delete visitor. Please try again.')
  }
}

async function saveVisitor() {
  try {
    const visitorData = {
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
    }

    if (selectedVisitor.value) {
      // Update existing visitor
      await axios.put(`/api/visitors/${selectedVisitor.value.id}`, visitorData)
    } else {
      // Create new visitor
      await axios.post(`/api/street-groups/${props.streetGroup.id}/visitors`, visitorData)
    }

    router.reload()
    closeDialog()
  } catch (error: any) {
    console.error('Failed to save visitor:', error)
    alert(error.response?.data?.message || 'Failed to save visitor. Please try again.')
  }
}
</script>
