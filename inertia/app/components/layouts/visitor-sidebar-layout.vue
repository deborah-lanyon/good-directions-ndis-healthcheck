<template>
  <div class="min-h-screen flex flex-col">
    <Head :title="pageTitle" />

    <!-- Demo Mode Banner -->
    <DemoBanner />

    <!-- Acting as Visitor Banner (church admin) -->
    <div v-if="actingAsVisitor" class="bg-teal-600 text-white px-4 py-2 text-center text-sm font-karla flex items-center justify-center gap-3">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
      <span>Viewing as <strong>{{ actingAsVisitor.name }}</strong></span>
      <button
        @click="exitActingAs"
        class="ml-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-medium transition-colors"
      >
        Return to Admin
      </button>
    </div>

    <!-- Top Menu Bar -->
    <header class="h-[72px] bg-[#e8f0fa] flex items-center justify-between px-4 flex-shrink-0">
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
        <a href="/visitor/dashboard" class="flex items-center">
          <img :src="logoDark" alt="Community Welcome Logo" class="h-10 w-auto" />
        </a>
        <div v-if="churchName" class="hidden sm:flex items-center">
          <div class="w-px h-8 bg-gray-300 mr-4"></div>
          <span class="font-karla text-sm font-semibold text-gray-700">{{ churchName }}</span>
        </div>
      </div>

      <!-- Right: Icon Links and User -->
      <div class="flex items-center gap-2 mr-2 md:mr-4">
        <!-- Help Icon -->
        <a
          href="/visitor/help"
          class="hidden md:inline-flex p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Help"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
        </a>

        <!-- Divider -->
        <div class="hidden md:block w-px h-6 bg-gray-200 mx-2"></div>

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
              href="/visitor/dashboard"
              :class="[
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive('/visitor/dashboard') ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
              ]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              <span class="font-karla">Dashboard</span>
            </a>

            <a
              href="/visitor/properties"
              :class="[
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive('/visitor/properties') ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
              ]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              <span class="font-karla">My Properties</span>
            </a>
          </div>

          <!-- Support Section -->
          <div class="mt-6 pt-6 border-t border-white/20">
            <p class="px-4 text-sm font-karla font-semibold text-white uppercase tracking-wider mb-2">
              Support
            </p>
            <div class="space-y-1">
              <a
                href="/visitor/help"
                :class="[
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive('/visitor/help') ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                ]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
                <span class="font-karla">How To Use</span>
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
import { computed, ref } from 'vue'
import { Head, router, usePage } from '@inertiajs/vue3'
import logoDark from '@/app/images/logo-blue.png'
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
} from '~/app/components/ui/menubar'
import DemoBanner from '~/app/components/shared/demo-banner.vue'

const sidebarOpen = ref(false)
const closeSidebar = () => { sidebarOpen.value = false }

interface Props {
  pageTitle: string
  pageSubtitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  pageSubtitle: '',
})

const page = usePage()
const user = page.props.user as { name?: string; email?: string; churchName?: string } | null
const churchName = computed(() => user?.churchName || null)
const actingAsVisitor = computed(() => page.props.actingAsVisitor as { id: number; name: string } | null)

const userName = computed(() => user?.name || 'Visitor')
const userEmail = computed(() => user?.email || '')

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

const exitActingAs = () => {
  router.post('/api/visitors/stop-acting')
}
</script>
