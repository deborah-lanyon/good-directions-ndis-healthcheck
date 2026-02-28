<template>
  <AdminSidebarLayout page-title="All Church Profiles">
      <div class="flex justify-end items-center gap-3 mb-6">
        <button
          @click="showCreateChurchDialog = true"
          class="px-4 py-2 bg-tertiary hover:bg-[#e55d4d] text-white font-medium rounded-lg transition-colors"
        >
          + Create Church
        </button>
        <DemoModeToggle />
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <Card>
          <CardContent class="pt-4 md:pt-6 pb-4 md:pb-6">
            <div class="text-center">
              <div class="text-2xl md:text-3xl font-bold text-gray-900">{{ churches.length }}</div>
              <div class="text-xs md:text-sm text-gray-600 mt-1">Total Churches</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="pt-4 md:pt-6 pb-4 md:pb-6">
            <div class="text-center">
              <div class="text-2xl md:text-3xl font-bold text-green-600">{{ stats.approved }}</div>
              <div class="text-xs md:text-sm text-gray-600 mt-1">Approved</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="pt-4 md:pt-6 pb-4 md:pb-6">
            <div class="text-center">
              <div class="text-2xl md:text-3xl font-bold text-yellow-600">{{ stats.pending }}</div>
              <div class="text-xs md:text-sm text-gray-600 mt-1">Pending</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="pt-4 md:pt-6 pb-4 md:pb-6">
            <div class="text-center">
              <div class="text-2xl md:text-3xl font-bold text-red-600">{{ stats.rejected }}</div>
              <div class="text-xs md:text-sm text-gray-600 mt-1">Rejected</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- View Toggle Buttons -->
      <div class="mb-6 flex items-center gap-2 md:gap-3">
        <button
          @click="viewMode = 'list'"
          :class="[
            'flex-1 py-2 px-3 md:px-4 rounded-lg text-sm md:text-base font-medium transition-colors',
            viewMode === 'list'
              ? 'bg-tertiary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          ]"
        >
          List View
        </button>
        <button
          @click="viewMode = 'map'"
          :class="[
            'flex-1 py-2 px-3 md:px-4 rounded-lg text-sm md:text-base font-medium transition-colors',
            viewMode === 'map'
              ? 'bg-tertiary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          ]"
        >
          Map View
        </button>
      </div>

      <!-- Search and Filter Bar (only show in list view) -->
      <div v-if="viewMode === 'list'" class="mb-6 flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by church name, suburb, or email..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div class="sm:w-64">
          <Select v-model="statusFilter">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="sm:w-48">
          <Select v-model="sortBy">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="date">Sort by Date</SelectItem>
              <SelectItem value="suburb">Sort by Suburb</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- Map View -->
      <div v-if="viewMode === 'map'" class="mb-6">
        <MapView :churches="churches" mapHeight="600px" />
        <div class="mt-4 p-4 bg-white rounded-lg border border-gray-200">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Legend</h4>
          <div class="flex flex-wrap gap-4 text-sm">
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded-full bg-green-600"></div>
              <span>Approved</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded-full bg-yellow-600"></div>
              <span>Pending</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded-full bg-red-600"></div>
              <span>Rejected</span>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-if="viewMode === 'list'">
        <!-- Bulk Actions Bar -->
        <div
          v-if="selectedChurches.length > 0"
          class="mb-4 p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div class="text-sm font-medium text-blue-900">
              {{ selectedChurches.length }} church(es) selected
            </div>
            <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                @click="bulkApprove"
                class="flex-1 sm:flex-none px-3 py-2 text-xs md:text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors touch-manipulation"
              >
                Approve
              </button>
              <button
                @click="bulkReject"
                class="flex-1 sm:flex-none px-3 py-2 text-xs md:text-sm bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors touch-manipulation"
              >
                Reject
              </button>
              <button
                @click="emailSelected"
                class="flex-1 sm:flex-none px-3 py-2 text-xs md:text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors touch-manipulation"
              >
                Email
              </button>
              <button
                @click="selectedChurches = []"
                class="flex-1 sm:flex-none px-3 py-2 text-xs md:text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors touch-manipulation"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <div
          class="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
        >
          <div class="text-xs md:text-sm text-gray-600">
            Showing {{ filteredChurches.length }} of {{ churches.length }} church(es)
          </div>
          <button
            v-if="filteredChurches.length > 0"
            @click="toggleSelectAll"
            class="text-xs md:text-sm text-blue-600 hover:text-blue-700 font-medium touch-manipulation"
          >
            {{
              selectedChurches.length === filteredChurches.length ? 'Deselect All' : 'Select All'
            }}
          </button>
        </div>

        <!-- Churches List -->
        <div v-if="filteredChurches.length === 0" class="text-center py-12">
          <p class="text-gray-600">No churches found matching your criteria.</p>
        </div>

        <div v-else class="space-y-3">
          <Card
            v-for="church in filteredChurches"
            :key="church.id"
            class="hover:shadow-md transition-shadow border border-gray-200"
          >
            <CardHeader class="p-4">
              <div class="flex items-start gap-3">
                <input
                  type="checkbox"
                  :checked="selectedChurches.includes(church.id)"
                  @change="toggleChurchSelection(church.id)"
                  class="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer flex-shrink-0"
                />

                <!-- Church Logo Thumbnail -->
                <div
                  v-if="church.logoUrl || church.bannerUrl"
                  class="hidden sm:block flex-shrink-0"
                >
                  <img
                    :src="(church.logoUrl || church.bannerUrl)!"
                    :alt="church.churchName"
                    class="w-10 h-10 object-cover rounded border border-gray-200 bg-white"
                  />
                </div>
                <div
                  v-else
                  class="hidden sm:flex flex-shrink-0 w-10 h-10 rounded border border-gray-200 bg-gray-50 items-center justify-center"
                >
                  <svg
                    class="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    ></path>
                  </svg>
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2 mb-2">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 flex-wrap mb-1">
                        <CardTitle class="text-lg font-semibold leading-tight">{{
                          church.churchName
                        }}</CardTitle>
                        <span
                          v-if="church.user"
                          :class="[
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                            church.user.adminApprovalStatus === 'approved'
                              ? 'bg-green-100 text-green-700'
                              : church.user.adminApprovalStatus === 'rejected'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700',
                          ]"
                        >
                          {{ church.user.adminApprovalStatus }}
                        </span>
                        <span
                          v-else
                          class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700"
                        >
                          Unassigned
                        </span>
                      </div>

                      <!-- Contact Email directly under church name -->
                      <div v-if="church.user" class="text-sm text-gray-600">
                        {{ church.user.email }}
                      </div>
                      <div v-else class="text-sm text-orange-600">No owner assigned</div>
                    </div>
                  </div>

                  <!-- Compact Summary Info -->
                  <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                    <span v-if="church.user" class="flex items-center gap-1.5">
                      <svg
                        class="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        ></path>
                      </svg>
                      <span class="truncate max-w-[200px]">{{
                        church.user.fullName || church.user.email
                      }}</span>
                    </span>
                    <span v-else class="flex items-center gap-1.5 text-orange-600">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        ></path>
                      </svg>
                      <span>No owner</span>
                    </span>
                    <!-- Location -->
                    <span
                      v-if="church.address || church.suburb || church.postcode"
                      class="flex items-center gap-1.5"
                    >
                      <svg
                        class="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        ></path>
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                      </svg>
                      <span>
                        <span v-if="church.address">{{ church.address }}</span
                        ><span v-if="church.address && (church.suburb || church.postcode)">, </span
                        ><span v-if="church.suburb">{{ church.suburb }}</span
                        ><span v-if="church.suburb && church.postcode">, </span
                        ><span v-if="church.postcode">{{ church.postcode }}</span>
                      </span>
                    </span>

                    <span v-if="church.url">
                      <a
                        :href="church.url"
                        target="_blank"
                        class="text-blue-600 hover:underline text-sm"
                        >View Website</a
                      >
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardFooter class="border-t bg-white pt-2.5 pb-2.5">
              <div class="flex flex-col sm:flex-row items-center justify-between gap-2 w-full">
                <div class="flex items-center justify-center gap-3 text-xs text-gray-500">
                  <span class="flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    {{ formatDate(church.createdAt) }}
                  </span>
                  <!-- Sync Status -->
                  <span
                    v-if="church.syncStatus === 'syncing'"
                    class="flex items-center gap-1 text-blue-600"
                    title="Sync in progress"
                  >
                    <svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Syncing
                  </span>
                  <span
                    v-else-if="church.syncStatus === 'failed'"
                    class="flex items-center gap-1 text-red-600"
                    :title="church.syncErrorMessage || 'Sync failed'"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Sync failed
                  </span>
                  <span
                    v-else-if="church.lastSyncAt"
                    class="flex items-center gap-1 text-green-600"
                    :title="'Last synced: ' + formatDateTime(church.lastSyncAt)"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    {{ formatRelativeTime(church.lastSyncAt) }}
                  </span>
                  <span
                    v-else
                    class="flex items-center gap-1 text-gray-400"
                    title="Never synced"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Never synced
                  </span>
                </div>
                <div class="flex items-center gap-1.5">
                  <button
                    v-if="church.user"
                    @click="performLoginAsUser(church.user.id)"
                    class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md transition-colors"
                    title="View as Church Admin"
                  >
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                    <span class="hidden md:inline">View as Church Admin</span>
                  </button>
                  <button
                    @click="openAssignDialog(church.id)"
                    class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-md transition-colors"
                    :title="church.user ? 'Reassign' : 'Assign to user'"
                  >
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                    <span class="hidden md:inline">Assign</span>
                  </button>
                  <a
                    v-if="church.user"
                    :href="`mailto:${church.user.email}`"
                    class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
                    title="Send email"
                  >
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span class="hidden md:inline">Email</span>
                  </a>
                  <button
                    @click="deleteChurch(church.id, church.churchName)"
                    class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-red-50 text-red-700 hover:bg-red-100 rounded-md transition-colors"
                    title="Delete church"
                  >
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    <span class="hidden md:inline">Delete</span>
                  </button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    <!-- Notification Modal -->
    <NotificationModal
      :show="notification.show"
      :type="notification.type"
      :title="notification.title"
      :message="notification.message"
      :show-cancel="notification.showCancel"
      :confirm-text="notification.confirmText"
      @close="notification.show = false"
      @confirm="notification.onConfirm"
      @cancel="notification.show = false"
    />

    <!-- Create Church Dialog -->
    <div
      v-if="showCreateChurchDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold text-gray-900">Create New Church Account</h3>
          <button
            @click="showCreateChurchDialog = false"
            class="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <p v-if="!newChurch.assignToSelf" class="text-sm text-gray-600 mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          This will create a church account with a temporary user. The account can be assigned to a
          new user at a later time.
        </p>

        <form @submit.prevent="createChurch" class="space-y-4">
          <div class="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <input
              id="assignToSelf"
              v-model="newChurch.assignToSelf"
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-tertiary focus:ring-tertiary"
            />
            <label for="assignToSelf" class="text-sm text-gray-700">
              Manage this church myself
              <span class="text-gray-500">(assign to my account instead of creating a temporary user)</span>
            </label>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Church Name *</label>
            <input
              v-model="newChurch.churchName"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="St. Mary's Church"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <input
              v-model="newChurch.address"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="123 Main Street"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Suburb *</label>
              <input
                v-model="newChurch.suburb"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Sydney"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Postcode *</label>
              <input
                v-model="newChurch.postcode"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="2000"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              v-model="newChurch.url"
              type="url"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com"
            />
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-tertiary hover:bg-[#e55d4d] text-white font-medium rounded-lg transition-colors"
            >
              Create Church
            </button>
            <button
              type="button"
              @click="showCreateChurchDialog = false"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Assign User Dialog -->
    <div
      v-if="showAssignUserDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold text-gray-900">Assign Church to User</h3>
          <button
            @click="showAssignUserDialog = false"
            class="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Select User</label>
            <select
              v-model="assignUserEmail"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :disabled="isLoadingUsers"
            >
              <option value="">
                {{ isLoadingUsers ? 'Loading users...' : 'Choose a user...' }}
              </option>
              <option v-for="user in availableUsers" :key="user.id" :value="user.email">
                {{ user.email }}{{ user.fullName ? ` (${user.fullName})` : '' }}
              </option>
            </select>
            <p class="text-xs text-gray-500 mt-1">Only approved users are shown</p>
          </div>

          <div class="flex gap-3 pt-4">
            <button
              @click="assignChurchToUser"
              :disabled="!assignUserEmail"
              class="flex-1 px-4 py-2 bg-tertiary hover:bg-[#e55d4d] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Assign Church
            </button>
            <button
              type="button"
              @click="showAssignUserDialog = false"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminSidebarLayout>
</template>

<script setup lang="ts">
import { onErrorCaptured, onMounted, onUnmounted, ref, computed, watch } from 'vue'
import AdminSidebarLayout from '~/app/components/layouts/admin-sidebar-layout.vue'
import DemoModeToggle from '~/app/components/shared/demo-mode-toggle.vue'
import NotificationModal from '~/app/components/shared/notification-modal.vue'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '~/app/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/app/components/ui/select'
import MapView from '~/app/components/admin/MapView.vue'

onErrorCaptured((err) => {
  console.error('Error in admin churches page:', err)
  return false
})

interface Church {
  id: number
  churchName: string
  address: string | null
  suburb: string | null
  postcode: string | null
  url: string
  latitude: number | null
  longitude: number | null
  radius: number | null
  logoUrl: string | null
  bannerUrl: string | null
  user: {
    id: number
    fullName: string | null
    email: string
    adminApprovalStatus: 'pending' | 'approved' | 'rejected'
  } | null
  propertyCount: number
  territoryCount: number
  hasWelcomePack: boolean
  createdAt: string
  updatedAt: string | null
  syncStatus: 'syncing' | 'completed' | 'failed' | null
  lastSyncAt: string | null
  syncErrorMessage: string | null
}

const props = defineProps<{
  churches: Church[]
}>()

// Reactive churches list (updated by sync status polling)
const churches = ref<Church[]>([...props.churches])

// Poll sync status while any church is syncing
let syncPollTimer: ReturnType<typeof setInterval> | null = null

const hasSyncingChurch = computed(() =>
  churches.value.some((c) => c.syncStatus === 'syncing')
)

const pollSyncStatus = async () => {
  try {
    const response = await fetch('/api/admin/churches/sync-status', {
      credentials: 'same-origin',
    })
    if (!response.ok) return
    const statuses: Array<{ id: number; syncStatus: string | null; lastSyncAt: string | null; syncErrorMessage: string | null }> = await response.json()
    for (const status of statuses) {
      const church = churches.value.find((c) => c.id === status.id)
      if (church) {
        church.syncStatus = status.syncStatus as Church['syncStatus']
        church.lastSyncAt = status.lastSyncAt
        church.syncErrorMessage = status.syncErrorMessage
      }
    }
  } catch {
    // Silently fail
  }
}

const startSyncPolling = () => {
  if (syncPollTimer) return
  syncPollTimer = setInterval(pollSyncStatus, 5000)
}

const stopSyncPolling = () => {
  if (syncPollTimer) {
    clearInterval(syncPollTimer)
    syncPollTimer = null
  }
}

onMounted(() => {
  if (hasSyncingChurch.value) {
    startSyncPolling()
  }
})

onUnmounted(() => {
  stopSyncPolling()
})

// Watch for changes - start/stop polling as needed
watch(hasSyncingChurch, (isSyncing) => {
  if (isSyncing) {
    startSyncPolling()
  } else {
    stopSyncPolling()
  }
})

// View toggle
const viewMode = ref<'list' | 'map'>('list')

// Card expansion state
const expandedCards = ref<number[]>([])

const toggleCardExpanded = (churchId: number) => {
  const index = expandedCards.value.indexOf(churchId)
  if (index > -1) {
    expandedCards.value.splice(index, 1)
  } else {
    expandedCards.value.push(churchId)
  }
}

// Bulk selection
const selectedChurches = ref<number[]>([])

// Create church dialog
const showCreateChurchDialog = ref(false)
const newChurch = ref({
  churchName: '',
  address: '',
  suburb: '',
  postcode: '',
  url: '',
  assignToSelf: false,
})

// Assign user dialog
const showAssignUserDialog = ref(false)
const assignChurchId = ref<number | null>(null)
const assignUserEmail = ref('')
const availableUsers = ref<Array<{ id: number; email: string; fullName: string | null }>>([])
const isLoadingUsers = ref(false)

// Notification modal
const notification = ref({
  show: false,
  type: 'info' as 'success' | 'error' | 'info',
  title: 'Notification',
  message: '',
  showCancel: false,
  confirmText: 'OK',
  onConfirm: () => {},
})

const showNotification = (
  type: 'success' | 'error' | 'info',
  title: string,
  message: string,
  onConfirm?: () => void
) => {
  notification.value = {
    show: true,
    type,
    title,
    message,
    showCancel: false,
    confirmText: 'OK',
    onConfirm: onConfirm || (() => {}),
  }
}

const showConfirmation = (
  title: string,
  message: string,
  onConfirm: () => void,
  confirmText: string = 'OK'
) => {
  notification.value = {
    show: true,
    type: 'info',
    title,
    message,
    showCancel: true,
    confirmText,
    onConfirm,
  }
}

const openAssignDialog = async (churchId: number) => {
  assignChurchId.value = churchId
  assignUserEmail.value = ''
  showAssignUserDialog.value = true

  // Load available users
  if (availableUsers.value.length === 0) {
    isLoadingUsers.value = true
    try {
      const response = await fetch('/api/admin/users/list')
      if (response.ok) {
        const data = await response.json()
        availableUsers.value = data.users
      }
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      isLoadingUsers.value = false
    }
  }
}

const assignChurchToUser = async () => {
  if (!assignChurchId.value || !assignUserEmail.value) {
    showNotification('error', 'Selection Required', 'Please select a user')
    return
  }

  try {
    // Get CSRF token from cookie
    const csrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1]

    const response = await fetch(`/api/admin/churches/${assignChurchId.value}/assign`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': decodeURIComponent(csrfToken || ''),
      },
      credentials: 'same-origin',
      body: JSON.stringify({ userEmail: assignUserEmail.value }),
    })

    if (response.ok) {
      showNotification('success', 'Success', 'Church assigned successfully!', () => {
        showAssignUserDialog.value = false
        window.location.reload()
      })
    } else {
      const data = await response.json()
      showNotification(
        'error',
        'Assignment Failed',
        `Failed to assign church: ${data.error || 'Unknown error'}`
      )
    }
  } catch (error) {
    console.error('Error assigning church:', error)
    showNotification('error', 'Error', 'An error occurred while assigning the church')
  }
}

