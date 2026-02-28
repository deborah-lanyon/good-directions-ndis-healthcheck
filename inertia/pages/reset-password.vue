<template>
  <div class="bg-[#F1EDE0] min-h-screen flex flex-col">
    <header>
      <Navbar />
    </header>
    <main class="flex-1">
      <Container class="my-24 relative z-20">
        <div class="flex justify-center items-center mb-12">
          <Icon name="key" />
        </div>
        <Title :title="pageTitle" styleClass="text-tertiary" />
        <form
          @submit.prevent="handleResetPassword"
          class="grid grid-cols-1 gap-y-6 mx-auto mt-24 max-w-4xl relative z-20"
        >
          <FormInput
            type="email"
            placeholder=""
            label="Email"
            id="email"
            required
            disabled
            :modelValue="email"
          />
          <FormInput
            type="password"
            placeholder=""
            label="New Password"
            id="password"
            v-model="password"
            :showPasswordToggle="true"
            required
          />
          <FormInput
            type="password"
            placeholder=""
            label="Confirm Password"
            id="confirmPassword"
            v-model="confirmPassword"
            :showPasswordToggle="true"
            required
          />

          <p
            v-if="error"
            class="bg-white rounded-md p-3 text-red-500 text-2xl font-normal leading-[30px] text-center"
          >
            {{ error }}
          </p>
          <button
            class="px-16 py-3 rounded-full max-w-max font-caprasimo text-3xl leading-[150%] mx-auto bg-primary text-secondary disabled:opacity-50 mt-2"
            :disabled="isLoading"
            type="submit"
          >
            {{ isLoading ? buttonLoadingText : buttonText }}
          </button>
        </form>
        <div class="mt-10 text-center">
          <a
            href="/login"
            class="text-sm font-normal tracking-normal hover:underline hover:text-quinary"
            >Already have an account? Login</a
          >
        </div>
      </Container>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { router } from '@inertiajs/vue3'
import Icon from '~/app/components/icon.vue'
import Title from '~/app/components/title.vue'
import Container from '~/app/components/container.vue'
import Footer from '~/app/components/footer.vue'
import Navbar from '~/app/components/navbar.vue'
import FormInput from '~/app/components/form-input.vue'

interface ResetPasswordProps {
  token?: string
  email?: string
  isNewUser?: boolean
}

const props = defineProps<ResetPasswordProps>()

const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const token = ref(props.token || '')
const error = ref('')
const email = ref(props.email || '')
const isNewUser = ref(props.isNewUser || false)

// Determine if this is a new user based on URL parameters
const pageTitle = computed(() => {
  return isNewUser.value ? 'Set your password' : 'Pick up your keys'
})

const buttonText = computed(() => {
  return isNewUser.value ? 'Set Password' : 'Reset password'
})

const buttonLoadingText = computed(() => {
  return isNewUser.value ? 'Setting password...' : 'Resetting password...'
})

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const urlToken = urlParams.get('token')
  const urlEmail = urlParams.get('email')
  const urlIsNewUser = urlParams.get('new') // Check if this is a new user registration

  // If token is not in props, try to get it from URL
  if (!token.value && urlToken) {
    token.value = urlToken
  }

  // If email is not in props, try to get it from URL
  if (!email.value && urlEmail) {
    email.value = urlEmail
  }

  // Check if this is a new user (from registration)
  if (urlIsNewUser === 'true' || props.isNewUser) {
    isNewUser.value = true
  }

  // Validate that we have a token
  if (!token.value) {
    error.value = 'Invalid or missing reset token'
    router.visit('/forgot-password')
  }
})

const handleResetPassword = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters long'
    return
  }

  isLoading.value = true

  try {
    const response = await fetch('/api/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token.value,
        password: password.value,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      error.value = data.message || 'Failed to reset password'
      isLoading.value = false
      return
    }

    // Redirect to dashboard after successful password reset and auto-login
    router.visit(data.redirectTo || '/dashboard')
  } catch (error) {
    console.error('Reset password error:', error)
    isLoading.value = false
    error.value =
      error instanceof Error ? error.message : 'Failed to reset password. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>
