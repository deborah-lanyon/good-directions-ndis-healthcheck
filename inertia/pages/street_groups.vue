<template>
  <SidebarLayout pageTitle="Street Groups" pageSubtitle="Manage your street groups, assign visitors, and organise your outreach">
    <!-- Create Button -->
    <div class="mb-6">
      <Button @click="showCreateDialog = true" class="bg-tertiary hover:bg-[#e55d4d]">
        + Create Street Group
      </Button>
    </div>

    <!-- Street Groups List -->
    <div v-if="streetGroups.length === 0" class="text-center py-12">
      <p class="text-gray-500 text-lg">
        No street groups yet. Create your first one to get started!
      </p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="group in streetGroups"
        :key="group.id"
        class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-xl font-bold text-gray-900">{{ group.name }}</h3>
            <p
              v-if="group.streetAssignments && group.streetAssignments.length > 0"
              class="text-sm text-gray-500"
            >
              {{ group.streetAssignments.length }} street{{
                group.streetAssignments.length === 1 ? '' : 's'
              }}
            </p>
          </div>
          <div class="flex gap-2">
            <button
              @click="editGroup(group)"
              class="text-gray-400 hover:text-tertiary"
              title="Edit group"
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
              @click="deleteGroup(group)"
              class="text-gray-400 hover:text-red-600"
              title="Delete group"
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
        </div>

        <div v-if="group.description" class="mb-4">
          <p class="text-gray-600 text-sm">{{ group.description }}</p>
        </div>

        <!-- Show visitor names instead of just count -->
        <div v-if="group.visitors && group.visitors.length > 0" class="mb-4">
          <p class="text-sm font-semibold text-gray-700 mb-2">Visitors:</p>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="visitor in group.visitors.slice(0, 3)"
              :key="visitor.id"
              class="inline-block px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded"
            >
              {{ visitor.name }}
            </span>
            <span
              v-if="group.visitors.length > 3"
              class="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
            >
              +{{ group.visitors.length - 3 }} more
            </span>
          </div>
        </div>
        <div v-else class="mb-4">
          <p class="text-sm text-gray-400 italic">No visitors assigned</p>
        </div>

        <div v-if="group.streetAssignments && group.streetAssignments.length > 0" class="mb-4">
          <p class="text-sm font-semibold text-gray-700 mb-2">Streets:</p>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="assignment in group.streetAssignments"
              :key="assignment.id"
              class="inline-block px-2 py-0.5 text-xs rounded"
              :class="isAddedToday(assignment.createdAt)
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-gray-100 text-gray-700'"
              :title="isAddedToday(assignment.createdAt) ? 'Added today' : ''"
            >
              {{ assignment.streetName }}
              <span v-if="isAddedToday(assignment.createdAt)" class="ml-1 text-green-600">●</span>
            </span>
          </div>
        </div>

        <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span
            >{{ group.visitors?.length || 0 }} visitor{{
              group.visitors?.length === 1 ? '' : 's'
            }}</span
          >
          <span
            >{{ group.streetAssignments?.length || 0 }} street{{
              group.streetAssignments?.length === 1 ? '' : 's'
            }}</span
          >
        </div>

        <!-- Removed "Manage Visitors" button, kept only Plan Route -->
        <div class="pt-4 border-t">
          <Button
            @click="planRoute(group)"
            class="w-full bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
            variant="outline"
          >
            Plan Route
          </Button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Dialog with Tabs -->
    <Dialog :open="showCreateDialog || !!selectedGroup">
      <DialogContent
        class="max-w-5xl"
        @interact-outside="closeDialog"
        @escape-key-down="closeDialog"
      >
        <DialogHeader>
          <DialogTitle class="text-2xl">
            {{ selectedGroup ? 'Edit Street Group' : 'Create Street Group' }}
          </DialogTitle>
        </DialogHeader>

        <form @submit.prevent="saveGroup" class="h-[750px] flex flex-col">
          <!-- Group Name and Description (always visible) -->
          <div class="space-y-4 mb-6 flex-shrink-0">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Group Name *</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., North Side Group"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                v-model="form.description"
                rows="2"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of this street group..."
              />
            </div>
          </div>

          <Tabs v-model="activeTab" class="w-full flex-1 flex flex-col">
            <TabsList
              class="grid w-full grid-cols-2 mb-6 flex-shrink-0 bg-blue-50 rounded-lg overflow-hidden p-0 gap-0 h-auto"
            >
              <TabsTrigger
                value="streets"
                class="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=inactive]:text-gray-700 data-[state=inactive]:hover:bg-blue-100 transition-all pt-3 pb-4 px-4 m-0 rounded-none"
              >
                <svg
                  class="w-5 h-5 inline-block mr-2"
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
                Streets
              </TabsTrigger>
              <TabsTrigger
                value="visitors"
                class="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=inactive]:text-gray-700 data-[state=inactive]:hover:bg-blue-100 transition-all pt-3 pb-4 px-4 m-0 rounded-none"
              >
                <svg
                  class="w-5 h-5 inline-block mr-2"
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
                Visitors
              </TabsTrigger>
            </TabsList>

            <!-- Tab 1: Visitors -->
            <TabsContent value="visitors" class="space-y-4 flex-1" @click="showDropdown = false">
              <div>
                <h4 class="text-lg font-semibold text-gray-900 mb-2 text-center">
                  Assign Team Members as Visitors
                </h4>
                <p class="text-sm text-gray-600 mb-6 text-center">
                  Select visitors who will cover this street group
                </p>

                <div v-if="allVisitors && allVisitors.length > 0" class="grid grid-cols-2 gap-4">
                  <!-- Multi-select dropdown (left side) -->
                  <div class="relative" @click.stop>
                    <label class="block text-xs font-medium text-gray-600 mb-2"
                      >Select from All Visitors</label
                    >

                    <!-- Dropdown trigger button -->
                    <button
                      type="button"
                      @click="showDropdown = !showDropdown"
                      class="w-full px-3 py-2 text-left border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors flex items-center justify-between"
                    >
                      <span class="text-sm text-gray-700">
                        {{
                          showDropdown
                            ? 'Close visitor list'
                            : `${allVisitors.length} visitor${allVisitors.length === 1 ? '' : 's'} available`
                        }}
                      </span>
                      <svg
                        class="w-4 h-4 text-gray-500 transition-transform"
                        :class="{ 'rotate-180': showDropdown }"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    <!-- Dropdown content with checkboxes (absolute positioning) -->
                    <div
                      v-show="showDropdown"
                      class="absolute z-[100] w-full mt-2 border border-gray-300 rounded-lg bg-white shadow-lg"
                    >
                      <!-- Search filter inside dropdown -->
                      <div class="p-2 border-b border-gray-200">
                        <input
                          v-model="searchQuery"
                          type="text"
                          placeholder="Search visitors..."
                          class="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <!-- Visitor list with clickable items -->
                      <div class="max-h-[300px] overflow-y-auto">
                        <button
                          v-for="visitor in filteredVisitors"
                          :key="visitor.id"
                          type="button"
                          @click="toggleVisitor(visitor.id)"
                          class="w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                          :class="{ 'bg-blue-50': form.visitorIds.includes(visitor.id) }"
                        >
                          <div class="flex-1 min-w-0">
                            <div class="text-sm font-medium text-gray-900">{{ visitor.name }}</div>
                            <div v-if="visitor.email" class="text-xs text-gray-500 truncate">
                              {{ visitor.email }}
                            </div>
                          </div>
                          <svg
                            v-if="form.visitorIds.includes(visitor.id)"
                            class="w-5 h-5 text-blue-600 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clip-rule="evenodd"
                            />
                          </svg>
                        </button>

                        <div
                          v-if="filteredVisitors.length === 0"
                          class="px-3 py-6 text-sm text-gray-500 text-center"
                        >
                          No visitors match "{{ searchQuery }}"
                        </div>
                      </div>

                      <!-- Dropdown footer with action buttons -->
                      <div
                        class="p-2 border-t border-gray-200 bg-gray-50 flex items-center justify-between"
                      >
                        <button
                          type="button"
                          @click="selectAll"
                          class="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          @click="clearAll"
                          class="text-xs text-gray-600 hover:text-gray-700 font-medium"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Selected visitors as removable badges (right side) -->
                  <div class="min-h-[80px]">
                    <label class="block text-xs font-medium text-gray-600 mb-2"
                      >Selected Visitors ({{ selectedVisitorCount }})</label
                    >
                    <div v-if="selectedVisitorCount > 0" class="flex flex-wrap gap-2">
                      <span
                        v-for="visitor in props.allVisitors?.filter((v) =>
                          form.visitorIds.includes(v.id)
                        )"
                        :key="visitor.id"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {{ visitor.name }}
                        <button
                          @click="removeVisitor(visitor.id)"
                          type="button"
                          class="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                          title="Remove visitor"
                        >
                          <svg
                            class="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </span>
                    </div>
                    <p v-else class="text-sm text-gray-400 italic">No visitors selected</p>
                  </div>
                </div>

                <div
                  v-else
                  class="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
                >
                  <p class="text-gray-500 mb-2">No visitors created yet</p>
                  <p class="text-sm text-gray-400">Create visitors on the Visitors page first</p>
                </div>
              </div>
            </TabsContent>

            <!-- Tab 3: Streets -->
            <TabsContent
              value="streets"
              class="space-y-4 flex-1"
            >
              <h4 class="text-lg font-semibold text-gray-900 mb-2 text-center">
                Add Streets to this Street Group
              </h4>
              <p class="text-sm text-gray-600 mb-6 text-center">
                Type street name manually to add them to this group.
              </p>

              <!-- Open Map Button - temporarily hidden -->
              <!--
              <div class="mb-6">
                <Button
                  type="button"
                  @click="showMapOverlay = true"
                  variant="outline"
                  class="w-full bg-tertiary hover:bg-[#e55d4d] text-white hover:text-white border-tertiary"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  View Area Map
                </Button>
              </div>
              -->

              <div class="grid grid-cols-2 gap-4">
                <!-- Manual street entry (left side) -->
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-2">Add Street</label>
                  <div class="space-y-2">
                    <input
                      v-model="newStreetName"
                      type="text"
                      placeholder="e.g., Smith Street"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div class="flex gap-2 items-center">
                      <div class="flex-1">
                        <label class="block text-xs text-gray-500 mb-1">From number (optional)</label>
                        <input
                          v-model.number="newStreetNumberStart"
                          type="number"
                          placeholder="e.g., 1"
                          min="1"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div class="flex-1">
                        <label class="block text-xs text-gray-500 mb-1">To number (optional)</label>
                        <input
                          v-model.number="newStreetNumberEnd"
                          type="number"
                          placeholder="e.g., 500"
                          min="1"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div class="pt-5">
                        <Button
                          type="button"
                          @click="addStreet"
                          class="bg-tertiary hover:bg-[#e55d4d] text-white px-4"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                  <p class="text-xs text-gray-500 mt-2">
                    Enter the street name. Optionally specify a number range to match only part of a long street.
                  </p>
                </div>

                <!-- Selected streets (right side) -->
                <div class="min-h-[80px]">
                  <label class="block text-xs font-medium text-gray-600 mb-2"
                    >Selected Streets ({{ selectedStreets.length }})</label
                  >
                  <div v-if="selectedStreets.length > 0" class="flex flex-wrap gap-2">
                    <span
                      v-for="(street, index) in selectedStreets"
                      :key="index"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {{ formatStreetDisplay(street) }}
                      <button
                        @click="removeStreetByIndex(index)"
                        type="button"
                        class="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                        title="Remove street"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </span>
                  </div>
                  <p v-else class="text-sm text-gray-400 italic">No streets selected</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <!-- Action Buttons -->
          <div class="flex gap-3 pt-6 border-t mt-6">
            <Button
              type="submit"
              :disabled="isSaving"
              class="flex-1 bg-tertiary hover:bg-[#e55d4d] disabled:opacity-50 disabled:cursor-not-allowed"
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
              <span v-else>{{ selectedGroup ? 'Update Group' : 'Create Group' }}</span>
            </Button>
            <Button type="button" @click="closeDialog" variant="outline" class="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Full-Screen Map Overlay -->
    <div
      v-show="showMapOverlay"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
      style="background-color: rgba(0, 0, 0, 0.5)"
    >
      <div
        class="bg-white rounded-lg shadow-2xl w-full h-full max-w-7xl max-h-[90vh] flex flex-col pointer-events-auto"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b bg-gray-50 shrink-0">
          <div class="flex-1">
            <h3 class="text-xl font-semibold text-gray-900">Select Streets from Map</h3>
            <p class="text-sm text-gray-600 mt-1">
              Each red dot represents a new property. Click on the dot, which will now become blue,
              to select its street. This will be added to the street group and map routing.
            </p>
            <p class="text-sm text-gray-600 mt-1">
              Deselect the street by clicking on the blue dot.
            </p>
            <p class="text-sm text-gray-600 mt-1">Drag to pan, scroll to zoom.</p>
          </div>
          <div class="flex items-center gap-3 ml-4">
            <span v-if="selectedStreets.length > 0" class="text-sm font-medium text-gray-700">
              {{ selectedStreets.length }} selected
            </span>
            <button
              type="button"
              @click.stop="closeMapOverlay"
              @mousedown.stop
              class="px-4 py-2 bg-tertiary hover:bg-[#e55d4d] text-white rounded-lg text-sm font-medium transition-colors"
            >
              Done
            </button>
            <button
              type="button"
              @click.stop="closeMapOverlay"
              @mousedown.stop
              class="p-2 hover:bg-gray-200 rounded-lg"
              title="Close"
            >
              <svg
                class="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Map Container -->
        <div class="flex-1 relative overflow-hidden">
          <div ref="mapContainer" class="w-full h-full min-h-[400px]" />
        </div>

        <!-- Selected Streets Footer -->
        <div
          v-if="selectedStreets.length > 0"
          class="p-4 border-t bg-gray-50 max-h-32 overflow-y-auto"
        >
          <p class="text-xs font-semibold text-gray-700 mb-2">Selected Streets:</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(street, index) in selectedStreets"
              :key="index"
              class="inline-flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-xs rounded-md"
            >
              {{ formatStreetDisplay(street) }}
              <button
                @click.stop="removeStreetFromMap(street.streetName)"
                type="button"
                class="hover:bg-blue-600 rounded"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>

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
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { router } from '@inertiajs/vue3'
import axios from 'axios'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import SidebarLayout from '~/app/components/layouts/sidebar-layout.vue'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/app/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/app/components/ui/tabs'
import Toast from '~/app/components/shared/toast.vue'

