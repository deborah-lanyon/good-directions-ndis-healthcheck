<template>
  <AdminSidebarLayout page-title="Dashboard" page-subtitle="Platform overview">
    <!-- Platform Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      <div class="bg-white rounded-xl p-5">
        <h3 class="font-karla text-xs text-gray-500 uppercase tracking-wide">Territories</h3>
        <p class="font-karla font-bold text-3xl text-gray-800 mt-2">{{ stats.totalTerritories }}</p>
      </div>

      <div class="bg-white rounded-xl p-5">
        <h3 class="font-karla text-xs text-gray-500 uppercase tracking-wide">Campaigns</h3>
        <p class="font-karla font-bold text-3xl text-gray-800 mt-2">{{ stats.totalCampaigns }}</p>
        <p class="font-karla text-xs text-gray-400 mt-1">{{ stats.totalPosted }} posted</p>
      </div>

      <div class="bg-white rounded-xl p-5">
        <h3 class="font-karla text-xs text-gray-500 uppercase tracking-wide">Packs Sent</h3>
        <p class="font-karla font-bold text-3xl text-gray-800 mt-2">{{ stats.totalPacksSent }}</p>
      </div>

      <div class="bg-white rounded-xl p-5">
        <h3 class="font-karla text-xs text-gray-500 uppercase tracking-wide">Responses</h3>
        <p class="font-karla font-bold text-3xl text-gray-800 mt-2">{{ stats.totalResponses }}</p>
      </div>

      <div class="bg-white rounded-xl p-5">
        <h3 class="font-karla text-xs text-gray-500 uppercase tracking-wide">Conversion</h3>
        <p class="font-karla font-bold text-3xl text-gray-800 mt-2">{{ stats.overallConversion }}%</p>
      </div>
    </div>

    <!-- Territory Campaign Breakdown -->
    <div class="bg-white rounded-xl border border-gray-200">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="font-karla font-semibold text-lg text-gray-800">Campaigns by Territory</h3>
      </div>

      <div v-if="territories.length === 0" class="p-8 text-center">
        <p class="font-karla text-gray-500">No territories yet.</p>
      </div>

      <!-- Desktop Table -->
      <div v-else class="hidden md:block overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="text-left px-6 py-3 font-karla font-medium text-gray-600">Territory</th>
              <th class="text-right px-4 py-3 font-karla font-medium text-gray-600">Campaigns</th>
              <th class="text-right px-4 py-3 font-karla font-medium text-gray-600">Posted</th>
              <th class="text-right px-4 py-3 font-karla font-medium text-gray-600">Packs Sent</th>
              <th class="text-right px-4 py-3 font-karla font-medium text-gray-600">Responses</th>
              <th class="text-right px-6 py-3 font-karla font-medium text-gray-600">Conversion</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="territory in territories"
              :key="territory.id"
              class="border-b border-gray-100 hover:bg-gray-50"
            >
              <td class="px-6 py-3">
                <p class="font-caprasimo text-sm text-primary">{{ territory.name }}</p>
                <p v-if="territory.states.length" class="font-karla text-xs text-gray-400 mt-0.5">
                  {{ territory.states.join(', ') }}
                </p>
              </td>
              <td class="text-right px-4 py-3 font-karla text-gray-800">{{ territory.totalCampaigns }}</td>
              <td class="text-right px-4 py-3 font-karla text-gray-800">{{ territory.postedCampaigns }}</td>
              <td class="text-right px-4 py-3 font-karla text-gray-800">{{ territory.packsSent }}</td>
              <td class="text-right px-4 py-3">
                <span
                  class="font-karla"
                  :class="territory.responses > 0 ? 'text-green-600 font-medium' : 'text-gray-800'"
                >{{ territory.responses }}</span>
              </td>
              <td class="text-right px-6 py-3 font-karla text-gray-800">{{ territory.conversionRate }}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards -->
      <div v-if="territories.length > 0" class="md:hidden divide-y divide-gray-100">
        <div v-for="territory in territories" :key="territory.id" class="p-4">
          <p class="font-caprasimo text-sm text-primary">{{ territory.name }}</p>
          <p v-if="territory.states.length" class="font-karla text-xs text-gray-400 mt-0.5">
            {{ territory.states.join(', ') }}
          </p>
          <div class="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
            <div class="font-karla text-xs text-gray-500">Campaigns</div>
            <div class="font-karla text-xs text-gray-800 text-right">{{ territory.totalCampaigns }}</div>
            <div class="font-karla text-xs text-gray-500">Posted</div>
            <div class="font-karla text-xs text-gray-800 text-right">{{ territory.postedCampaigns }}</div>
            <div class="font-karla text-xs text-gray-500">Packs Sent</div>
            <div class="font-karla text-xs text-gray-800 text-right">{{ territory.packsSent }}</div>
            <div class="font-karla text-xs text-gray-500">Responses</div>
            <div class="font-karla text-xs text-right" :class="territory.responses > 0 ? 'text-green-600 font-medium' : 'text-gray-800'">{{ territory.responses }}</div>
            <div class="font-karla text-xs text-gray-500">Conversion</div>
            <div class="font-karla text-xs text-gray-800 text-right">{{ territory.conversionRate }}%</div>
          </div>
        </div>
      </div>
    </div>
  </AdminSidebarLayout>
</template>

<script setup lang="ts">
import AdminSidebarLayout from '~/app/components/layouts/admin-sidebar-layout.vue'

interface Territory {
  id: number
  name: string
  states: string[]
  totalCampaigns: number
  postedCampaigns: number
  packsSent: number
  responses: number
  conversionRate: string
}

interface Stats {
  totalTerritories: number
  totalCampaigns: number
  totalPosted: number
  totalPacksSent: number
  totalResponses: number
  overallConversion: string
}

withDefaults(
  defineProps<{
    stats?: Stats
    territories?: Territory[]
  }>(),
  {
    stats: () => ({
      totalTerritories: 0,
      totalCampaigns: 0,
      totalPosted: 0,
      totalPacksSent: 0,
      totalResponses: 0,
      overallConversion: '0.0',
    }),
    territories: () => [],
  }
)
</script>
