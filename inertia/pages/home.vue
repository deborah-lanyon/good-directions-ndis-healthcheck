<template>
  <div class="bg-[#f1ede0] min-h-screen flex flex-col">
    <header>
      <Navigation />
    </header>
    <main class="flex-1">
      <!-- Section 1: Hero -->
      <Container class="mt-8 pb-8">
        <Title :title="siteSettings.heroTitle" styleClass="text-primary" />
        <div class="max-w-3xl mx-auto mt-8 text-center">
          <p class="text-primary font-karla text-2xl leading-relaxed">
            Get a free NDIS Healthcheck to ensure continuity of care when you relocate.
          </p>
        </div>
        <div class="flex justify-center mt-10">
          <a
            href="#register"
            class="px-12 py-4 rounded-full font-caprasimo text-3xl leading-[150%] bg-tertiary text-primary hover:brightness-105 transition"
          >
            Get Your Free Healthcheck
          </a>
        </div>
      </Container>

      <!-- Hero illustration -->
      <div class="-mt-16">
        <Hero />
      </div>

      <!-- Section 2: Pain Points -->
      <section class="bg-white py-20">
        <Container>
          <h2 class="font-caprasimo text-primary text-center text-3xl lg:text-5xl lg:leading-tight mb-16">
            Relocating with complex care needs?
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div class="bg-[#f1ede0] rounded-2xl p-8 text-center">
              <div class="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="font-caprasimo text-primary text-xl mb-3">Gaps in care</h3>
              <p class="font-karla text-primary text-lg leading-relaxed">
                Will therapies and support workers transfer smoothly, or will your family face weeks without essential services?
              </p>
            </div>
            <div class="bg-[#f1ede0] rounded-2xl p-8 text-center">
              <div class="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 class="font-caprasimo text-primary text-xl mb-3">Paperwork overload</h3>
              <p class="font-karla text-primary text-lg leading-relaxed">
                Service agreements, provider handovers, updated plans — the admin burden of relocating with a high-level NDIS plan is enormous.
              </p>
            </div>
            <div class="bg-[#f1ede0] rounded-2xl p-8 text-center">
              <div class="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="font-caprasimo text-primary text-xl mb-3">Fear of the unknown</h3>
              <p class="font-karla text-primary text-lg leading-relaxed">
                Will providers in the new area understand your child's needs? Can you trust that nothing falls through the cracks?
              </p>
            </div>
          </div>
        </Container>
      </section>

      <!-- Section 3: How It Works -->
      <section class="bg-primary py-20">
        <Container>
          <h2 class="font-caprasimo text-tertiary text-center text-3xl lg:text-5xl lg:leading-tight mb-16">
            How the NDIS Healthcheck works
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div class="text-center">
              <div class="w-20 h-20 bg-tertiary rounded-full flex items-center justify-center mx-auto mb-6">
                <span class="font-caprasimo text-primary text-3xl">1</span>
              </div>
              <h3 class="font-caprasimo text-white text-xl mb-3">Request your Healthcheck</h3>
              <p class="font-karla text-secondary text-lg leading-relaxed">
                Fill in your name and email below. We'll be in touch to understand your family's situation and care needs.
              </p>
            </div>
            <div class="text-center">
              <div class="w-20 h-20 bg-tertiary rounded-full flex items-center justify-center mx-auto mb-6">
                <span class="font-caprasimo text-primary text-3xl">2</span>
              </div>
              <h3 class="font-caprasimo text-white text-xl mb-3">We review your plan</h3>
              <p class="font-karla text-secondary text-lg leading-relaxed">
                Our team assesses your current supports, funding, and providers to identify what needs to transition and what gaps may arise.
              </p>
            </div>
            <div class="text-center">
              <div class="w-20 h-20 bg-tertiary rounded-full flex items-center justify-center mx-auto mb-6">
                <span class="font-caprasimo text-primary text-3xl">3</span>
              </div>
              <h3 class="font-caprasimo text-white text-xl mb-3">Move with confidence</h3>
              <p class="font-karla text-secondary text-lg leading-relaxed">
                Receive a clear action plan ensuring continuity of care — therapies, providers, and funding all accounted for.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <!-- Section 4: Benefits -->
      <section class="bg-[#f1ede0] py-20">
        <Container>
          <h2 class="font-caprasimo text-primary text-center text-3xl lg:text-5xl lg:leading-tight mb-12">
            What you get
          </h2>
          <div class="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="benefit in benefits" :key="benefit" class="flex items-start gap-4">
              <div class="w-8 h-8 bg-tertiary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p class="font-karla text-primary text-lg leading-relaxed">{{ benefit }}</p>
            </div>
          </div>
        </Container>
      </section>

      <!-- Section 5: Trust / Reassurance -->
      <section class="bg-tertiary py-20">
        <Container>
          <div class="max-w-3xl mx-auto text-center">
            <h2 class="font-caprasimo text-primary text-3xl lg:text-5xl lg:leading-tight mb-8">
              Because when care is this important, there's no room for disruption.
            </h2>
            <p class="font-karla text-primary text-xl leading-relaxed">
              {{ siteSettings.heroParagraph2 }}
            </p>
          </div>
        </Container>
      </section>

      <!-- Section 6: CTA + Registration Form -->
      <section id="register" class="bg-primary py-20">
        <Container>
          <h2 class="font-caprasimo text-secondary text-center text-3xl lg:text-5xl lg:leading-tight mb-4">
            {{ siteSettings.ctaTitle }}
          </h2>
          <p class="font-karla text-secondary text-center text-xl mb-12 max-w-2xl mx-auto">
            {{ siteSettings.heroParagraph3 }}
          </p>
          <form @submit.prevent="handleRegister" class="grid grid-cols-1 gap-y-6 mx-auto max-w-xl">
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
            <p
              v-if="error"
              class="bg-white rounded-md p-3 text-red-500 text-2xl font-normal leading-[30px] text-center"
            >
              {{ error }}
            </p>
            <div class="flex justify-center mt-8">
              <button
                class="px-16 py-4 rounded-full font-caprasimo text-3xl leading-[150%] bg-tertiary text-primary hover:brightness-105 transition disabled:opacity-50"
                :disabled="isLoading"
                type="submit"
              >
                {{ isLoading ? 'Submitting...' : siteSettings.ctaButtonText }}
              </button>
            </div>
          </form>
        </Container>
      </section>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { router } from '@inertiajs/vue3'