interface StreetAssignment {
  id?: number
  streetName: string
  streetNumberStart?: number | null
  streetNumberEnd?: number | null
  createdAt?: string | null
}

interface Visitor {
  id: number
  name: string
  email?: string
}

interface Church {
  id: number
  churchName: string
  latitude: number | string | null
  longitude: number | string | null
  radius: number | null
}

interface StreetGroup {
  id: number
  name: string
  description: string | null
  streetAssignments?: StreetAssignment[]
  visitors?: Visitor[]
}

const props = defineProps<{
  streetGroups: StreetGroup[]
  allVisitors?: Visitor[]
  church: Church
}>()

const showCreateDialog = ref(false)
const selectedGroup = ref<StreetGroup | null>(null)
const activeTab = ref('streets')
const showMapOverlay = ref(false)
const mapInteractionEnabled = ref(false)
const isSaving = ref(false)
const toast = ref({ show: false, type: 'success' as 'success' | 'error', message: '' })

// Map-related state
const mapContainer = ref<HTMLElement | null>(null)
const map = ref<L.Map | null>(null)
const loadingStreets = ref(false)
const selectedStreets = ref<StreetAssignment[]>([])
const streetPolylines = ref<Map<string, L.Polyline>>(new Map())
const mapViewMode = ref<'radius' | 'postcode'>('postcode')
const postcodeBoundaries = ref<Map<string, L.Polygon>>(new Map())
const propertyMarkers = ref<Map<string, L.CircleMarker>>(new Map())

