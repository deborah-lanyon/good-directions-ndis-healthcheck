<template>
  <SidebarLayout pageTitle="Dashboard">
    <!-- Welcome Banner -->
    <div class="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-8 mb-8 text-white">
      <h2 class="font-caprasimo text-3xl mb-2">
        {{ churchName ? `Welcome back, ${churchName}` : 'Welcome back' }}
      </h2>
      <p class="font-karla text-white/80 text-lg">
        Here's an overview of your mail campaigns.
      </p>
    </div>

    <!-- Campaign Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-karla text-sm text-gray-500">Campaigns</h3>
          <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
        </div>
        <p class="font-karla font-bold text-3xl text-gray-800">{{ stats.totalCampaigns }}</p>
        <p class="font-karla text-xs text-gray-400 mt-1">{{ stats.postedCampaigns }} posted</p>
      </div>

      <div class="bg-white rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-karla text-sm text-gray-500">Packs Sent</h3>
          <div class="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </div>
        </div>
        <p class="font-karla font-bold text-3xl text-gray-800">{{ stats.totalPacksSent }}</p>
        <p class="font-karla text-xs text-gray-400 mt-1">Total mailed</p>
      </div>

      <div class="bg-white rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-karla text-sm text-gray-500">Responses</h3>
          <div class="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
        </div>
        <p class="font-karla font-bold text-3xl text-gray-800">{{ stats.totalResponses }}</p>
        <p class="font-karla text-xs text-gray-400 mt-1">Total respondents</p>
      </div>

      <div class="bg-white rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-karla text-sm text-gray-500">Conversion</h3>
          <div class="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
          </div>
        </div>
        <p class="font-karla font-bold text-3xl text-gray-800">{{ stats.conversionRate }}%</p>
        <p class="font-karla text-xs text-gray-400 mt-1">Response rate</p>
      </div>
    </div>

    <!-- Recent Campaigns -->
    <div class="bg-white rounded-xl p-6 mb-8">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-karla font-semibold text-lg text-gray-800">Recent Campaigns</h3>
        <a href="/campaigns" class="font-karla text-sm text-primary hover:underline">View all</a>
      </div>

      <div v-if="campaigns.length === 0" class="text-center py-8">
        <p class="font-karla text-gray-500 mb-3">No campaigns yet.</p>
        <a href="/campaigns" class="font-karla text-sm text-primary hover:underline">Create your first campaign</a>
      </div>

      <div v-else class="space-y-3">
        <a
          v-for="campaign in campaigns"
          :key="campaign.id"
          href="/campaigns"
          class="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div class="min-w-0 flex-1">
            <p class="font-caprasimo text-sm text-primary truncate">{{ campaign.name }}</p>
            <div class="flex items-center gap-2 mt-1">
              <span
                v-for="pc in campaign.postcodes.slice(0, 3)"
                :key="pc"
                class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-gray-200 text-gray-600"
              >{{ pc }}</span>
              <span v-if="campaign.postcodes.length > 3" class="text-[10px] text-gray-400">
                +{{ campaign.postcodes.length - 3 }} more
              </span>
            </div>
          </div>
          <div class="flex items-center gap-4 ml-4 flex-shrink-0">
            <div class="text-right">
              <p class="font-karla text-sm font-medium text-gray-800">{{ campaign.propertyCount }}</p>
              <p class="font-karla text-[10px] text-gray-400">properties</p>
            </div>
            <div class="text-right">
              <p class="font-karla text-sm font-medium" :class="campaign.responseCount > 0 ? 'text-green-600' : 'text-gray-800'">
                {{ campaign.responseCount }}
              </p>
              <p class="font-karla text-[10px] text-gray-400">responses</p>
            </div>
            <span
              v-if="campaign.postedAt"
              class="px-2 py-0.5 text-[10px] font-medium rounded-full bg-green-100 text-green-700"
            >Posted</span>
            <span
              v-else-if="campaign.syncStatus === 'completed'"
              class="px-2 py-0.5 text-[10px] font-medium rounded-full bg-yellow-100 text-yellow-700"
            >Ready</span>
            <span
              v-else-if="campaign.syncStatus === 'pending'"
              class="px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 text-gray-600"
            >Pending</span>
            <span
              v-else-if="campaign.syncStatus === 'syncing'"
              class="px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-100 text-blue-700"
            >Syncing</span>
          </div>
        </a>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white rounded-xl p-6">
      <h3 class="font-karla font-semibold text-lg text-gray-800 mb-4">Quick Actions</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <a
          href="/campaigns"
          class="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <div class="flex-1">
            <p class="font-karla font-medium text-gray-800">Mail Campaigns</p>
            <p class="font-karla text-sm text-gray-500">Create and manage campaigns</p>
          </div>
        </a>

        <a
          href="/territory-detail"
          class="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div class="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
            </svg>
          </div>
          <div class="flex-1">
            <p class="font-karla font-medium text-gray-800">Territory Detail</p>
            <p class="font-karla text-sm text-gray-500">View territory information</p>
          </div>
        </a>

        <a
          href="/team-management"
          class="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div class="w-10 h-10 rounded-lg bg-[#4CAF50]/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[#4CAF50]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
          </div>
          <div class="flex-1">
            <p class="font-karla font-medium text-gray-800">Team Management</p>
            <p class="font-karla text-sm text-gray-500">Manage your team members</p>
          </div>
        </a>
      </div>
    </div>
  </SidebarLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SidebarLayout from '~/app/components/layouts/sidebar-layout.vue'

interface Campaign {
  id: number
  name: string
  postcodes: string[]
  propertyCount: number
  responseCount: number
  syncStatus: string | null
  postedAt: string | null
  createdAt: string | null
}

interface DashboardProps {
  churchName?: string
  stats?: {
    totalCampaigns: number
    postedCampaigns: number
    totalPacksSent: number
    totalResponses: number
    conversionRate: string
  }
  campaigns?: Campaign[]
}

const props = withDefaults(defineProps<DashboardProps>(), {
  churchName: '',
  stats: () => ({
    totalCampaigns: 0,
    postedCampaigns: 0,
    totalPacksSent: 0,
    totalResponses: 0,
    conversionRate: '0.0',
  }),
  campaigns: () => [],
})

const churchName = computed(() => props.churchName)
const stats = computed(() => props.stats)
const campaigns = computed(() => props.campaigns)
</script>
