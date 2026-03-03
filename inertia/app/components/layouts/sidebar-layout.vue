<template>
  <div class="min-h-screen flex flex-col">
    <!-- Demo Mode Banner -->
    <DemoBanner />

    <!-- Super Admin Banner (only show when impersonating, not in demo mode) -->
    <div v-if="isImpersonating && !demoMode" class="bg-red-700 text-white py-3 border-b border-white/20 flex-shrink-0">
      <div class="container mx-auto px-4 flex justify-center items-center gap-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span class="font-karla text-sm font-semibold">VIEWING AS SUPERADMIN</span>
        <button
          @click="stopImpersonating"
          class="px-4 py-1.5 bg-white text-red-700 rounded-md text-sm font-bold hover:bg-red-50 transition-colors"
        >
          Return to Admin
        </button>
      </div>
    </div>

    <!-- Top Menu Bar -->
    <header class="h-[72px] bg-[#ece3f3] flex items-center justify-between px-4 flex-shrink-0">
      <!-- Left: Hamburger + Logo + Church Name -->
      <div class="flex items-center gap-3 ml-2 md:ml-4">
        <!-- Mobile hamburger -->
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="md:hidden p-2 -ml-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path v-if="!sidebarOpen" stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <a href="/" class="flex items-center">
          <img :src="logoDark" alt="Good Directions Logo" class="h-10 w-auto" />
        </a>
        <div v-if="churchName" class="hidden sm:flex items-center">
          <div class="w-px h-8 bg-gray-300 mr-4"></div>
          <span class="font-karla text-sm font-semibold text-gray-700">{{ churchName }}</span>
        </div>
      </div>

      <!-- Right: Icon Links and User -->
      <div class="flex items-center gap-1 md:gap-2 mr-2 md:mr-4">
        <!-- Desktop: Sync + View as Delivery (hidden on mobile, shown in submenu below) -->
        <div class="hidden md:flex items-center gap-2">
        <!-- Sync Status Indicator -->
        <div v-if="syncStatus === 'syncing'" class="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg">
          <svg class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="font-karla text-sm">Syncing properties...</span>
        </div>
        <div v-else-if="syncStatus === 'completed'" class="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg" :title="'Last synced: ' + formatLastSync()">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span class="font-karla text-sm">Synced</span>
        </div>
        <div v-else-if="syncStatus === 'failed'" class="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg cursor-pointer" @click="fetchStatus" :title="syncErrorMessage || 'Click to retry checking status'">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span class="font-karla text-sm">Sync failed</span>
          <span v-if="syncErrorMessage" class="font-karla text-xs text-red-500 hidden md:inline truncate max-w-[200px]">– {{ syncErrorMessage }}</span>
        </div>

        <!-- Divider -->
        <div class="w-px h-6 bg-gray-200 mx-2"></div>
        </div>

        <!-- User Dropdown -->
        <Menubar class="border-none bg-transparent p-0 h-auto shadow-none">
          <MenubarMenu>
            <MenubarTrigger
              class="font-karla transition-colors font-normal cursor-pointer px-0 py-0 h-auto bg-transparent border-none shadow-none hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent"
            >
              <div class="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </MenubarTrigger>
            <MenubarContent class="bg-white min-w-[200px]">
              <MenubarItem disabled class="text-gray-500 text-sm px-2 py-2">
                {{ userEmail }}
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem as-child>
                <button
                  @click="logout"
                  class="w-full text-left cursor-pointer text-gray-900 hover:bg-gray-100 focus:bg-gray-100 px-2 py-2 rounded"
                >
                  Logout
                </button>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
    </header>

    <!-- Mobile: Sync + View as Delivery submenu -->
    <div class="md:hidden bg-[#ece3f3] border-t border-gray-200/50 px-4 py-2 flex items-center justify-between flex-shrink-0">
      <!-- Sync Status -->
      <div v-if="syncStatus === 'syncing'" class="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
        <svg class="w-3.5 h-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="font-karla text-xs">Syncing...</span>
      </div>
      <div v-else-if="syncStatus === 'completed'" class="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 rounded-md" :title="'Last synced: ' + formatLastSync()">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span class="font-karla text-xs">Synced</span>
      </div>
      <div v-else-if="syncStatus === 'failed'" class="flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-700 rounded-md cursor-pointer" @click="fetchStatus" :title="syncErrorMessage || 'Click to retry'">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span class="font-karla text-xs">Sync failed</span>
      </div>
      <div v-else></div>

      <!-- View as Delivery -->
      <Menubar v-if="!shouldHideChurchSetup" class="border-none bg-transparent p-0 h-auto shadow-none">
        <MenubarMenu>
          <MenubarTrigger
            class="font-karla text-xs transition-colors font-medium cursor-pointer px-2 py-1 h-auto rounded-md bg-teal-50 text-teal-700 border-2 border-teal-500 hover:bg-teal-100 focus:bg-teal-100 data-[state=open]:bg-teal-100 shadow-none"
          >
            <div class="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View as Delivery
              <svg xmlns="http://www.w3.org/2000/svg" class="w-2.5 h-2.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </MenubarTrigger>
          <MenubarContent class="bg-white min-w-[200px]">
            <template v-if="visitors.length > 0">
              <MenubarItem disabled class="text-gray-400 text-xs px-2 py-1.5 uppercase tracking-wider">
                Switch to delivery
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem
                v-for="visitor in visitors"
                :key="visitor.id"
                as-child
              >
                <button
                  @click="switchToVisitor(visitor.id)"
                  class="w-full text-left cursor-pointer text-gray-900 hover:bg-teal-50 focus:bg-teal-50 px-2 py-2 rounded flex items-center gap-2"
                >
                  <div class="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-medium flex-shrink-0">
                    {{ visitor.name.charAt(0).toUpperCase() }}
                  </div>
                  <span class="text-sm truncate">{{ visitor.name }}</span>
                </button>
              </MenubarItem>
            </template>
            <template v-else>
              <MenubarItem disabled class="text-gray-500 text-sm px-2 py-2">
                No deliveries yet
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem as-child>
                <a href="/team-management" class="w-full text-left cursor-pointer text-teal-700 hover:bg-teal-50 focus:bg-teal-50 px-2 py-2 rounded text-sm">
                  Add deliveries in Team Management
                </a>
              </MenubarItem>
            </template>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>

    <!-- Main Layout (Sidebar + Content) -->
    <div class="flex flex-1 relative">
      <!-- Mobile sidebar backdrop -->
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 bg-black/50 z-30 md:hidden"
        @click="closeSidebar"
      ></div>

      <!-- Left Sidebar -->
      <aside
        :class="[
          'w-64 bg-primary flex-shrink-0 flex flex-col z-40',
          'fixed inset-y-0 left-0 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        ]"
      >
        <!-- Navigation Menu -->
        <nav class="flex-1 px-4 py-4 overflow-y-auto">
          <!-- Main Menu Items -->
          <div class="space-y-1">
            <a
              href="/dashboard"
              :class="[
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive('/dashboard') ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
              ]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              <span class="font-karla">Dashboard</span>
            </a>

            <a
              href="/campaigns"
              :class="[
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive('/campaigns') ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
              ]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <span class="font-karla">Mail Campaigns</span>
            </a>

            <a
              href="/records"
              :class="[
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive('/records') ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
              ]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M10.875 12c-.621 0-1.125.504-1.125 1.125M12 12c.621 0 1.125.504 1.125 1.125m0 0v1.5c0 .621-.504 1.125-1.125 1.125M12 15.75c0 .621-.504 1.125-1.125 1.125" />
              </svg>
              <span class="font-karla">All Records</span>
            </a>

          </div>

          <!-- Territory Setup Section (hidden for Super Admins in admin view - visible when impersonating) -->
          <div v-if="!shouldHideChurchSetup" class="mt-6 pt-6 border-t border-white/20">
            <p class="px-4 text-sm font-karla font-semibold text-white uppercase tracking-wider mb-2">
              Territory Setup
            </p>
            <div class="space-y-1">
              <a
                href="/territory-detail"
                :class="[
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive('/territory-detail') ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                ]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                </svg>
                <span class="font-karla">Territory Detail</span>
              </a>

              <a
                href="/welcome-pack/template"
                :class="[
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive('/welcome-pack') ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                ]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <span class="font-karla">Welcome Pack</span>
              </a>
            </div>
          </div>

          <!-- Team Section -->
          <div class="mt-6 pt-6 border-t border-white/20">
            <p class="px-4 text-sm font-karla font-semibold text-white uppercase tracking-wider mb-2">
              Team
            </p>
            <div class="space-y-1">
              <a
                href="/team-management"
                :class="[
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive('/team-management') ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                ]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                <span class="font-karla">Team Management</span>
              </a>
            </div>
          </div>

          <!-- Support Section -->
          <div class="mt-6 pt-6 border-t border-white/20">
            <p class="px-4 text-sm font-karla font-semibold text-white uppercase tracking-wider mb-2">
              Support
            </p>
            <div class="space-y-1">
              <a
                href="/how-to-use"
                :class="[
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive('/how-to-use') ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                ]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
                <span class="font-karla">How To Use</span>
              </a>

              <a
                href="/get-in-touch"
                :class="[
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive('/get-in-touch') ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                ]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <span class="font-karla">Get in Touch</span>
              </a>
            </div>
          </div>
        </nav>

        <!-- User Section at Bottom -->
        <div class="p-4 border-t border-white/10">
          <div class="flex items-center gap-3 px-4 py-2">
            <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-karla text-sm text-white truncate">{{ userName }}</p>
              <p class="font-karla text-xs text-white/50 truncate">{{ userEmail }}</p>
            </div>
            <button
              @click="logout"
              class="p-2 text-white/50 hover:text-white transition-colors"
              title="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 bg-gray-100 flex flex-col min-w-0">
        <!-- Page Header -->
        <header class="bg-white px-4 md:px-8 py-4 md:py-6 flex items-center justify-between border-b border-gray-200">
          <div class="min-w-0">
            <h1 class="font-caprasimo text-2xl md:text-4xl text-tertiary truncate">{{ pageTitle }}</h1>
            <p v-if="pageSubtitle" class="font-karla text-xs md:text-sm text-gray-500 mt-1">{{ pageSubtitle }}</p>
          </div>
          <div class="hidden md:flex items-center gap-4">
            <span class="font-karla text-sm text-gray-500">{{ currentDate }}</span>
          </div>
        </header>

        <!-- Page Content -->
        <div class="flex-1 p-4 md:p-8">
          <slot></slot>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { router, usePage } from '@inertiajs/vue3'