// Manual street entry
const newStreetName = ref('')
const newStreetNumberStart = ref<number | null>(null)
const newStreetNumberEnd = ref<number | null>(null)

const form = reactive({
  name: '',
  description: '',
  streetsText: '', // Keep for backwards compatibility
  visitorIds: [] as number[],
})

// Search filter for visitors
const searchQuery = ref('')
const showDropdown = ref(false)

// Filtered visitors based on search (for dropdown)
const filteredVisitors = computed(() => {
  if (!props.allVisitors) return []
  if (!searchQuery.value) return props.allVisitors

  const query = searchQuery.value.toLowerCase()
  return props.allVisitors.filter(
    (v) => v.name.toLowerCase().includes(query) || v.email?.toLowerCase().includes(query)
  )
})

// Computed property for selected visitor count
const selectedVisitorCount = computed(() => form.visitorIds.length)

// Map and street selection functions
async function initializeMap() {
  if (!mapContainer.value || !props.church.latitude || !props.church.longitude) {
    console.warn('Cannot initialize map: missing container or church location')
    return
  }

  // Convert lat/lng to numbers if they're strings
  const lat =
    typeof props.church.latitude === 'string'
      ? parseFloat(props.church.latitude)
      : props.church.latitude
  const lng =
    typeof props.church.longitude === 'string'
      ? parseFloat(props.church.longitude)
      : props.church.longitude

  if (isNaN(lat) || isNaN(lng)) {
    console.error('Invalid church coordinates')
    return
  }

  console.log('Initializing Leaflet map at:', lat, lng)

  // Initialize Leaflet map using same pattern as working church profile map
  map.value = L.map(mapContainer.value, {
    center: [lat, lng],
    zoom: 14,
  })

  console.log('Map created successfully')

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map.value)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map.value)

  // Add church marker
  L.marker([lat, lng], {
    icon: L.divIcon({
      className: 'church-marker',
      html: '<div style="background: #ff7262; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    }),
  })
    .addTo(map.value)
    .bindPopup(props.church.churchName)

  console.log('Map created, loading streets...')

  // Fetch and display streets
  await loadStreets()
}

async function loadStreets() {
  if (!map.value) return

  loadingStreets.value = true
  const startTime = Date.now()

  try {
    console.log(`Fetching streets from API (${mapViewMode.value} mode)...`)

    let response
    let streets = []
    let boundaries = []

    if (mapViewMode.value === 'radius') {
      // Radius-based view
      if (!props.church.id) return
      response = await axios.get(`/api/churches/${props.church.id}/streets`)
      streets = response.data.streets
    } else {
      // Postcode-based views (both streets and properties)
      if (!props.church.id) return
      response = await axios.get(`/api/churches/${props.church.id}/postcode-streets`)
      streets = response.data.streets
      boundaries = response.data.boundaries || []
      console.log(`Loaded ${boundaries.length} postcode boundaries`)
    }

    console.log(`Received ${streets.length} streets in ${Date.now() - startTime}ms`)

    // Clear existing polylines and boundaries
    streetPolylines.value.forEach((polyline) => map.value?.removeLayer(polyline))
    streetPolylines.value.clear()
    postcodeBoundaries.value.forEach((boundary) => map.value?.removeLayer(boundary))
    postcodeBoundaries.value.clear()
    propertyMarkers.value.forEach((marker) => map.value?.removeLayer(marker))
    propertyMarkers.value.clear()

    // Draw postcode boundaries if in postcode mode
    if (mapViewMode.value === 'postcode' && boundaries.length > 0) {
      boundaries.forEach((boundaryData: any) => {
        drawPostcodeBoundary(boundaryData)
      })
    }

    console.log('Drawing streets on map...')
    const renderStart = Date.now()

    if (mapViewMode.value === 'postcode') {
      // Postcode mode: show property markers (dots)
      streets.forEach((street: any) => {
        if (!street.geometry || street.geometry.length === 0) return

        street.geometry.forEach((point: any) => {
          const isSelected = isStreetSelected(street.name)

          const marker = L.circleMarker([point.lat, point.lon], {
            radius: isSelected ? 8 : 6,
            fillColor: isSelected ? '#3B82F6' : '#EF4444',
            color: isSelected ? '#2563EB' : '#DC2626',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8,
          }).addTo(map.value!)

          // Make marker clickable to select the street
          marker.on('click', () => {
            toggleStreetSelection(street.name, null, marker)
          })

          // Hover effect
          marker.on('mouseover', () => {
            if (!isStreetSelected(street.name)) {
              marker.setStyle({
                radius: 8,
                fillColor: '#F87171',
              })
            }
          })

          marker.on('mouseout', () => {
            if (!isStreetSelected(street.name)) {
              marker.setStyle({
                radius: 6,
                fillColor: '#EF4444',
              })
            }
          })

          // Tooltip with street name
          marker.bindTooltip(street.name, { sticky: true })

          // Store marker with unique key (street-lat-lon)
          const markerKey = `${street.name}-${point.lat}-${point.lon}`
          propertyMarkers.value.set(markerKey, marker)
        })
      })
    } else {
      // Radius mode or Postcode Streets mode: draw street lines
      streets.forEach((street: any) => {
        if (!street.geometry || street.geometry.length === 0) return

        const latlngs = street.geometry.map(
          (point: any) => [point.lat, point.lon] as [number, number]
        )

        const polyline = L.polyline(latlngs, {
          color: '#4B5563',
          weight: 4,
          opacity: 0.8,
        }).addTo(map.value!)

        // Make polyline clickable
        polyline.on('click', () => {
          toggleStreetSelection(street.name, polyline)
        })

        // Hover effect
        polyline.on('mouseover', () => {
          if (!isStreetSelected(street.name)) {
            polyline.setStyle({ color: '#9CA3AF', weight: 5 })
          }
        })

        polyline.on('mouseout', () => {
          if (!isStreetSelected(street.name)) {
            polyline.setStyle({ color: '#4B5563', weight: 4 })
          }
        })

        // Tooltip
        polyline.bindTooltip(street.name, { sticky: true })

        streetPolylines.value.set(street.name, polyline)
      })
    }

    console.log(
      `Loaded ${streets.length} streets on map in ${Date.now() - renderStart}ms (total: ${Date.now() - startTime}ms)`
    )
  } catch (error) {
    console.error('Failed to load streets:', error)
    if (error.response) {
      console.error('Error response:', error.response.data)
      console.error('Error status:', error.response.status)
    }
    alert('Failed to load streets from map. Please use manual entry below.')
  } finally {
    loadingStreets.value = false
  }
}

// Sanitize a number value - handles NaN, undefined, empty strings
function sanitizeNumber(value: number | null | undefined): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'number' && !isNaN(value)) return value
  return null
}

