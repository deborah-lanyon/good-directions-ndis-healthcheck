<template>
  <!-- Super Admin Banner (only show when a Super Admin is impersonating another user on their dashboard pages) -->
  <div v-if="isImpersonating && !shouldHideSuperAdminBanner" class="bg-red-700 text-white py-3 border-b border-white/20">
    <Container class="flex justify-center items-center gap-4">
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
    </Container>
  </div>

  <nav class="bg-primary">
    <Container class="py-[30px] flex justify-between items-center">
      <a href="/">
        <img class="w-auto h-16" :src="logo" alt="Good Directions Logo" />
      </a>
      <div class="flex items-center" style="gap: calc(var(--spacing) * 10)">
        <!-- Navigation for Super Admins (always show admin navigation) -->
        <template
          v-if="user && (user.role === 'super_admin' || user.isSuperAdmin)"
        >
          <a
            href="/admin/churches"
            :class="[
              'font-karla text-xl hidden sm:inline-block',
              isActive('/admin/churches') ? 'text-tertiary' : 'text-white hover:text-tertiary',
            ]"
            aria-label="All Organisation Profiles"
          >
            All Organisation Profiles
          </a>
          <a
            href="/admin/users"
            :class="[
              'font-karla text-xl hidden sm:inline-block',
              isActive('/admin/users') ? 'text-tertiary' : 'text-white hover:text-tertiary',
            ]"
            aria-label="User Profiles"
          >
            User Profiles
          </a>
          <a
            href="/admin/site-settings"
            :class="[
              'font-karla text-xl hidden sm:inline-block',
              isActive('/admin/site-settings') ? 'text-tertiary' : 'text-white hover:text-tertiary',
            ]"
            aria-label="Site Settings"
          >
            Site Settings
          </a>
          <a
            href="/admin/analytics"
            :class="[
              'font-karla text-xl hidden sm:inline-block',
              isActive('/admin/analytics') ? 'text-tertiary' : 'text-white hover:text-tertiary',
            ]"
            aria-label="Analytics"
          >
            Analytics
          </a>
          <a
            href="/admin/records"
            :class="[
              'font-karla text-xl hidden sm:inline-block',
              isActive('/admin/records') ? 'text-tertiary' : 'text-white hover:text-tertiary',
            ]"
            aria-label="All Records"
          >
            All Records
          </a>
          <DemoModeToggle class="hidden sm:block" />
        </template>

        <!-- Navigation for Church Admins and Visitors -->
        <template
          v-else-if="user && user.role !== 'super_admin' && !user.isSuperAdmin"
        >
          <!-- Management Dashboard Link -->
          <a
            href="/dashboard"
            :class="[
              'font-karla text-xl hidden sm:inline-block',
              isActive('/dashboard') ? 'text-tertiary' : 'text-white hover:text-tertiary',
            ]"
            aria-label="Management Dashboard"
          >
            Management Dashboard
          </a>

          <!-- Get in Touch Link -->
          <a
            href="/get-in-touch"
            :class="[
              'font-karla text-xl hidden sm:inline-block',
              isActive('/get-in-touch') ? 'text-tertiary' : 'text-white hover:text-tertiary',
            ]"
            aria-label="Get in Touch"
          >
            Get in Touch
          </a>
        </template>

        <!-- Navigation for Non-Logged In Users -->
        <template v-else>
          <a
            href="/home"
            :class="[
              'font-karla text-xl hidden sm:inline-block',
              isActive('/home') || isActive('/') ? 'text-tertiary' : 'text-white hover:text-tertiary',
            ]"
            aria-label="Home"
          >
            Home
          </a>
          <a
            href="/how-it-works"
            :class="[
              'font-karla text-xl hidden sm:inline-block',
              isActive('/how-it-works') ? 'text-tertiary' : 'text-white hover:text-tertiary',
            ]"
            aria-label="How It Works"
          >
            How It Works
          </a>
          <a
            href="/about-us"
            :class="[
              'font-karla text-xl hidden sm:inline-block',
              isActive('/about-us') ? 'text-tertiary' : 'text-white hover:text-tertiary',
            ]"
            aria-label="About Us"
          >
            About Us
          </a>
          <a
            href="/get-in-touch"
            :class="[
              'font-karla text-xl hidden sm:inline-block',
              isActive('/get-in-touch') ? 'text-tertiary' : 'text-white hover:text-tertiary',
            ]"
            aria-label="Get in Touch"
          >
            Get in Touch
          </a>
          <a
            href="/home#register"
            class="font-karla text-xl hidden sm:inline-block bg-tertiary text-white px-8 py-2 rounded-full hover:bg-[#e59a00] transition-colors -mr-4"
            aria-label="Register"
          >
            Register
          </a>
        </template>

        <!-- User Dropdown / Login Button -->
        <template v-if="user">
          <Menubar class="border-none bg-transparent p-0 h-auto shadow-none hidden sm:flex">
            <MenubarMenu>
              <MenubarTrigger
                class="font-karla text-xl transition-colors font-normal cursor-pointer px-0 py-0 h-auto bg-transparent border-none shadow-none hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent text-white hover:!text-tertiary focus:!text-tertiary data-[state=open]:!text-tertiary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </MenubarTrigger>
              <MenubarContent class="bg-white min-w-[200px]">
                <MenubarItem disabled class="text-gray-500 text-sm px-2 py-2">
                  {{ user.email }}
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem as-child>
                  <button
                    @click="router.post('/logout')"
                    class="w-full text-left cursor-pointer text-gray-900 hover:bg-gray-100 focus:bg-gray-100 px-2 py-2 rounded"
                  >
                    Logout
                  </button>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </template>
        <button
          v-else
          @click="router.visit('/login')"
          class="text-secondary font-caprasimo text-[17px] leading-[150%] border border-secondary rounded-full py-[9px] px-[45px] hover:cursor-pointer"
        >
          Login
        </button>
      </div>
    </Container>
  </nav>
