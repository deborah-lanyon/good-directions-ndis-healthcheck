<template>
  <SidebarLayout pageTitle="Team Management" pageSubtitle="Manage your visitors and street groups">
    <Tabs default-value="visitors" class="w-full">
      <TabsList class="mb-4 md:mb-5 p-1 bg-transparent gap-1 md:gap-2 flex-wrap">
        <TabsTrigger
          value="visitors"
          class="data-[state=active]:bg-tertiary data-[state=active]:text-white bg-white text-black hover:bg-tertiary hover:text-white transition-colors inline-flex items-center gap-x-1 md:gap-x-2 py-1.5 px-2 md:px-3 text-xs md:text-sm touch-manipulation"
        >
          <svg
            class="w-4 h-4 md:w-5 md:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <span>Visitors</span>
        </TabsTrigger>
        <TabsTrigger
          value="street-groups"
          class="data-[state=active]:bg-tertiary data-[state=active]:text-white bg-white text-black hover:bg-tertiary hover:text-white transition-colors inline-flex items-center gap-x-1 md:gap-x-2 py-1.5 px-2 md:px-3 text-xs md:text-sm touch-manipulation"
        >
          <svg
            class="w-4 h-4 md:w-5 md:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>Street Groups</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="street-groups" class="mt-4 md:mt-5">
        <StreetGroupsManagement
          :street-groups="streetGroups"
          :visitors="visitors"
          :church="church"
        />
      </TabsContent>

      <TabsContent value="visitors" class="mt-4 md:mt-5">
        <VisitorsManagement :visitors="visitors" :street-groups="streetGroups" />
      </TabsContent>
    </Tabs>
  </SidebarLayout>
</template>

<script setup lang="ts">
import SidebarLayout from '~/app/components/layouts/sidebar-layout.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/app/components/ui/tabs'
import StreetGroupsManagement from '~/app/components/team-management/street-groups-management.vue'
import VisitorsManagement from '~/app/components/team-management/visitors-management.vue'

defineProps<{
  streetGroups: any[]
  visitors: any[]
  church: any
}>()
</script>