// Check if a street was added today
function isAddedToday(createdAt: string | null | undefined): boolean {
  if (!createdAt) return false
  const today = new Date()
  const createdDate = new Date(createdAt)
  return (
    createdDate.getDate() === today.getDate() &&
    createdDate.getMonth() === today.getMonth() &&
    createdDate.getFullYear() === today.getFullYear()
  )
}

// Format street display with optional number range
function formatStreetDisplay(street: StreetAssignment): string {
  if (street.streetNumberStart !== null && street.streetNumberEnd !== null) {
    return `${street.streetName} (${street.streetNumberStart}-${street.streetNumberEnd})`
  } else if (street.streetNumberStart !== null) {
    return `${street.streetName} (${street.streetNumberStart}+)`
  } else if (street.streetNumberEnd !== null) {
    return `${street.streetName} (up to ${street.streetNumberEnd})`
  }
  return street.streetName
}

// Remove street by index
function removeStreetByIndex(index: number) {
  selectedStreets.value.splice(index, 1)
}

// Check if a street name already exists in selectedStreets
function streetNameExists(streetName: string): boolean {
  return selectedStreets.value.some((s) => s.streetName === streetName)
}

// Add a manually typed street to the selection
function addStreet() {
  const trimmed = newStreetName.value.trim()
  if (!trimmed) return

  // Create the new street assignment (sanitize number values - v-model.number can produce NaN)
  const newAssignment: StreetAssignment = {
    streetName: trimmed,
    streetNumberStart: sanitizeNumber(newStreetNumberStart.value),
    streetNumberEnd: sanitizeNumber(newStreetNumberEnd.value),
  }

  // Check for duplicate (same street name with same range)
  const isDuplicate = selectedStreets.value.some(
    (s) =>
      s.streetName === newAssignment.streetName &&
      s.streetNumberStart === newAssignment.streetNumberStart &&
      s.streetNumberEnd === newAssignment.streetNumberEnd
  )

  if (!isDuplicate) {
    selectedStreets.value.push(newAssignment)
  }
  // Reset form fields
  newStreetName.value = ''
  newStreetNumberStart.value = null
  newStreetNumberEnd.value = null
}