</template>
<script setup lang="ts">
import logo from '@/app/images/logo-white.png'
import Container from '../container.vue'
import DemoModeToggle from './demo-mode-toggle.vue'
import { router, usePage } from '@inertiajs/vue3'
import { computed, ref, onMounted } from 'vue'
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
} from '~/app/components/ui/menubar'

const page = usePage()
const user = page.props.user
const isImpersonating = computed(() => page.props.isImpersonating === true)
const viewMode = computed(() => page.props.viewMode || 'admin')

// Check if current page should hide the Super Admin banner
// Hide on: public pages, admin pages, and login/register pages
// Only show on impersonated user's dashboard/management pages
const publicPages = ['/', '/home', '/how-it-works', '/how-to-use', '/about-us', '/get-in-touch', '/login', '/register']
const shouldHideSuperAdminBanner = computed(() => {
  const currentPath = page.url.split('?')[0] // Remove query params
  // Hide on public pages
  if (publicPages.includes(currentPath) || currentPath.startsWith('/home#')) {
    return true
  }
  // Hide on admin pages (Super Admin's own pages)
  if (currentPath.startsWith('/admin')) {
    return true
  }
  return false
})

// Refs for positioning
const navbarHeight = ref('136px')

// Dropdown menu state
const setupMenuOpen = ref(false)
const teamMenuOpen = ref(false)

// Timeout refs for delayed closing
let setupCloseTimeout: ReturnType<typeof setTimeout> | null = null
let teamCloseTimeout: ReturnType<typeof setTimeout> | null = null

// Helper functions for delayed dropdown closing
const openSetupMenu = () => {
  if (setupCloseTimeout) {
    clearTimeout(setupCloseTimeout)
    setupCloseTimeout = null
  }
  setupMenuOpen.value = true
}

const closeSetupMenu = () => {
  setupCloseTimeout = setTimeout(() => {
    setupMenuOpen.value = false
  }, 200) // 200ms delay before closing
}

const openTeamMenu = () => {
  if (teamCloseTimeout) {
    clearTimeout(teamCloseTimeout)
    teamCloseTimeout = null
  }
  teamMenuOpen.value = true
}

const closeTeamMenu = () => {
  teamCloseTimeout = setTimeout(() => {
    teamMenuOpen.value = false
  }, 200) // 200ms delay before closing
}

onMounted(() => {
  // Calculate the actual navbar height
  const nav = document.querySelector('nav')
  if (nav) {
    navbarHeight.value = `${nav.offsetHeight + nav.offsetTop}px`
    document.documentElement.style.setProperty('--navbar-height', navbarHeight.value)
  }

})

const currentPath = computed(() => page.url)

const isActive = (path: string) => {
  return currentPath.value === path || currentPath.value.startsWith(path + '/')
}

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

const isSetupActive = () => {
  return isActive('/church-profile') || isActive('/welcome-pack') || isActive('/amenities')
}

const isTeamActive = () => {
  return isActive('/street-groups') || isActive('/visitors')
}
</script>
