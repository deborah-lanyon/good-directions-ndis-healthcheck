<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h3 class="text-2xl font-semibold text-gray-900">Street Groups Management</h3>
          <p class="text-sm text-gray-600 mt-1">
            Manage your street groups, assign deliveries, and organize your outreach by postcode
          </p>
        </div>
        <button
          @click="showCreateDialog = true"
          class="inline-flex items-center rounded-md bg-primary hover:bg-primary/90 px-4 py-2 text-sm font-semibold text-white shadow-sm"
        >
          <span class="mr-2">+</span>
          Create Street Group
        </button>
      </div>

      <!-- Street Groups List -->
      <div v-if="streetGroups.length === 0" class="text-center py-12">
        <p class="text-gray-500 text-lg">
          No street groups yet. Use the full manager to create your first one!
        </p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="group in streetGroups"
          :key="group.id"
          class="bg-white rounded-lg p-6 border border-gray-200"
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
          </div>

          <div v-if="group.description" class="mb-4">
            <p class="text-gray-600 text-sm">{{ group.description }}</p>
          </div>

          <!-- Show visitor names -->
          <div v-if="group.visitors && group.visitors.length > 0" class="mb-4">
            <p class="text-sm font-semibold text-gray-700 mb-2">👥 Visitors:</p>
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
            <p class="text-sm font-semibold text-gray-700 mb-2">📍 Streets:</p>
            <div class="space-y-1">
              <p
                v-for="assignment in group.streetAssignments"
                :key="assignment.id"
                class="text-sm text-gray-600"
              >
                {{ assignment.streetName }}
              </p>
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

          <div class="flex gap-2">
            <button
              @click="editGroup(group)"
              class="flex-1 mt-2 inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Group
            </button>
            <button
              @click="planRoute(group.id)"
              :disabled="routeLoading === group.id"
              class="flex-1 mt-2 inline-flex items-center justify-center rounded-md bg-green-600 hover:bg-green-700 px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                v-if="routeLoading !== group.id"
                class="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              <svg
                v-else
                class="animate-spin h-4 w-4 mr-2"
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
              {{ routeLoading === group.id ? 'Loading...' : 'Plan Route' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Dialog with Tabs -->
    <Dialog :open="showCreateDialog" @update:open="(open) => !open && closeDialog()">
      <DialogContent
        class="max-w-5xl"
        @interact-outside="(e) => e.preventDefault()"
        @escape-key-down="(e) => e.preventDefault()"
      >
        <DialogHeader>
          <DialogTitle class="text-2xl">{{
            editingGroupId ? 'Edit Street Group' : 'Create Street Group'
          }}</DialogTitle>
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
                  Assign Visitors
                </h4>
                <p class="text-sm text-gray-600 mb-6 text-center">
                  Select visitors who will cover this street group
                </p>

                <div v-if="visitors && visitors.length > 0" class="grid grid-cols-2 gap-4">
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
                            : `${visitors.length} visitor${visitors.length === 1 ? '' : 's'} available`
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
                          placeholder="🔍 Search visitors..."
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
                        v-for="visitor in visitors.filter((v) => form.visitorIds.includes(v.id))"
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
                  <p class="text-sm text-gray-400">Create visitors on the Visitors tab first</p>
                </div>
              </div>
            </TabsContent>

            <!-- Tab 2: Streets -->
            <TabsContent
              value="streets"
              class="space-y-4 flex-1"
              @click="showPropertyStreets = false"
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
                  @click="openMapOverlay"
                  variant="outline"
                  class="w-full bg-tertiary hover:bg-[#e59a00] text-white hover:text-white border-tertiary"
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
                <!-- Select from Database Dropdown (left side) -->
                <div class="relative" @click.stop>
                  <label class="block text-xs font-medium text-gray-600 mb-2"
                    >Select from All Streets</label
                  >

                  <!-- Dropdown trigger button -->
                  <button
                    type="button"
                    @click="togglePropertyStreetsDropdown"
                    class="w-full px-3 py-2 text-left border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors flex items-center justify-between"
                  >
                    <span class="text-sm text-gray-700">
                      {{
                        showPropertyStreets
                          ? 'Close street list'
                          : loadingPropertyStreets
                            ? 'Loading streets...'
                            : `${propertyStreets.length} Streets with new properties`
                      }}
                    </span>
                    <svg
                      class="w-4 h-4 text-gray-500 transition-transform"
                      :class="{ 'rotate-180': showPropertyStreets }"
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

                  <!-- Dropdown content -->
                  <div
                    v-show="showPropertyStreets"
                    class="absolute z-[100] w-full mt-2 border border-gray-300 rounded-lg bg-white shadow-lg"
                  >
                    <!-- Loading state -->
                    <div v-if="loadingPropertyStreets" class="p-6 text-center">
                      <p class="text-sm text-gray-500">Loading streets...</p>
                    </div>

                    <!-- Street list -->
                    <div
                      v-else-if="propertyStreets.length > 0"
                      class="max-h-[300px] overflow-y-auto"
                    >
                      <button
                        v-for="street in propertyStreets"
                        :key="street"
                        type="button"
                        @click="toggleStreet(street)"
                        class="w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                        :class="{ 'bg-blue-50': selectedStreets.includes(street) }"
                      >
                        <div class="flex-1 min-w-0">
                          <div class="text-sm font-medium text-gray-900">{{ street }}</div>
                        </div>
                        <svg
                          v-if="selectedStreets.includes(street)"
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
                    </div>

                    <!-- Footer with selected count -->
                    <div
                      v-if="propertyStreets.length > 0"
                      class="p-2 border-t border-gray-200 bg-gray-50"
                    >
                      <p class="text-xs text-gray-600 text-center">
                        {{ selectedStreets.length }} of {{ propertyStreets.length }} selected
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Selected streets (right side) -->
                <div class="min-h-[80px]">
                  <label class="block text-xs font-medium text-gray-600 mb-2"
                    >Selected Streets ({{ selectedStreets.length }})</label
                  >
                  <div v-if="selectedStreets.length > 0" class="flex flex-wrap gap-2">
                    <span
                      v-for="street in selectedStreets"
                      :key="street"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {{ street }}
                      <button
                        @click="removeStreetFromMap(street)"
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
              class="flex-1 bg-tertiary hover:bg-[#e59a00] disabled:opacity-50 disabled:cursor-not-allowed"
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
                {{ editingGroupId ? 'Updating...' : 'Creating...' }}
              </span>
              <span v-else>{{ editingGroupId ? 'Update Group' : 'Create Group' }}</span>
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
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
            >
              Done
            </button>
            <button
              type="button"
              @click.stop="closeMapOverlay"
              @mousedown.stop
              class="p-2 hover:bg-gray-200 rounded-md"
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
              v-for="street in selectedStreets"
              :key="street"
              class="inline-flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-xs rounded-md"
            >
              {{ street }}
              <button
                @click.stop="removeStreetFromMap(street)"
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

    <!-- Route Modal -->
    <Dialog
      :open="showRouteModal"
      @update:open="
        (open) => {
          if (!open) {
            closeRouteModal()
          }
        }
      "
    >
      <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div v-if="routeResult" class="bg-white rounded-lg">
          <!-- Header -->
          <div
            class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-lg"
          >
            <h2 class="text-2xl font-bold text-primary">Route Summary</h2>
          </div>

          <!-- Content -->
          <div class="p-6">
            <!-- Starting Point -->
            <div class="mb-6 p-4 bg-blue-50 rounded-lg">
              <div class="flex items-start gap-3">
                <div
                  class="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold"
                >
                  S
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">Starting Point</h3>
                  <p class="text-gray-700">{{ routeResult.churchName }}</p>
                  <p class="text-sm text-gray-500">{{ routeResult.churchAddress }}</p>
                </div>
              </div>
            </div>

            <!-- Route Stats -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div class="bg-gray-50 p-4 rounded-lg text-center">
                <div class="text-3xl font-bold text-primary">
                  {{ routeResult.waypoints.length }}
                </div>
                <div class="text-sm text-gray-600 mt-1">Stops</div>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg text-center">
                <div class="text-3xl font-bold text-primary">
                  {{ routeResult.totalDistance.toFixed(1) }} km
                </div>
                <div class="text-sm text-gray-600 mt-1">Total Distance</div>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg text-center">
                <div class="text-3xl font-bold text-primary">
                  ~{{ routeResult.totalDuration }} mins
                </div>
                <div class="text-sm text-gray-600 mt-1">Estimated Time</div>
              </div>
            </div>

            <!-- Stop Order -->
            <div class="mb-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Stop Order (Optimized)</h3>
              <div class="space-y-3">
                <div
                  v-for="(waypoint, index) in routeResult.waypoints"
                  :key="waypoint.propertyId"
                  class="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div
                    class="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm"
                  >
                    {{ index + 1 }}
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-gray-900">{{ waypoint.address }}</p>
                    <p class="text-sm text-gray-500 mt-1">
                      {{ waypoint.distanceFromPrevious?.toFixed(1) }} km • ~{{
                        waypoint.durationFromPrevious
                      }}
                      mins from previous stop
                    </p>
                  </div>
                  <div
                    v-if="index < routeResult.waypoints.length - 1"
                    class="flex-shrink-0 text-gray-400"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3">
              <a
                :href="routeResult.googleMapsUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                Open in Google Maps
              </a>
              <button
                @click="printRouteSheet"
                class="flex-1 px-6 py-3 bg-white border-2 border-primary text-primary rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Print Route Sheet
              </button>
            </div>
          </div>
        </div>
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
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { router } from '@inertiajs/vue3'
import axios from 'axios'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/app/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/app/components/ui/tabs'
import Toast from '~/app/components/shared/toast.vue'

interface StreetAssignment {
  id: number
  streetName: string
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
  visitors: Visitor[]
  church?: Church
}>()

const showCreateDialog = ref(false)
const editingGroupId = ref<number | null>(null)
const activeTab = ref('streets')
const showMapOverlay = ref(false)
const isSaving = ref(false)
const toast = ref({ show: false, type: 'success' as 'success' | 'error', message: '' })
const routeLoading = ref<number | null>(null)
const showRouteModal = ref(false)
const routeResult = ref<any>(null)

// Map-related state
const mapContainer = ref<HTMLElement | null>(null)
const map = ref<L.Map | null>(null)
const selectedStreets = ref<string[]>([])
const propertyMarkers = ref<Map<string, L.CircleMarker>>(new Map())

// Property streets from database
const propertyStreets = ref<string[]>([])
const loadingPropertyStreets = ref(false)
const showPropertyStreets = ref(false)

const form = reactive({
  name: '',
  description: '',
  visitorIds: [] as number[],
})

// Search filter for visitors
const searchQuery = ref('')
const showDropdown = ref(false)

// Filtered visitors based on search (for dropdown)
const filteredVisitors = computed(() => {
  if (!props.visitors) return []
  if (!searchQuery.value) return props.visitors

  const query = searchQuery.value.toLowerCase()
  return props.visitors.filter(
    (v) => v.name.toLowerCase().includes(query) || v.email?.toLowerCase().includes(query)
  )
})

// Computed property for selected visitor count
const selectedVisitorCount = computed(() => form.visitorIds.length)

// Map and street selection functions
async function initializeMap() {
  if (!mapContainer.value || !props.church?.latitude || !props.church?.longitude) {
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

  // Initialize Leaflet map
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

  // Add church marker
  L.marker([lat, lng], {
    icon: L.divIcon({
      className: 'church-marker',
      html: '<div style="background: #FDAF18; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
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
  if (!map.value || !props.church?.id) return

  try {
    console.log('Fetching streets from API...')

    const response = await axios.get(`/api/churches/${props.church.id}/postcode-streets`)
    const streets = response.data.streets

    console.log(`Received ${streets.length} streets`)

    // Clear existing markers
    propertyMarkers.value.forEach((marker) => map.value?.removeLayer(marker))
    propertyMarkers.value.clear()

    // Draw property markers (dots)
    streets.forEach((street: any) => {
      if (!street.geometry || street.geometry.length === 0) return

      street.geometry.forEach((point: any) => {
        const isSelected = selectedStreets.value.includes(street.name)

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
          toggleStreetSelection(street.name, marker)
        })

        // Hover effect
        marker.on('mouseover', () => {
          if (!selectedStreets.value.includes(street.name)) {
            marker.setStyle({
              radius: 8,
              fillColor: '#F87171',
            })
          }
        })

        marker.on('mouseout', () => {
          if (!selectedStreets.value.includes(street.name)) {
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

    console.log(`Loaded ${streets.length} streets on map`)
  } catch (error) {
    console.error('Failed to load streets:', error)
    alert('Failed to load streets from map. Please use manual entry below.')
  }
}

async function loadPropertyStreets() {
  if (!props.church?.id) return

  loadingPropertyStreets.value = true
  try {
    const response = await axios.get(`/api/churches/${props.church.id}/property-streets`)
    propertyStreets.value = response.data.streets || []
    console.log(`Loaded ${propertyStreets.value.length} property streets from database`)
  } catch (error) {
    console.error('Failed to load property streets:', error)
    alert('Failed to load street names from database.')
  } finally {
    loadingPropertyStreets.value = false
  }
}

function togglePropertyStreetsDropdown() {
  if (propertyStreets.value.length === 0 && !loadingPropertyStreets.value) {
    loadPropertyStreets()
  }
  showPropertyStreets.value = !showPropertyStreets.value
}

function toggleStreetSelection(streetName: string, marker?: L.CircleMarker | null) {
  const index = selectedStreets.value.indexOf(streetName)

  if (index > -1) {
    // Deselect
    selectedStreets.value.splice(index, 1)

    // Update all markers for this street
    propertyMarkers.value.forEach((m, key) => {
      if (key.startsWith(streetName + '-')) {
        m.setStyle({
          fillColor: '#EF4444',
          color: '#DC2626',
          radius: 6,
        })
      }
    })

    console.log('Deselected street:', streetName)
  } else {
    // Select
    selectedStreets.value.push(streetName)

    // Update all markers for this street
    propertyMarkers.value.forEach((m, key) => {
      if (key.startsWith(streetName + '-')) {
        m.setStyle({
          fillColor: '#3B82F6',
          color: '#2563EB',
          radius: 8,
        })
      }
    })

    console.log('Selected street:', streetName)
  }
}

function removeStreetFromMap(streetName: string) {
  const index = selectedStreets.value.indexOf(streetName)
  if (index > -1) {
    selectedStreets.value.splice(index, 1)

    // Update markers appearance
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

// Select all visitors
function selectAll() {
  if (!props.visitors) return
  form.visitorIds = filteredVisitors.value.map((v) => v.id)
}

// Clear all selections
function clearAll() {
  form.visitorIds = []
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
  const index = selectedStreets.value.indexOf(street)
  if (index > -1) {
    selectedStreets.value.splice(index, 1)
  } else {
    selectedStreets.value.push(street)
  }
}

function resetForm() {
  form.name = ''
  form.description = ''
  form.visitorIds = []
  selectedStreets.value = []
  searchQuery.value = ''
  showDropdown.value = false
  activeTab.value = 'streets'
  editingGroupId.value = null
}

function editGroup(group: StreetGroup) {
  editingGroupId.value = group.id
  form.name = group.name
  form.description = group.description || ''
  form.visitorIds = group.visitors?.map((v) => v.id) || []
  selectedStreets.value = group.streetAssignments?.map((s) => s.streetName) || []
  showCreateDialog.value = true
}

function closeDialog() {
  showCreateDialog.value = false
  resetForm()
}

function openMapOverlay() {
  showMapOverlay.value = true
}

function closeMapOverlay() {
  console.log('Closing map overlay')

  // Clean up map instance to avoid memory leaks and interaction issues
  if (map.value) {
    console.log('Removing map instance')
    map.value.remove()
    map.value = null
  }

  // Clear property markers
  propertyMarkers.value.clear()

  showMapOverlay.value = false
}

async function saveGroup() {
  isSaving.value = true
  try {
    const groupData = {
      name: form.name,
      description: form.description || null,
    }

    const streets = [...new Set(selectedStreets.value)] // Remove duplicates

    console.log('Saving street group:')
    console.log('  Selected streets:', streets)
    console.log('  Selected visitors:', form.visitorIds)

    let streetGroupId: number

    if (editingGroupId.value) {
      // Update existing group
      await axios.put(`/api/street-groups/${editingGroupId.value}`, groupData)
      streetGroupId = editingGroupId.value

      // Update visitors
      await axios.put(`/api/street-groups/${streetGroupId}/visitors`, {
        visitorIds: form.visitorIds,
      })

      // Delete all existing streets and re-add them
      const existingGroup = props.streetGroups.find((g) => g.id === streetGroupId)
      if (existingGroup?.streetAssignments) {
        for (const assignment of existingGroup.streetAssignments) {
          await axios.delete(`/api/street-assignments/${assignment.id}`)
        }
      }

      // Add updated streets
      for (const street of streets) {
        await axios.post(`/api/street-groups/${streetGroupId}/streets`, { streetName: street })
      }

      showToast('success', 'Street Group updated successfully')
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

      // Add streets to the new group
      for (const street of streets) {
        await axios.post(`/api/street-groups/${streetGroupId}/streets`, { streetName: street })
      }

      showToast('success', 'Street Group created successfully')
    }

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

async function planRoute(streetGroupId: number) {
  routeLoading.value = streetGroupId

  try {
    const csrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1]

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }

    if (csrfToken) {
      headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken)
    }

    const response = await fetch('/api/routes/plan-street-group', {
      method: 'POST',
      headers,
      credentials: 'same-origin',
      body: JSON.stringify({
        streetGroupId,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to plan route' }))
      throw new Error(errorData.error || 'Failed to plan route')
    }

    const data = await response.json()
    routeResult.value = data.route
    showRouteModal.value = true
  } catch (error) {
    console.error('Error planning route:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to plan route'
    showToast('error', errorMessage)
  } finally {
    routeLoading.value = null
  }
}

function closeRouteModal() {
  showRouteModal.value = false
  routeResult.value = null
}

function printRouteSheet() {
  window.print()
}

function getUniqueStreetCount(waypoints: any[]): number {
  if (!waypoints || waypoints.length === 0) return 0

  // Extract unique street names
  const streets = new Set()
  waypoints.forEach((waypoint) => {
    if (waypoint.streetName) {
      streets.add(waypoint.streetName)
    }
  })

  return streets.size
}

function showToast(type: 'success' | 'error', message: string) {
  toast.value = { show: true, type, message }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

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

// Removed unused watcher for showRouteMap (not defined in this component)
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