import logoDark from '@/app/images/logo-purple.png'
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
} from '~/app/components/ui/menubar'
import { useSyncStatus } from '~/app/composables/useSyncStatus'
import DemoBanner from '~/app/components/shared/demo-banner.vue'

const { status: syncStatus, formatLastSync, fetchStatus, errorMessage: syncErrorMessage } = useSyncStatus()

const sidebarOpen = ref(false)
const closeSidebar = () => { sidebarOpen.value = false }

// Refresh status when sync completes
watch(syncStatus, (newStatus, oldStatus) => {
  if (oldStatus === 'syncing' && newStatus === 'completed') {
    // Optionally refresh page data when sync completes
    router.reload({ only: ['properties'] })
  }
})

interface Props {
  pageTitle: string
  pageSubtitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  pageSubtitle: '',
})

const page = usePage()
const user = page.props.user as { name?: string; email?: string; isSuperAdmin?: boolean; role?: string; churchName?: string } | null
const churchName = computed(() => user?.churchName || null)
const isImpersonating = computed(() => page.props.isImpersonating as boolean | undefined)
const viewMode = computed(() => page.props.viewMode as string | undefined)
const demoMode = computed(() => page.props.demoMode as string | null)

const isSuperAdmin = computed(() => user?.isSuperAdmin || user?.role === 'super_admin')

