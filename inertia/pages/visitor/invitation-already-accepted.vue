<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4"
  >
    <Head title="Invitation Already Accepted" />

    <div class="max-w-md w-full text-center">
      <!-- Icon -->
      <div class="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
        <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <!-- Content Card -->
      <div class="bg-white rounded-lg shadow-xl p-8 mb-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-4">Invitation Already Accepted</h1>
        <p class="text-gray-600 mb-6">
          This invitation has already been accepted and your account has been created.
        </p>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p class="text-sm text-blue-800">
            You can now sign in using your email address and the password you created.
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="space-y-3">
        <Link
          href="/login"
          class="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/"
          class="block w-full bg-white text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 border border-gray-300 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  </div>
</template>
