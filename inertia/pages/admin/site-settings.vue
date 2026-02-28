<template>
  <AdminSidebarLayout page-title="Site Settings">
      <div class="max-w-4xl">
        <div class="flex justify-end mb-6">
          <div class="flex gap-4">
            <a
              href="/"
              target="_blank"
              class="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                ></path>
              </svg>
              Home
            </a>
            <a
              href="/how-to-use"
              target="_blank"
              class="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                ></path>
              </svg>
              How To Use
            </a>
            <a
              href="/about-us"
              target="_blank"
              class="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                ></path>
              </svg>
              About Us
            </a>
          </div>
        </div>

        <p class="text-gray-600 mb-8">
          Edit the content that appears on the public pages. Changes will be visible to all
          visitors after saving.
        </p>

        <!-- Tab Navigation -->
        <div class="mb-6 flex border-b border-gray-200">
          <button
            @click="activeTab = 'home'"
            :class="[
              'px-6 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === 'home'
                ? 'border-tertiary text-tertiary'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            ]"
          >
            Home Page
          </button>
          <button
            @click="activeTab = 'howToUse'"
            :class="[
              'px-6 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === 'howToUse'
                ? 'border-tertiary text-tertiary'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            ]"
          >
            How To Use
          </button>
          <button
            @click="activeTab = 'aboutUs'"
            :class="[
              'px-6 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === 'aboutUs'
                ? 'border-tertiary text-tertiary'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            ]"
          >
            About Us
          </button>
        </div>

        <form @submit.prevent="saveSettings" class="space-y-8">
          <!-- Home Page Tab -->
          <div v-show="activeTab === 'home'">
            <!-- Hero Section -->
            <Card class="mb-8">
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>The main headline and introduction text</CardDescription>
              </CardHeader>
              <CardContent class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Main Title</label>
                  <input
                    v-model="form.heroTitle"
                    type="text"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Reach those in your community"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">First Paragraph</label>
                  <textarea
                    v-model="form.heroParagraph1"
                    rows="3"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Welcome text..."
                  ></textarea>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Second Paragraph</label>
                  <textarea
                    v-model="form.heroParagraph2"
                    rows="3"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="About the portal..."
                  ></textarea>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Third Paragraph</label>
                  <textarea
                    v-model="form.heroParagraph3"
                    rows="3"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Call to action..."
                  ></textarea>
                </div>
              </CardContent>
            </Card>

            <!-- Registration Section -->
            <Card>
              <CardHeader>
                <CardTitle>Registration Section</CardTitle>
                <CardDescription>The call-to-action section with the registration form</CardDescription>
              </CardHeader>
              <CardContent class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                  <input
                    v-model="form.ctaTitle"
                    type="text"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ready to welcome your community?"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                  <input
                    v-model="form.ctaButtonText"
                    type="text"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Submit"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- How To Use Tab -->
          <div v-show="activeTab === 'howToUse'">
            <Card class="mb-8">
              <CardHeader>
                <CardTitle>Page Header</CardTitle>
                <CardDescription>The title and introduction for the How To Use page</CardDescription>
              </CardHeader>
              <CardContent class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
                  <input
                    v-model="form.howToUseTitle"
                    type="text"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="How To Use"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Introduction</label>
                  <textarea
                    v-model="form.howToUseIntro"
                    rows="3"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Getting started with the Community Welcome Portal..."
                  ></textarea>
                </div>
              </CardContent>
            </Card>

            <!-- Steps -->
            <Card class="mb-8" v-for="step in [1, 2, 3, 4]" :key="step">
              <CardHeader>
                <CardTitle>Step {{ step }}</CardTitle>
              </CardHeader>
              <CardContent class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Step Title</label>
                  <input
                    v-model="form[`howToUseStep${step}Title` as keyof typeof form]"
                    type="text"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    :placeholder="`Step ${step} title...`"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Step Content</label>
                  <textarea
                    v-model="form[`howToUseStep${step}Content` as keyof typeof form]"
                    rows="3"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    :placeholder="`Step ${step} content...`"
                  ></textarea>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- About Us Tab -->
          <div v-show="activeTab === 'aboutUs'">
            <Card class="mb-8">
              <CardContent class="space-y-4 pt-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
                  <input
                    v-model="form.aboutUsTitle"
                    type="text"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="About Us"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">First Paragraph</label>
                  <textarea
                    v-model="form.aboutUsParagraph1"
                    rows="3"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="The Community Welcome Portal was created..."
                  ></textarea>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Second Paragraph</label>
                  <textarea
                    v-model="form.aboutUsParagraph2"
                    rows="3"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Second paragraph content..."
                  ></textarea>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Third Paragraph</label>
                  <textarea
                    v-model="form.aboutUsParagraph3"
                    rows="3"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Third paragraph content..."
                  ></textarea>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- Save Button -->
          <div class="flex justify-end gap-4 pt-4">
            <button
              type="button"
              @click="resetForm"
              class="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              :disabled="isSaving"
              class="px-4 py-2 bg-tertiary hover:bg-[#e55d4d] text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    <!-- Notification Modal -->
    <NotificationModal
      :show="notification.show"
      :type="notification.type"
      :title="notification.title"
      :message="notification.message"
      @close="notification.show = false"
      @confirm="notification.show = false"
    />
  </AdminSidebarLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import AdminSidebarLayout from '~/app/components/layouts/admin-sidebar-layout.vue'
