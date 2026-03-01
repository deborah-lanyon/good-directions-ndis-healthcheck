<template>
  <div class="bg-[#ffffff] min-h-screen flex flex-col">
    <header>
      <Navbar />
    </header>
    <main class="flex-1">
      <Container class="my-24">
        <div class="flex justify-center items-center mb-12">
          <Icon name="key" />
        </div>
        <Title title="Lost your key?" styleClass="text-tertiary" />
        <p class="text-center text-[30px] text-primary mt-8 max-w-[673px] mx-auto">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form
          @submit.prevent="handleForgotPassword"
          class="grid grid-cols-1 gap-y-6 mx-auto mt-24 max-w-4xl"
        >
          <FormInput
            type="email"
            placeholder=""
            label="Email"
            id="email"
            v-model="email"
            required
          />

          <p
            v-if="error"
            class="bg-white rounded-md p-3 text-red-500 text-2xl font-normal leading-[30px] text-center"
          >
            {{ error }}
          </p>
          <button
            class="px-16 py-3 rounded-full max-w-max font-caprasimo text-3xl leading-[150%] mx-auto bg-primary text-secondary disabled:opacity-50"
            :disabled="isLoading"
            type="submit"
          >
            {{ isLoading ? 'Sending...' : 'Send Reset Link' }}
          </button>
        </form>
      </Container>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { router } from '@inertiajs/vue3'

import Icon from '~/app/components/icon.vue'
import Title from '~/app/components/title.vue'
import Container from '~/app/components/container.vue'
import Footer from '~/app/components/footer.vue'
import Navbar from '~/app/components/navbar.vue'
import FormInput from '~/app/components/form-input.vue'

const email = ref('')
const isLoading = ref(false)
const error = ref('')

const handleForgotPassword = async () => {
  isLoading.value = true

  try {
    const response = await fetch('/api/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      error.value = data.message || 'Failed to send reset email'
      isLoading.value = false
      return
    }

    email.value = ''
  } catch (error) {
    console.error('Forgot password error:', error)
    error.value =
      error instanceof Error ? error.message : 'Failed to send reset email. Please try again.'
  } finally {
    router.visit('/login')
    isLoading.value = false
  }
}
</script>
