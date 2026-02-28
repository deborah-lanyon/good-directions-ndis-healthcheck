<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4"
  >
    <Head title="Invalid Invitation" />

    <div class="max-w-md w-full text-center">
      <!-- Icon -->
      <div class="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
        <svg class="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <!-- Content Card -->
      <div class="bg-white rounded-lg shadow-xl p-8 mb-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-4">Invalid Invitation</h1>
        <p class="text-gray-600 mb-6">
          This invitation link is invalid or has expired. The invitation may have already been used
          or the link may be incorrect.
        </p>

        <div class="space-y-3">
          <p class="text-sm text-gray-600">
            If you believe this is an error, please contact your church coordinator for a new
            invitation.
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="space-y-3">
        <Link
          href="/login"
          class="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Go to Login
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