const performLoginAsUser = async (userId: number) => {
  try {
    // Get CSRF token from cookie
    const csrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1]

    const response = await fetch(`/api/admin/impersonate/${userId}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'X-XSRF-TOKEN': csrfToken ? decodeURIComponent(csrfToken) : '',
      },
      credentials: 'same-origin',
    })

    if (response.ok || response.redirected) {
      window.location.href = '/dashboard'
    } else {
      const data = await response.json().catch(() => ({ error: 'Unknown error' }))
      showNotification(
        'error',
        'Login Failed',
        `Failed to login as user: ${data.error || 'Unknown error'}`
      )
    }
  } catch (error) {
    console.error('Error impersonating user:', error)
    showNotification('error', 'Error', 'An error occurred while trying to login as user')
  }
}

const toggleChurchSelection = (churchId: number) => {
  const index = selectedChurches.value.indexOf(churchId)
  if (index > -1) {
    selectedChurches.value.splice(index, 1)
  } else {
    selectedChurches.value.push(churchId)
  }
}

const toggleSelectAll = () => {
  if (selectedChurches.value.length === filteredChurches.value.length) {
    selectedChurches.value = []
  } else {
    selectedChurches.value = filteredChurches.value.map((c) => c.id)
  }
}

// Bulk actions
const bulkApprove = async () => {
  showConfirmation(
    'Approve Churches',
    `Are you sure you want to approve ${selectedChurches.value.length} church(es)?`,
    async () => {
      try {
        // Get CSRF token from cookie
        const csrfToken = document.cookie
          .split('; ')
          .find((row) => row.startsWith('XSRF-TOKEN='))
          ?.split('=')[1]

        const response = await fetch('/api/admin/churches/bulk-approve', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': decodeURIComponent(csrfToken || ''),
          },
          credentials: 'same-origin',
          body: JSON.stringify({ churchIds: selectedChurches.value }),
        })

        if (response.ok) {
          showNotification('success', 'Success', 'Churches approved successfully', () => {
            window.location.reload()
          })
        } else {
          showNotification('error', 'Approval Failed', 'Failed to approve churches')
        }
      } catch (error) {
        console.error('Error approving churches:', error)
        showNotification('error', 'Error', 'An error occurred')
      }
    }
  )
}

const bulkReject = async () => {
  showConfirmation(
    'Reject Churches',
    `Are you sure you want to reject ${selectedChurches.value.length} church(es)?`,
    async () => {
      try {
        // Get CSRF token from cookie
        const csrfToken = document.cookie
          .split('; ')
          .find((row) => row.startsWith('XSRF-TOKEN='))
          ?.split('=')[1]

        const response = await fetch('/api/admin/churches/bulk-reject', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': decodeURIComponent(csrfToken || ''),
          },
          credentials: 'same-origin',
          body: JSON.stringify({ churchIds: selectedChurches.value }),
        })

        if (response.ok) {
          showNotification('success', 'Success', 'Churches rejected successfully', () => {
            window.location.reload()
          })
        } else {
          showNotification('error', 'Rejection Failed', 'Failed to reject churches')
        }
      } catch (error) {
        console.error('Error rejecting churches:', error)
        showNotification('error', 'Error', 'An error occurred')
      }
    }
  )
}

const emailSelected = () => {
  const selectedChurchData = churches.value.filter(
    (c) => selectedChurches.value.includes(c.id) && c.user
  )
  const emails = selectedChurchData.map((c) => c.user!.email).join(',')
  window.location.href = `mailto:${emails}`
}

const deleteChurch = async (churchId: number, churchName: string) => {
  showConfirmation(
    'Delete Church Account',
    `You are about to delete the account for "${churchName}".\n\nThis will permanently delete:\n• The church profile\n• All associated properties\n• All territories\n• All visitors\n• The user account\n\nThis action cannot be undone. Are you sure you want to proceed?`,
    async () => {
      await performDeleteChurch(churchId)
    },
    'DELETE'
  )
}

const performDeleteChurch = async (churchId: number) => {
  try {
    // Get CSRF token from cookie
    const csrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1]

    const response = await fetch(`/api/admin/churches/${churchId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': csrfToken ? decodeURIComponent(csrfToken) : '',
      },
      credentials: 'same-origin',
    })

    if (response.ok) {
      showNotification('success', 'Success', 'Church account deleted successfully', () => {
        window.location.reload()
      })
    } else {
      const data = await response
        .json()
        .catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }))
      console.error('Delete church failed:', response.status, data)
      showNotification(
        'error',
        'Deletion Failed',
        `Failed to delete church: ${data.error || 'Unknown error'}`
      )
    }
  } catch (error) {
    console.error('Error deleting church:', error)
    showNotification(
      'error',
      'Error',
      `An error occurred while deleting the church: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

// Create church function
const createChurch = async () => {
  try {
    // Get CSRF token from cookie
    const csrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1]

    const response = await fetch('/api/admin/churches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': decodeURIComponent(csrfToken || ''),
      },
      credentials: 'same-origin',
      body: JSON.stringify(newChurch.value),
    })

    if (response.ok) {
      showNotification('success', 'Success', 'Church created successfully!', () => {
        showCreateChurchDialog.value = false
        // Reset form
        newChurch.value = {
          churchName: '',
          address: '',
          suburb: '',
          postcode: '',
          url: '',
          assignToSelf: false,
        }
        window.location.reload()
      })
    } else {
      const data = await response.json()
      showNotification(
        'error',
        'Creation Failed',
        `Failed to create church: ${data.error || 'Unknown error'}`
      )
    }
  } catch (error) {
    console.error('Error creating church:', error)
    showNotification('error', 'Error', 'An error occurred while creating the church')
  }
}

// Search and filter state
const searchQuery = ref('')
const statusFilter = ref('all')
const sortBy = ref('name')

// Statistics
const stats = computed(() => ({
  approved: churches.value.filter((c) => c.user?.adminApprovalStatus === 'approved').length,
  pending: churches.value.filter((c) => c.user?.adminApprovalStatus === 'pending').length,
  rejected: churches.value.filter((c) => c.user?.adminApprovalStatus === 'rejected').length,
}))

// Filtered and sorted churches
const filteredChurches = computed(() => {
  let result = [...churches.value]

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (church) =>
        church.churchName.toLowerCase().includes(query) ||
        church.suburb?.toLowerCase().includes(query) ||
        church.user?.email.toLowerCase().includes(query) ||
        church.address?.toLowerCase().includes(query)
    )
  }

  // Apply status filter
  if (statusFilter.value !== 'all') {
    if (statusFilter.value === 'unassigned') {
      // Filter for temporary users (emails ending in .temp)
      result = result.filter((church) => church.user?.email.endsWith('.temp'))
    } else {
      result = result.filter((church) => church.user?.adminApprovalStatus === statusFilter.value)
    }
  }

  // Apply sorting
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.churchName.localeCompare(b.churchName)
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'suburb':
        return (a.suburb || '').localeCompare(b.suburb || '')
      default:
        return 0
    }
  })

  return result
})

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch (e) {
    console.error('Error formatting date:', e)
    return dateString
  }
}

const formatDateTime = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (e) {
    return dateString
  }
}

const formatRelativeTime = (dateString: string) => {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(dateString)
  } catch (e) {
    return dateString
  }
}
</script>
