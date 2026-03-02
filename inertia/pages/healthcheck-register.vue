<template>
  <div class="bg-[#f1ede0] min-h-screen flex flex-col">
    <header>
      <Navigation />
    </header>
    <main class="flex-1">
      <Container class="mt-24">
        <Title title="Register for your NDIS Healthcheck" styleClass="text-primary" />
      </Container>
      <Hero />
      <section class="bg-tertiary -mt-0.5 pt-[100px]">
        <Container>
          <Title
            title="Your Free NDIS Healthcheck"
            styleClass="text-secondary"
            class="py-[100px]"
          />

          <div
            v-if="propertyAddress"
            class="mx-auto max-w-4xl mb-8 bg-white/10 border border-white/20 rounded-lg p-4 text-center"
          >
            <p class="text-secondary text-lg font-karla">
              Registering for the property at:
              <span class="font-semibold">{{ propertyAddress }}</span>
            </p>
          </div>

          <form @submit.prevent="handleRegister" class="grid grid-cols-1 gap-y-6 mx-auto max-w-4xl">
            <FormInput
              type="text"
              placeholder=""
              label="Full name"
              id="name"
              v-model="fullName"
              theme="tertiary"
              required
            />
            <FormInput
              type="email"
              placeholder=""
              label="Email"
              id="email"
              v-model="email"
              theme="tertiary"
              required
            />
            <FormInput
              type="tel"
              placeholder=""
              label="Phone number"
              id="phone"
              v-model="phone"
              theme="tertiary"
            />
            <p
              v-if="error"
              class="bg-white rounded-md p-3 text-red-500 text-2xl font-normal leading-[30px] text-center"
            >
              {{ error }}
            </p>

            <button
              class="px-16 py-3 rounded-full max-w-max font-caprasimo text-3xl leading-[150%] mx-auto bg-primary text-secondary mt-[100px] disabled:opacity-50"
              :disabled="isLoading"
              type="submit"
            >
              {{ isLoading ? 'Submitting...' : 'Register Now' }}
            </button>
          </form>
        </Container>
        <div class="bg-primary">
          <svg class="text-tertiary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path
              fill="currentColor"
              fill-opacity="1"
              d="M0,192L40,208C80,224,160,256,240,256C320,256,400,224,480,197.3C560,171,640,149,720,160C800,171,880,213,960,213.3C1040,213,1120,171,1200,181.3C1280,192,1360,256,1400,288L1440,320L1440,0L1400,0C1360,0,1280,0,1200,0C1120,0,1040,0,960,0C880,0,800,0,720,0C640,0,560,0,480,0C400,0,320,0,240,0C160,0,80,0,40,0L0,0Z"
            ></path>
          </svg>
        </div>
      </section>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { router } from '@inertiajs/vue3'
import Navigation from '~/app/components/shared/navigation.vue'
import Hero from '~/app/components/hero.vue'
import Footer from '~/app/components/footer.vue'
import Container from '~/app/components/container.vue'
import Title from '~/app/components/title.vue'
import FormInput from '~/app/components/form-input.vue'

const props = defineProps<{
  trackingCode: string | null
  propertyAddress: string | null
}>()

const fullName = ref('')
const email = ref('')
const phone = ref('')
const isLoading = ref(false)
const error = ref('')

const handleRegister = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const response = await fetch('/api/healthcheck-register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: fullName.value,
        email: email.value,
        phone: phone.value || undefined,
        trackingCode: props.trackingCode || undefined,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      error.value = data.error || 'Registration failed'
      isLoading.value = false
      return
    }
    router.visit(`/thank-you?email=${encodeURIComponent(email.value)}`)
  } catch (err) {
    console.error('Registration error:', err)
    error.value = err instanceof Error ? err.message : 'Registration failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>
