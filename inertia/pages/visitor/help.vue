<script setup lang="ts">
import VisitorSidebarLayout from '~/app/components/layouts/visitor-sidebar-layout.vue'

interface Visitor {
  id: number
  name: string
  church?: {
    id: number
    churchName: string
  }
}

defineProps<{
  visitor: Visitor
}>()
</script>

<template>
  <VisitorSidebarLayout pageTitle="How To Use" :pageSubtitle="visitor.church?.churchName || ''">
    <div class="max-w-4xl">
      <!-- Introduction -->
      <div class="bg-white rounded-xl p-6 mb-6">
        <h2 class="font-karla font-semibold text-xl text-gray-800 mb-4">Welcome to the Delivery Portal</h2>
        <p class="font-karla text-gray-600 leading-relaxed">
          This guide will help you understand how to use the visitor portal to manage your property visits
          and record your interactions with new community members.
        </p>
      </div>

      <!-- Getting Started -->
      <div class="bg-white rounded-xl p-6 mb-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <span class="font-karla font-bold text-primary">1</span>
          </div>
          <h3 class="font-karla font-semibold text-lg text-gray-800">View Your Assigned Properties</h3>
        </div>
        <p class="font-karla text-gray-600 mb-4">
          From the <strong>Dashboard</strong>, you can see an overview of your assigned properties including:
        </p>
        <ul class="list-disc list-inside space-y-2 font-karla text-gray-600 ml-4">
          <li>Total number of properties assigned to you</li>
          <li>How many properties you've already visited</li>
          <li>Properties still pending a visit</li>
          <li>Your street group assignments</li>
        </ul>
      </div>

      <!-- Viewing Properties -->
      <div class="bg-white rounded-xl p-6 mb-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <span class="font-karla font-bold text-primary">2</span>
          </div>
          <h3 class="font-karla font-semibold text-lg text-gray-800">Browse Your Properties</h3>
        </div>
        <p class="font-karla text-gray-600 mb-4">
          Click on <strong>My Properties</strong> in the sidebar to see all properties assigned to you.
          You can filter properties by:
        </p>
        <ul class="list-disc list-inside space-y-2 font-karla text-gray-600 ml-4">
          <li><strong>Not Visited</strong> - Properties you haven't visited yet</li>
          <li><strong>Visited</strong> - Properties where you made contact</li>
          <li><strong>Visited but not Home</strong> - Properties where no one was home</li>
        </ul>
        <p class="font-karla text-gray-600 mt-4">
          Use the search box to find specific addresses, streets, or postcodes.
        </p>
      </div>

      <!-- Updating Status -->
      <div class="bg-white rounded-xl p-6 mb-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <span class="font-karla font-bold text-primary">3</span>
          </div>
          <h3 class="font-karla font-semibold text-lg text-gray-800">Update Property Status</h3>
        </div>
        <p class="font-karla text-gray-600 mb-4">
          After visiting a property, click the <strong>Update Status</strong> button to record your visit:
        </p>
        <div class="space-y-4 ml-4">
          <div>
            <p class="font-karla font-medium text-gray-700 mb-2">Visit Status:</p>
            <ul class="list-disc list-inside space-y-1 font-karla text-gray-600 ml-4">
              <li><strong>Not Visited</strong> - You haven't visited yet</li>
              <li><strong>Visited</strong> - You visited and made contact</li>
              <li><strong>Visited but not Home</strong> - You visited but no one was home</li>
            </ul>
          </div>
          <div>
            <p class="font-karla font-medium text-gray-700 mb-2">Visit Outcome (when Visited):</p>
            <ul class="list-disc list-inside space-y-1 font-karla text-gray-600 ml-4">
              <li><strong>Welcomed</strong> - You had a welcoming conversation</li>
              <li><strong>Pack left</strong> - You left a welcome pack</li>
              <li><strong>Reschedule</strong> - They asked you to come back another time</li>
              <li><strong>Not Interested</strong> - They weren't interested</li>
            </ul>
          </div>
          <div>
            <p class="font-karla font-medium text-gray-700 mb-2">Additional fields:</p>
            <ul class="list-disc list-inside space-y-1 font-karla text-gray-600 ml-4">
              <li><strong>Date of Visit</strong> - When you visited the property</li>
              <li><strong>Visit Notes</strong> - Any additional notes about the visit</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Route Planning -->
      <div class="bg-white rounded-xl p-6 mb-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <span class="font-karla font-bold text-primary">4</span>
          </div>
          <h3 class="font-karla font-semibold text-lg text-gray-800">Plan Your Route</h3>
        </div>
        <p class="font-karla text-gray-600 mb-4">
          Use the <strong>Plan Route for Unvisited Properties</strong> button at the bottom of the
          properties page to create an optimized route for your visits. This will:
        </p>
        <ul class="list-disc list-inside space-y-2 font-karla text-gray-600 ml-4">
          <li>Calculate the most efficient order to visit properties</li>
          <li>Show you the total distance and estimated time</li>
          <li>Provide a link to open the route in Google Maps</li>
          <li>Allow you to print a route sheet for offline reference</li>
        </ul>
      </div>

      <!-- Tips -->
      <div class="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-white">
        <h3 class="font-karla font-semibold text-lg mb-4">Tips for Successful Visits</h3>
        <ul class="list-disc list-inside space-y-2 font-karla text-white/90">
          <li>Visit during appropriate hours (typically 10am - 6pm)</li>
          <li>Bring welcome packs with you</li>
          <li>Be friendly and introduce yourself and your organisation</li>
          <li>Don't worry if no one is home - you can always try again</li>
          <li>Update the property status as soon as possible after each visit</li>
          <li>Add notes to help remember important details about each visit</li>
        </ul>
      </div>
    </div>
  </VisitorSidebarLayout>
</template>