import Navigation from '~/app/components/shared/navigation.vue'
import Hero from '~/app/components/hero.vue'
import Footer from '~/app/components/footer.vue'
import Container from '~/app/components/container.vue'
import Title from '~/app/components/title.vue'
import FormInput from '~/app/components/form-input.vue'

interface SiteSettingsProps {
  heroTitle: string
  heroParagraph1: string
  heroParagraph2: string
  heroParagraph3: string
  ctaTitle: string
  ctaButtonText: string
  heroImageUrl: string | null
}

const props = withDefaults(
  defineProps<{
    siteSettings?: SiteSettingsProps
  }>(),
  {
    siteSettings: () => ({
      heroTitle: 'Moving home? Your NDIS plan moves with you.',
      heroParagraph1:
        'Relocating with a high-level NDIS plan can feel overwhelming — especially when your family depends on 24/7 in-home care for complex disabilities. The NDIS Healthcheck gives you confidence that your supports, funding, and care team will transition smoothly to your new location.',
      heroParagraph2:
        "We help families navigate the details that matter most: continuity of therapies, handover between providers, updated service agreements, and ensuring nothing falls through the cracks during the move.",
      heroParagraph3:
        'Get a free NDIS Healthcheck and take the uncertainty out of your next move.',
      ctaTitle: 'Request Your NDIS Healthcheck Now',
      ctaButtonText: 'Get Started',
      heroImageUrl: null,
    }),
  }
)

const siteSettings = computed(() => props.siteSettings)

const benefits = [
  'Full review of your current NDIS plan and supports',
  'Provider transition checklist for your new location',
  'Gap analysis to prevent service interruptions',
  'Guidance on updating service agreements',
  'Support coordination recommendations',
  'Peace of mind for your family during the move',
]

const fullName = ref('')
const email = ref('')
const isLoading = ref(false)
const error = ref('')

const handleRegister = async () => {
  isLoading.value = true

  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: fullName.value,
        email: email.value,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      error.value = data.message || 'Registration failed'
      isLoading.value = false
      return
    }
    router.visit(`/thank-you?email=${encodeURIComponent(email.value)}`)
  } catch (error) {
    console.error('Registration error:', error)
    error.value = error instanceof Error ? error.message : 'Registration failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>