import NotificationModal from '~/app/components/shared/notification-modal.vue'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '~/app/components/ui/card'

interface SiteSettings {
  id: number
  heroTitle: string
  heroParagraph1: string | null
  heroParagraph2: string | null
  heroParagraph3: string | null
  ctaTitle: string
  ctaButtonText: string
  heroImageUrl: string | null
  // How To Use fields
  howToUseTitle: string
  howToUseIntro: string | null
  howToUseStep1Title: string | null
  howToUseStep1Content: string | null
  howToUseStep2Title: string | null
  howToUseStep2Content: string | null
  howToUseStep3Title: string | null
  howToUseStep3Content: string | null
  howToUseStep4Title: string | null
  howToUseStep4Content: string | null
  // About Us fields
  aboutUsTitle: string
  aboutUsParagraph1: string | null
  aboutUsParagraph2: string | null
  aboutUsParagraph3: string | null
}

const props = defineProps<{
  settings: SiteSettings | null
  error?: string
}>()

const activeTab = ref<'home' | 'howToUse' | 'aboutUs'>('home')
const isSaving = ref(false)

const form = reactive({
  heroTitle: props.settings?.heroTitle || '',
  heroParagraph1: props.settings?.heroParagraph1 || '',
  heroParagraph2: props.settings?.heroParagraph2 || '',
  heroParagraph3: props.settings?.heroParagraph3 || '',
  ctaTitle: props.settings?.ctaTitle || '',
  ctaButtonText: props.settings?.ctaButtonText || '',
  heroImageUrl: props.settings?.heroImageUrl || '',
  // How To Use fields
  howToUseTitle: props.settings?.howToUseTitle || '',
  howToUseIntro: props.settings?.howToUseIntro || '',
  howToUseStep1Title: props.settings?.howToUseStep1Title || '',
  howToUseStep1Content: props.settings?.howToUseStep1Content || '',
  howToUseStep2Title: props.settings?.howToUseStep2Title || '',
  howToUseStep2Content: props.settings?.howToUseStep2Content || '',
  howToUseStep3Title: props.settings?.howToUseStep3Title || '',
  howToUseStep3Content: props.settings?.howToUseStep3Content || '',
  howToUseStep4Title: props.settings?.howToUseStep4Title || '',
  howToUseStep4Content: props.settings?.howToUseStep4Content || '',
  // About Us fields
  aboutUsTitle: props.settings?.aboutUsTitle || '',
  aboutUsParagraph1: props.settings?.aboutUsParagraph1 || '',
  aboutUsParagraph2: props.settings?.aboutUsParagraph2 || '',
  aboutUsParagraph3: props.settings?.aboutUsParagraph3 || '',
})

const originalForm = { ...form }

const notification = ref({
  show: false,
  type: 'info' as 'success' | 'error' | 'info',
  title: '',
  message: '',
})

const showNotification = (type: 'success' | 'error' | 'info', title: string, message: string) => {
  notification.value = {
    show: true,
    type,
    title,
    message,
  }
}

const resetForm = () => {
  Object.assign(form, originalForm)
}

const saveSettings = async () => {
  isSaving.value = true

  try {
    const csrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1]

    const response = await fetch('/api/admin/site-settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': decodeURIComponent(csrfToken || ''),
      },
      credentials: 'same-origin',
      body: JSON.stringify(form),
    })

    if (response.ok) {
      // Update the original form values to match saved state
      Object.assign(originalForm, form)
      showNotification('success', 'Success', 'Site settings saved successfully!')
    } else {
      const data = await response.json()
      showNotification('error', 'Save Failed', data.error || 'Failed to save settings')
    }
  } catch (error) {
    console.error('Error saving settings:', error)
    showNotification('error', 'Error', 'An error occurred while saving settings')
  } finally {
    isSaving.value = false
  }
}
</script>
