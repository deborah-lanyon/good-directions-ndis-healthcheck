<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import VisitorSidebarLayout from '~/app/components/layouts/visitor-sidebar-layout.vue'

interface Visitor {
  id: number
  name: string
  email: string | null
  phone: string | null
  church?: {
    id: number
    churchName: string
  }
  streetGroups?: Array<{
    id: number
    name: string
    streetAssignments?: Array<{
      id: number
      streetName: string
      streetNumberStart?: number | null
      streetNumberEnd?: number | null
    }>
  }>
}

interface Stats {
  totalProperties: number
  visitedProperties: number
  pendingProperties: number
  recentActivity: any[]
}

const props = defineProps<{
  visitor: Visitor
  stats: Stats
}>()

const visitedPercentage =
  props.stats.totalProperties > 0
    ? Math.round((props.stats.visitedProperties / props.stats.totalProperties) * 100)
    : 0
</script>

<template>
  <VisitorSidebarLayout pageTitle="Dashboard" :pageSubtitle="visitor.church?.churchName || ''">
    <!-- Welcome Banner -->
    <div class="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-8 mb-8 text-white">
      <h2 class="font-caprasimo text-3xl mb-2">
        Welcome back, {{ visitor.name }}
      </h2>
      <p class="font-karla text-white/80 text-lg">
        Here's an overview of your property visit progress.
      </p>
    </div>

    <!-- Quick Actions (moved to top) -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <Link href="/visitor/properties?status=pending" class="block">
        <div class="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-tertiary/10 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="font-karla font-semibold text-lg text-gray-800">View Pending Properties</p>
              <p class="font-karla text-sm text-gray-500">{{ stats.pendingProperties }} properties need your attention</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>

      <Link href="/visitor/properties" class="block">
        <div class="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-[#4CAF50]/10 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-[#4CAF50]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="font-karla font-semibold text-lg text-gray-800">View All Properties</p>
              <p class="font-karla text-sm text-gray-500">Browse and manage all {{ stats.totalProperties }} assignments</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-karla text-sm text-gray-500">Total Properties</h3>
          <div class="w-10 h-10 rounded-lg bg-[#2196F3]/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[#2196F3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          </div>
        </div>
        <p class="font-karla font-bold text-3xl text-gray-800">{{ stats.totalProperties }}</p>
        <p class="font-karla text-xs text-gray-400 mt-1">Assigned to you</p>
      </div>

      <div class="bg-white rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-karla text-sm text-gray-500">Visited</h3>
          <div class="w-10 h-10 rounded-lg bg-[#4CAF50]/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[#4CAF50]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p class="font-karla font-bold text-3xl text-[#4CAF50]">{{ stats.visitedProperties }}</p>
        <p class="font-karla text-xs text-gray-400 mt-1">{{ visitedPercentage }}% complete</p>
      </div>

      <div class="bg-white rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-karla text-sm text-gray-500">Pending</h3>
          <div class="w-10 h-10 rounded-lg bg-[#FF9800]/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[#FF9800]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p class="font-karla font-bold text-3xl text-[#FF9800]">{{ stats.pendingProperties }}</p>
        <p class="font-karla text-xs text-gray-400 mt-1">Need attention</p>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="bg-white rounded-xl p-6 mb-8">
      <h3 class="font-karla font-semibold text-lg text-gray-800 mb-4">Your Progress</h3>
      <div class="space-y-3">
        <div class="flex justify-between text-sm">
          <span class="font-karla text-gray-600">Completion</span>
          <span class="font-karla font-semibold text-gray-900">{{ visitedPercentage }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3">
          <div
            class="bg-[#4CAF50] h-3 rounded-full transition-all duration-500"
            :style="{ width: `${visitedPercentage}%` }"
          ></div>
        </div>
        <p class="font-karla text-xs text-gray-500">
          {{ stats.visitedProperties }} of {{ stats.totalProperties }} properties visited
        </p>
      </div>
    </div>

    <!-- Assigned Street Groups -->
    <div v-if="visitor.streetGroups && visitor.streetGroups.length > 0">
      <h3 class="font-karla font-semibold text-lg text-gray-800 mb-4">Your Street Groups</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div
          v-for="group in visitor.streetGroups"
          :key="group.id"
          class="bg-white rounded-xl p-6"
        >
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-lg bg-[#FF9800]/10 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[#FF9800]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
              </svg>
            </div>
            <h3 class="font-karla font-semibold text-lg text-gray-800">{{ group.name }}</h3>
          </div>
          <div v-if="group.streetAssignments && group.streetAssignments.length > 0" class="space-y-2">
            <div
              v-for="assignment in group.streetAssignments"
              :key="assignment.id"
              class="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <span class="font-karla text-sm text-gray-700">
                {{ assignment.streetName }}
                <span v-if="assignment.streetNumberStart || assignment.streetNumberEnd" class="text-gray-400">
                  ({{ assignment.streetNumberStart || '?' }}–{{ assignment.streetNumberEnd || '?' }})
                </span>
              </span>
            </div>
          </div>
          <p v-else class="font-karla text-sm text-gray-400">No streets assigned yet</p>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div v-if="stats.recentActivity && stats.recentActivity.length > 0" class="bg-white rounded-xl p-6">
      <h3 class="font-karla font-semibold text-lg text-gray-800 mb-4">Recent Activity</h3>
      <div class="space-y-4">
        <div
          v-for="property in stats.recentActivity"
          :key="property.id"
          class="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
        >
          <div class="flex-shrink-0">
            <div
              class="w-2 h-2 rounded-full mt-2"
              :class="{
                'bg-green-500':
                  property.feedbackStatus !== 'pending' &&
                  property.feedbackStatus !== 'No Answer',
                'bg-orange-500': property.feedbackStatus === 'pending',
                'bg-gray-400': property.feedbackStatus === 'No Answer',
              }"
            ></div>
          </div>
          <div class="flex-1 min-w-0">
            <Link
              :href="`/visitor/properties/${property.id}`"
              class="font-karla text-sm font-medium text-gray-900 hover:text-primary"
            >
              {{ property.address }}
            </Link>
            <p class="font-karla text-xs text-gray-500 mt-1">
              Status:
              <span class="font-medium">{{ property.feedbackStatus || 'Pending' }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </VisitorSidebarLayout>
</template>
