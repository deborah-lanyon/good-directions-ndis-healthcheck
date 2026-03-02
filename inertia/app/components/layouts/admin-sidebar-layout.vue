<template>
  <div class="min-h-screen flex flex-col">
    <!-- Top Menu Bar -->
    <header class="h-[72px] bg-[#ece3f3] flex items-center justify-between px-4 flex-shrink-0">
      <!-- Left: Hamburger + Logo + Super Admin label -->
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
        <a href="/admin/dashboard" class="flex items-center">
          <img :src="logoDark" alt="Good Directions Logo" class="h-10 w-auto" />
        </a>
        <div class="hidden sm:flex items-center">
          <div class="w-px h-8 bg-gray-300 mr-4"></div>
          <span class="font-karla text-sm font-semibold text-gray-700">Super Admin</span>
        </div>
      </div>

      <!-- Right: User Dropdown -->
      <div class="flex items-center gap-2 mr-2 md:mr-4">
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
              href="/admin/dashboard"
              :class="[
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive('/admin/dashboard') ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
              ]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              <span class="font-karla">Dashboard</span>
            </a>

            <a
              href="/admin/territories"
              :class="[
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive('/admin/territories') ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
              ]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
              </svg>
              <span class="font-karla">Territories</span>
            </a>

            <a
              href="/admin/users"
              :class="[
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive('/admin/users') ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
              ]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <span class="font-karla">Users</span>
            </a>

            <a
              href="/admin/site-settings"
              :class="[
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive('/admin/site-settings') ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
              ]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="font-karla">Site Settings</span>
            </a>

            <a
              href="/admin/analytics"
              :class="[
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive('/admin/analytics') ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
              ]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              <span class="font-karla">Analytics</span>
            </a>

            <a
              href="/admin/records"
              :class="[
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive('/admin/records') ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
              ]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M10.875 12c-.621 0-1.125.504-1.125 1.125M12 12c.621 0 1.125.504 1.125 1.125m0 0v1.5c0 .621-.504 1.125-1.125 1.125M12 15.75c0 .621-.504 1.125-1.125 1.125" />
              </svg>
              <span class="font-karla">All Records</span>
            </a>
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
const user = page.props.user as { name?: string; email?: string; fullName?: string } | null

const userName = computed(() => user?.fullName || user?.name || 'Admin')
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
  // Exact match for dashboard to avoid matching /admin/dashboard when on /admin/churches
  if (path === '/admin/dashboard') {
    return currentPath.value === path
  }
  return currentPath.value === path || currentPath.value.startsWith(path + '/')
}

const logout = () => {
  router.post('/logout')
}
</script>
