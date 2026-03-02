<template>
  <SidebarLayout pageTitle="Dashboard">
    <!-- Welcome Banner -->
    <div class="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-8 mb-8 text-white">
      <h2 class="font-caprasimo text-3xl mb-2">
        {{ churchName ? `Welcome back, ${churchName}` : 'Welcome back' }}
      </h2>
      <p class="font-karla text-white/80 text-lg">
        Here's an overview of your community outreach progress.
      </p>
    </div>

    <!-- Stats Cards Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      <!-- Properties Sold Card -->
      <div class="bg-white rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-karla text-sm text-gray-500">Properties Sold</h3>
          <div class="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          </div>
        </div>
        <p class="font-karla font-bold text-3xl text-gray-800">{{ stats.propertiesSold }}</p>
        <p class="font-karla text-xs text-gray-400 mt-1">Total sold</p>
      </div>

      <!-- Properties Rented Card -->
      <div class="bg-white rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-karla text-sm text-gray-500">Properties Rented</h3>
          <div class="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
            </svg>
          </div>
        </div>
        <p class="font-karla font-bold text-3xl text-gray-800">{{ stats.propertiesRented }}</p>
        <p class="font-karla text-xs text-gray-400 mt-1">Total rented</p>
      </div>

      <!-- Visited Properties Card -->
      <div class="bg-white rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-karla text-sm text-gray-500">Visited</h3>
          <div class="w-10 h-10 rounded-lg bg-[#4CAF50]/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[#4CAF50]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p class="font-karla font-bold text-3xl text-gray-800">{{ stats.visitedProperties }}</p>
        <p class="font-karla text-xs text-gray-400 mt-1">Completed visits</p>
      </div>

      <!-- Team Members Card -->
      <div class="bg-white rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-karla text-sm text-gray-500">Team Members</h3>
          <div class="w-10 h-10 rounded-lg bg-[#2196F3]/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[#2196F3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
        </div>
        <p class="font-karla font-bold text-3xl text-gray-800">{{ stats.teamMembers }}</p>
        <p class="font-karla text-xs text-gray-400 mt-1">Active deliveries</p>
      </div>

      <!-- Street Groups Card -->
      <div class="bg-white rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-karla text-sm text-gray-500">Street Groups</h3>
          <div class="w-10 h-10 rounded-lg bg-[#FF9800]/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[#FF9800]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
            </svg>
          </div>
        </div>
        <p class="font-karla font-bold text-3xl text-gray-800">{{ stats.streetGroups }}</p>
        <p class="font-karla text-xs text-gray-400 mt-1">Organised areas</p>
      </div>
    </div>

    <!-- Quick Actions Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Activity Card -->
      <div class="bg-white rounded-xl p-6">
        <h3 class="font-karla font-semibold text-lg text-gray-800 mb-4">Quick Actions</h3>
        <div class="space-y-3">
          <a
            href="/properties"
            class="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div class="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="font-karla font-medium text-gray-800">View Property Listings</p>
              <p class="font-karla text-sm text-gray-500">Manage and track property visits</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>

          <a
            href="/welcome-pack"
            class="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div class="w-10 h-10 rounded-lg bg-[#FF9800]/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[#FF9800]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="font-karla font-medium text-gray-800">Edit Welcome Pack</p>
              <p class="font-karla text-sm text-gray-500">Customise your welcome pack template</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
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
              <p class="font-karla font-medium text-gray-800">Invite Team Member</p>
              <p class="font-karla text-sm text-gray-500">Add deliveries to help with outreach</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>

      <!-- Getting Started Card -->
      <div class="bg-white rounded-xl p-6">
        <h3 class="font-karla font-semibold text-lg text-gray-800 mb-4">Getting Started</h3>
        <div class="space-y-4">
          <div class="flex items-start gap-4">
            <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span class="font-karla font-bold text-white text-sm">1</span>
            </div>
            <div>
              <p class="font-karla font-medium text-gray-800">Complete your territory profile</p>
              <p class="font-karla text-sm text-gray-500">Add your territory details, location, and contact information.</p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span class="font-karla font-bold text-white text-sm">2</span>
            </div>
            <div>
              <p class="font-karla font-medium text-gray-800">Add local amenities</p>
              <p class="font-karla text-sm text-gray-500">Include useful local services for your welcome packs.</p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span class="font-karla font-bold text-white text-sm">3</span>
            </div>
            <div>
              <p class="font-karla font-medium text-gray-800">Customise your welcome pack</p>
              <p class="font-karla text-sm text-gray-500">Design your welcome pack template for new residents.</p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span class="font-karla font-bold text-white text-sm">4</span>
            </div>
            <div>
              <p class="font-karla font-medium text-gray-800">Start visiting properties</p>
              <p class="font-karla text-sm text-gray-500">View new properties and begin your outreach.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </SidebarLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SidebarLayout from '~/app/components/layouts/sidebar-layout.vue'

interface HubProps {
  churchName?: string
  stats?: {
    propertiesSold: number
    propertiesRented: number
    visitedProperties: number
    teamMembers: number
    streetGroups: number
  }
}

const props = withDefaults(defineProps<HubProps>(), {
  churchName: '',
  stats: () => ({
    propertiesSold: 0,
    propertiesRented: 0,
    visitedProperties: 0,
    teamMembers: 0,
    streetGroups: 0,
  }),
})

const churchName = computed(() => props.churchName)
const stats = computed(() => props.stats)
</script>
