<template>
  <div class="bg-white min-h-screen flex flex-col">
    <Navigation />
    <main class="flex-1">
      <Container class="py-[70px]">
        <div class="max-w-4xl mx-auto text-center">
          <div class="mb-8">
            <Icon name="hero" class="w-20 h-20 mx-auto text-primary" />
          </div>
          <h1 class="text-4xl font-bold text-gray-900 mb-4">Welcome to Good Directions NDIS Healthcheck</h1>
          <p class="text-lg text-gray-600 mb-6">
            Manage your organisation profile, search for nearby properties, and keep your volunteers in
            the loop.
          </p>
          <div class="flex items-center justify-center gap-4">
            <button
              @click="goToRegister"
              class="px-6 py-3 bg-primary text-white rounded-full font-medium hover:opacity-90"
            >
              Register
            </button>
            <button
              @click="goToLogin"
              class="px-6 py-3 border border-gray-200 rounded-full font-medium hover:bg-gray-50"
            >
              Login
            </button>
            <button
              @click="goToDashboard"
              class="px-6 py-3 text-sm text-gray-700 rounded-full hover:bg-gray-50"
            >
              Explore dashboard
            </button>
          </div>
        </div>
      </Container>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Navigation from '~/app/components/shared/navigation.vue'
import Container from '~/app/components/container.vue'
import Footer from '~/app/components/footer.vue'
import Icon from '~/app/components/icon.vue'
import { router } from '@inertiajs/vue3'

const goToRegister = () => router.visit('/register')
const goToLogin = () => router.visit('/login')
const goToDashboard = () => router.visit('/')
</script>