// Helper to check if a street name is in the selected list
function isStreetSelected(streetName: string): boolean {
  return selectedStreets.value.some((s) => s.streetName === streetName)
}

// Helper to find index of a street by name (for map selections, which don't have ranges)
function findStreetIndex(streetName: string): number {
  return selectedStreets.value.findIndex((s) => s.streetName === streetName)
}

function toggleStreetSelection(
  streetName: string,
  polyline?: L.Polyline | null,
  marker?: L.CircleMarker | null
) {
  const index = findStreetIndex(streetName)

  if (index > -1) {
    // Deselect
    selectedStreets.value.splice(index, 1)

    // Update visual state
    if (polyline) {
      polyline.setStyle({
        color: '#4B5563',
        weight: 4,
      })
    }

    // Update all markers for this street
    if (mapViewMode.value === 'postcode') {
      propertyMarkers.value.forEach((m, key) => {
        if (key.startsWith(streetName + '-')) {
          m.setStyle({
            fillColor: '#EF4444',
            color: '#DC2626',
            radius: 6,
          })
        }
      })
    }

    console.log('Deselected street:', streetName, '| Total selected:', selectedStreets.value.length)
  } else {
    // Select - when adding from map, no number range is specified
    selectedStreets.value.push({ streetName, streetNumberStart: null, streetNumberEnd: null })

    // Update visual state
    if (polyline) {
      polyline.setStyle({
        color: '#3B82F6', // Blue
        weight: 5,
      })
    }

    // Update all markers for this street
    if (mapViewMode.value === 'postcode') {
      propertyMarkers.value.forEach((m, key) => {
        if (key.startsWith(streetName + '-')) {
          m.setStyle({
            fillColor: '#3B82F6',
            color: '#2563EB',
            radius: 8,
          })
        }
      })
    }

    console.log('Selected street:', streetName, '| Total selected:', selectedStreets.value.length)
  }
  console.log('Current selections:', selectedStreets.value)
}

