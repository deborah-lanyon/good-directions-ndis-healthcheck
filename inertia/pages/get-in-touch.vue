<template>
  <div class="bg-[#f1ede0] min-h-screen flex flex-col">
    <header>
      <Navigation />
    </header>
    <main class="flex-1">
      <Container class="mt-24 mb-24">
        <Title title="Get in Touch" styleClass="text-primary" />

        <div class="max-w-2xl mx-auto mt-12">
          <!-- Introduction -->
          <p class="text-primary font-karla text-xl leading-relaxed mb-8 text-center">
            We'd love to hear from you. Fill out the form below and we'll get back to you as soon as
            possible.
          </p>

          <!-- Contact Form -->
          <form @submit.prevent="submitForm" class="bg-white rounded-2xl p-8 shadow-sm space-y-6">
            <!-- Name Fields -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- First Name -->
              <div>
                <label for="firstName" class="block text-primary font-karla font-semibold mb-2">
                  First Name <span class="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  v-model="form.firstName"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-karla"
                  placeholder="Enter your first name"
                />
              </div>

              <!-- Last Name -->
              <div>
                <label for="lastName" class="block text-primary font-karla font-semibold mb-2">
                  Last Name <span class="text-red-500">*</span>
                </label>
                <input
                  id="lastName"
                  v-model="form.lastName"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-karla"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <!-- Suburb -->
            <div>
              <label for="suburb" class="block text-primary font-karla font-semibold mb-2">
                Suburb <span class="text-red-500">*</span>
              </label>
              <input
                id="suburb"
                v-model="form.suburb"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-karla"
                placeholder="Enter your suburb"
              />
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="block text-primary font-karla font-semibold mb-2">
                Email <span class="text-red-500">*</span>
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-karla"
                placeholder="Enter your email address"
              />
            </div>

            <!-- Inquiry Type Checkboxes -->
            <div class="space-y-4">
              <label class="block text-primary font-karla font-semibold mb-3">
                How can we help you?
              </label>

              <div class="space-y-3">
                <!-- Option 1: Further information -->
                <label class="flex items-start gap-3 cursor-pointer">
                  <input
                    v-model="form.inquiryTypes"
                    type="checkbox"
                    value="registration_info"
                    class="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                  />
                  <span class="text-primary font-karla">
                    Further information about registering your organisation for Good Directions
                    NDIS Healthcheck
                  </span>
                </label>

                <!-- Option 2: Help using -->
                <label class="flex items-start gap-3 cursor-pointer">
                  <input
                    v-model="form.inquiryTypes"
                    type="checkbox"
                    value="help_using"
                    class="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                  />
                  <span class="text-primary font-karla">
                    Help in using Good Directions NDIS Healthcheck
                  </span>
                </label>

                <!-- Option 3: Book a visit -->
                <label class="flex items-start gap-3 cursor-pointer">
                  <input
                    v-model="form.inquiryTypes"
                    type="checkbox"
                    value="book_visit"
                    class="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                  />
                  <span class="text-primary font-karla">
                    Book a visit to your organisation to introduce Good Directions NDIS Healthcheck
                  </span>
                </label>

                <!-- Option 4: Ask a question -->
                <label class="flex items-start gap-3 cursor-pointer">
                  <input
                    v-model="form.inquiryTypes"
                    type="checkbox"
                    value="ask_question"
                    class="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                  />
                  <span class="text-primary font-karla">Ask a Question</span>
                </label>
              </div>
            </div>

            <!-- Question/Feedback Text Area (shown when "Ask a Question" is checked) -->
            <div v-if="form.inquiryTypes.includes('ask_question')">
              <label for="question" class="block text-primary font-karla font-semibold mb-2">
                Your Question or Feedback
              </label>
              <textarea
                id="question"
                v-model="form.question"
                rows="4"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-karla resize-none"
                placeholder="Enter your question or feedback here..."
              ></textarea>
            </div>

            <!-- Submit Button -->
            <div class="pt-4">
              <button
                type="submit"
                :disabled="isSubmitting"
                class="w-full px-8 py-4 rounded-full font-caprasimo text-xl bg-primary text-secondary hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="isSubmitting">Sending...</span>
                <span v-else>Send Message</span>
              </button>
            </div>
          </form>

          <!-- Success Message -->
          <div
            v-if="showSuccess"
            class="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6 text-center"
          >
            <svg
              class="w-12 h-12 text-green-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <h3 class="font-caprasimo text-xl text-green-800 mb-2">Message Sent!</h3>
            <p class="text-green-700 font-karla">
              Thank you for getting in touch. We'll respond to your inquiry as soon as possible.
            </p>
          </div>

          <!-- Error Message -->
          <div
            v-if="errorMessage"
            class="mt-8 bg-red-50 border border-red-200 rounded-2xl p-6 text-center"
          >
            <svg
              class="w-12 h-12 text-red-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <h3 class="font-caprasimo text-xl text-red-800 mb-2">Something went wrong</h3>
            <p class="text-red-700 font-karla">{{ errorMessage }}</p>
          </div>
        </div>
      </Container>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import Navigation from '~/app/components/shared/navigation.vue'
import Footer from '~/app/components/footer.vue'
import Container from '~/app/components/container.vue'
import Title from '~/app/components/title.vue'

const isSubmitting = ref(false)
const showSuccess = ref(false)
const errorMessage = ref('')

const form = reactive({
  firstName: '',
  lastName: '',
  suburb: '',
  email: '',
  inquiryTypes: [] as string[],
  question: '',
})

const resetForm = () => {
  form.firstName = ''
  form.lastName = ''
  form.suburb = ''
  form.email = ''
  form.inquiryTypes = []
  form.question = ''
}

const submitForm = async () => {
  isSubmitting.value = true
  errorMessage.value = ''
  showSuccess.value = false

  try {
    const csrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1]

    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': decodeURIComponent(csrfToken || ''),
      },
      credentials: 'same-origin',
      body: JSON.stringify(form),
    })

    if (response.ok) {
      showSuccess.value = true
      resetForm()
    } else {
      const data = await response.json()
      errorMessage.value = data.error || 'Failed to send message. Please try again.'
    }
  } catch (error) {
    console.error('Error submitting form:', error)
    errorMessage.value = 'An error occurred while sending your message. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>
