<template>
  <div class="bg-[#F1EDE0] min-h-screen flex flex-col">
    <header>
      <Navigation />
      <Navbar />
    </header>
    <main class="flex-1">
      <Container class="my-24">
        <div class="flex justify-center items-center mb-12">
          <Icon name="house" />
        </div>
        <Title title="Open sesame" styleClass="text-tertiary" />
        <form
          @submit.prevent="handleLogin"
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
          <FormInput
            type="password"
            placeholder=""
            label="Password"
            id="password"
            v-model="password"
            :showPasswordToggle="true"
            required
          />
          <div class="flex justify-end">
            <a
              class="text-sm font-normal tracking-normal hover:underline hover:text-quinary"
              href="/forgot-password"
              >Forgot password?</a
            >
          </div>
          <p
            v-if="error"
            class="bg-white rounded-md p-3 text-red-500 text-2xl font-normal leading-[30px] text-center"
          >
            {{ error }}
          </p>
          <button
            class="px-8 md:px-16 py-3 rounded-full w-full md:max-w-max font-caprasimo text-2xl md:text-3xl leading-[150%] mx-auto text-center bg-primary text-secondary disabled:opacity-50 hover:cursor-pointer hover:bg-primary/80"
            :disabled="isLoading"
            type="submit"
          >
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>
          <a
            href="/register"
            class="px-8 md:px-16 py-3 mt-2 rounded-full w-full md:max-w-max font-caprasimo text-2xl md:text-3xl leading-[150%] mx-auto text-center bg-tertiary text-secondary hover:cursor-pointer hover:bg-tertiary/80"
            :disabled="isLoading"
            type="submit"
          >
            Create an account
          </a>
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
const password = ref('')
const isLoading = ref(false)
const error = ref('')

const handleLogin = async () => {
  isLoading.value = true

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    })

    const data = await response.json()

    isLoading.value = false

    if (!response.ok) {
      error.value = data.message || 'Login failed'
      isLoading.value = false
      return
    }

    // Redirect based on user role
    if (data.user?.isSuperAdmin || data.user?.role === 'super_admin') {
      router.visit('/admin/churches')
    } else if (data.user?.role === 'visitor') {
      router.visit('/visitor/dashboard')
    } else {
      router.visit('/dashboard')
    }
  } catch (error) {
    console.error('Login error:', error)
    error.value = error instanceof Error ? error.message : 'Login failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>