function removeStreetFromMap(streetName: string) {
  const index = findStreetIndex(streetName)
  if (index > -1) {
    selectedStreets.value.splice(index, 1)

    // Update polyline appearance if in radius mode
    const polyline = streetPolylines.value.get(streetName)
    if (polyline) {
      polyline.setStyle({
        color: '#4B5563',
        weight: 4,
      })
    }

    // Update markers appearance if in postcode mode
    if (mapViewMode.value === 'postcode') {
      propertyMarkers.value.forEach((marker, key) => {
        if (key.startsWith(streetName + '-')) {
          marker.setStyle({
            fillColor: '#EF4444',
            color: '#DC2626',
            radius: 6,
          })
        }
      })
    }
  }
}

// Select all visitors
function selectAll() {
  if (!props.allVisitors) return
  form.visitorIds = filteredVisitors.value.map((v) => v.id)
}

// Clear all selections
function clearAll() {
  form.visitorIds = []
}

// Add visitor to selection (keep for backwards compatibility)
function addVisitor(visitorId: number) {
  if (!form.visitorIds.includes(visitorId)) {
    form.visitorIds.push(visitorId)
  }
}

// Toggle visitor selection (for dropdown clicks)
function toggleVisitor(visitorId: number) {
  const index = form.visitorIds.indexOf(visitorId)
  if (index > -1) {
    form.visitorIds.splice(index, 1)
  } else {
    form.visitorIds.push(visitorId)
  }
}

// Remove visitor from selection
function removeVisitor(visitorId: number) {
  const index = form.visitorIds.indexOf(visitorId)
  if (index > -1) {
    form.visitorIds.splice(index, 1)
  }
}

// Toggle street selection from dropdown
function toggleStreet(street: string) {
  const index = findStreetIndex(street)
  if (index > -1) {
    selectedStreets.value.splice(index, 1)
  } else {
    selectedStreets.value.push({ streetName: street, streetNumberStart: null, streetNumberEnd: null })
  }
}