const stopImpersonating = async () => {
  try {
    // Get CSRF token from cookie
    const csrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1]

    const response = await fetch('/api/admin/stop-impersonating', {
      method: 'POST',
      headers: {
        'X-XSRF-TOKEN': csrfToken ? decodeURIComponent(csrfToken) : '',
      },
      credentials: 'same-origin',
    })

    if (response.ok) {
      // If opened as a new window, close it; otherwise redirect
      if (window.opener) {
        window.close()
      } else {
        window.location.href = '/admin/churches'
      }
    } else {
      alert('Failed to stop impersonating')
    }
  } catch (error) {
    console.error('Error stopping impersonation:', error)
    alert('An error occurred')
  }
}

// Hide Territory Setup only when Super Admin is in their own admin view (not impersonating or in demo mode)
const shouldHideChurchSetup = computed(() => isSuperAdmin.value && !isImpersonating.value && !demoMode.value && viewMode.value !== 'church')

const userName = computed(() => user?.name || 'User')
const userEmail = computed(() => user?.email || '')

const userInitials = computed(() => {
  const name = userName.value
  if (!name) return 'U'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
})

const currentDate = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

const currentPath = computed(() => {
  return page.url || window.location.pathname
})

const isActive = (path: string) => {
  return currentPath.value === path || currentPath.value.startsWith(path + '/')
}

const logout = () => {
  router.post('/logout')
}

// Role switcher - fetch visitors with street groups for "View as Delivery" dropdown
interface VisitorOption {
  id: number
  name: string
}
const visitors = ref<VisitorOption[]>([])

const fetchVisitors = async () => {
  try {
    const csrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1]

    const response = await fetch('/api/visitors', {
      headers: {
        'X-XSRF-TOKEN': csrfToken ? decodeURIComponent(csrfToken) : '',
        'Accept': 'application/json',
      },
      credentials: 'same-origin',
    })

    if (response.ok) {
      const all = await response.json()
      visitors.value = all
    }
  } catch (error) {
    // Silently fail - dropdown just won't show
  }
}

const switchToVisitor = (visitorId: number) => {
  router.post(`/api/visitors/${visitorId}/act-as`, {})
}

onMounted(() => {
  fetchVisitors()
})
</script>