function resetForm() {
  form.name = ''
  form.description = ''
  form.streetsText = ''
  form.visitorIds = []
  newStreetName.value = ''
  newStreetNumberStart.value = null
  newStreetNumberEnd.value = null
  selectedStreets.value = []
  searchQuery.value = ''
  showDropdown.value = false
  activeTab.value = 'streets'

  // Reset street polylines to default color
  streetPolylines.value.forEach((polyline) => {
    polyline.setStyle({ color: '#4B5563', weight: 4 })
  })
}

function closeDialog() {
  showCreateDialog.value = false
  selectedGroup.value = null
  resetForm()
}

function closeMapOverlay() {
  console.log('Closing map overlay')

  // Clean up map instance to avoid memory leaks and interaction issues
  if (map.value) {
    console.log('Removing map instance')
    map.value.remove()
    map.value = null
  }

  // Clear street polylines and boundaries
  streetPolylines.value.clear()
  postcodeBoundaries.value.clear()

  showMapOverlay.value = false
  mapInteractionEnabled.value = false
}

function drawPostcodeBoundary(boundaryData: any) {
  if (!map.value || !boundaryData.geojson) {
    console.log('Cannot draw boundary - no map or geojson:', {
      hasMap: !!map.value,
      hasGeojson: !!boundaryData.geojson,
    })
    return
  }

  try {
    const geojson = boundaryData.geojson
    console.log(
      'Drawing boundary for postcode:',
      boundaryData.postcode,
      'GeoJSON type:',
      geojson.type
    )
    let coordinates: [number, number][] = []

    // Handle different GeoJSON types
    if (geojson.type === 'Polygon') {
      coordinates = geojson.coordinates[0].map(
        (coord: number[]) => [coord[1], coord[0]] as [number, number]
      )
      console.log(`Polygon with ${coordinates.length} coordinates`)
      console.log(
        'First coordinate:',
        coordinates[0],
        'Last coordinate:',
        coordinates[coordinates.length - 1]
      )
      console.log('Raw GeoJSON coords:', geojson.coordinates[0].slice(0, 2))
    } else if (geojson.type === 'MultiPolygon') {
      // Use first polygon for simplicity
      coordinates = geojson.coordinates[0][0].map(
        (coord: number[]) => [coord[1], coord[0]] as [number, number]
      )
      console.log(`MultiPolygon - using first polygon with ${coordinates.length} coordinates`)
    } else {
      console.warn('Unknown GeoJSON type:', geojson.type)
    }

    if (coordinates.length > 0) {
      console.log('Creating polygon with', coordinates.length, 'points')
      const polygon = L.polygon(coordinates, {
        color: '#3B82F6',
        weight: 3,
        opacity: 0.9,
        fillColor: '#93C5FD',
        fillOpacity: 0.2,
      }).addTo(map.value!)

      polygon.bindTooltip(`Postcode: ${boundaryData.postcode}`, { permanent: false, sticky: true })

      postcodeBoundaries.value.set(boundaryData.postcode, polygon)
      console.log('Boundary added to map successfully')
    } else {
      console.warn('No coordinates to draw')
    }
  } catch (error) {
    console.error('Error drawing boundary for', boundaryData.postcode, error)
  }
}

function switchMapViewMode(mode: 'radius' | 'postcode') {
  mapViewMode.value = mode

  // Reload streets with new mode
  if (map.value) {
    loadStreets()
  }
}

function focusMap() {
  if (mapContainer.value) {
    mapContainer.value.focus()
  }
}

function enableMapInteraction() {
  mapInteractionEnabled.value = true
  if (mapContainer.value) {
    mapContainer.value.focus()
  }
  if (map.value) {
    map.value.scrollWheelZoom.enable()
  }
}

function editGroup(group: StreetGroup) {
  selectedGroup.value = group
  form.name = group.name
  form.description = group.description || ''
  form.visitorIds = group.visitors?.map((v) => v.id) || []

  // Clear previous selections
  selectedStreets.value = []
  newStreetName.value = ''

  // Load all existing streets into selectedStreets (preserving number ranges)
  if (group.streetAssignments && group.streetAssignments.length > 0) {
    selectedStreets.value = group.streetAssignments.map((assignment) => ({
      id: assignment.id,
      streetName: assignment.streetName,
      streetNumberStart: assignment.streetNumberStart ?? null,
      streetNumberEnd: assignment.streetNumberEnd ?? null,
    }))

    // Highlight streets that are on the map
    group.streetAssignments.forEach((assignment) => {
      const polyline = streetPolylines.value.get(assignment.streetName)
      if (polyline) {
        polyline.setStyle({ color: '#3B82F6', weight: 5 })
      }
    })
  }

  activeTab.value = 'streets'
}

async function deleteGroup(group: StreetGroup) {
  if (
    !confirm(
      `Are you sure you want to delete "${group.name}"? This will remove all street assignments and visitor assignments for this group.`
    )
  ) {
    return
  }

  try {
    await axios.delete(`/api/street-groups/${group.id}`)
    router.reload()
  } catch (error: any) {
    console.error('Failed to delete street group:', error)
    alert(error.response?.data?.message || 'Failed to delete street group. Please try again.')
  }
}

function showToast(type: 'success' | 'error', message: string) {
  toast.value = { show: true, type, message }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

async function saveGroup() {
  isSaving.value = true
  try {
    const groupData = {
      name: form.name,
      description: form.description || null,
    }

    // Use selected streets (from manual entry or map selection)
    const streets = selectedStreets.value

    console.log('Saving street group:')
    console.log('  Selected streets:', streets)

    let streetGroupId: number

    if (selectedGroup.value) {
      // Update existing group
      await axios.put(`/api/street-groups/${selectedGroup.value.id}`, groupData)
      streetGroupId = selectedGroup.value.id

      // Update visitor assignments
      await axios.put(`/api/street-groups/${streetGroupId}/visitors`, {
        visitorIds: form.visitorIds,
      })

      // Get existing street assignment IDs
      const existingIds = new Set(
        selectedGroup.value.streetAssignments?.map((a) => a.id).filter(Boolean) || []
      )
      const newIds = new Set(streets.map((s) => s.id).filter(Boolean))

      // Remove assignments that are no longer in the list
      for (const assignment of selectedGroup.value.streetAssignments || []) {
        if (assignment.id && !newIds.has(assignment.id)) {
          await axios.delete(`/api/street-assignments/${assignment.id}`)
        }
      }

      // Add or update streets
      for (const street of streets) {
        if (street.id && existingIds.has(street.id)) {
          // Update existing assignment (in case number ranges changed)
          await axios.put(`/api/street-assignments/${street.id}`, {
            streetName: street.streetName,
            streetNumberStart: sanitizeNumber(street.streetNumberStart),
            streetNumberEnd: sanitizeNumber(street.streetNumberEnd),
          })
        } else if (!street.id) {
          // Add new street
          await axios.post(`/api/street-groups/${streetGroupId}/streets`, {
            streetName: street.streetName,
            streetNumberStart: sanitizeNumber(street.streetNumberStart),
            streetNumberEnd: sanitizeNumber(street.streetNumberEnd),
          })
        }
      }
    } else {
      // Create new group
      const response = await axios.post('/api/street-groups', groupData)
      streetGroupId = response.data.id

      // Assign visitors to the new group
      if (form.visitorIds.length > 0) {
        await axios.put(`/api/street-groups/${streetGroupId}/visitors`, {
          visitorIds: form.visitorIds,
        })
      }

      // Add streets to the new group (with number ranges)
      for (const street of streets) {
        await axios.post(`/api/street-groups/${streetGroupId}/streets`, {
          streetName: street.streetName,
          streetNumberStart: sanitizeNumber(street.streetNumberStart),
          streetNumberEnd: sanitizeNumber(street.streetNumberEnd),
        })
      }
    }

    // Show success message
    const action = selectedGroup.value ? 'updated' : 'created'
    showToast('success', `Street Group ${action} successfully`)

    // Reload the page to show updated data
    router.reload()
    closeDialog()
  } catch (error: any) {
    console.error('Failed to save street group:', error)
    showToast(
      'error',
      error.response?.data?.message || 'Failed to save street group. Please try again.'
    )
  } finally {
    isSaving.value = false
  }
}

async function planRoute(group: StreetGroup) {
  try {
    console.log(
      'Planning route for street group:',
      group.id,
      'with',
      group.streetAssignments?.length,
      'streets'
    )
    const response = await axios.post('/api/routes/plan-street-group', {
      streetGroupId: group.id,
    })

    if (response.data?.route?.googleMapsUrl) {
      // Open route in new window (Google Maps URL)
      window.open(response.data.route.googleMapsUrl, '_blank')
    } else {
      alert('No route available. Make sure properties are assigned to this street group.')
    }
  } catch (error: any) {
    console.error('Failed to plan route:', error)
    console.error('Error response:', error.response?.data)
    const errorMessage = error.response?.data?.error || 'Failed to plan route. Please try again.'
    alert(errorMessage)
  }
}

// Watch for when Streets tab becomes active to initialize/refresh map
// Watch for when map overlay opens to initialize/refresh map
watch(showMapOverlay, async (isOpen) => {
  console.log('Map overlay:', isOpen ? 'opened' : 'closed')
  if (isOpen) {
    console.log('Map overlay opened')
    await nextTick()
    await nextTick() // Double nextTick to ensure DOM is ready

    // Always initialize map fresh (ensures all interactions work)
    if (mapContainer.value) {
      console.log('Initializing map')
      await initializeMap()
    }
  }
})

// Leaflet doesn't require onMounted initialization (no external scripts needed)
</script>

<style scoped>
/* Make Leaflet map draggable with grab cursor */
.leaflet-container {
  cursor: grab !important;
}
.leaflet-container.leaflet-drag-target {
  cursor: grabbing !important;
}
.leaflet-clickable {
  cursor: pointer !important;
}
</style>
