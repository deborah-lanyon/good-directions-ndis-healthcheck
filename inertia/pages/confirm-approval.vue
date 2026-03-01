<template>
  <div class="bg-[#f1ede0] min-h-screen flex flex-col">
    <header>
      <Navbar />
    </header>
    <main class="flex-1">
      <Container class="mt-24">
        <!-- Error state -->
        <template v-if="error">
          <Title title="Unable to process" styleClass="text-tertiary" />
          <p
            class="my-10 font-semibold text-center text-primary font-karla text-xl leading-[150%] max-w-[673px] mx-auto"
          >
            {{ error }}
          </p>
        </template>

        <!-- Confirmation state -->
        <template v-else>
          <Title
            :title="action === 'approve' ? 'Confirm User Approval' : 'Confirm User Rejection'"
            styleClass="text-tertiary"
          />
          <div class="max-w-[673px] mx-auto text-center my-10">
            <p class="font-semibold text-primary font-karla text-xl leading-[150%] mb-2">
              {{ userName }}
            </p>
            <p class="text-primary font-karla text-lg leading-[150%] mb-8">
              {{ userEmail }}
            </p>
            <p class="text-primary font-karla text-lg leading-[150%] mb-8">
              {{
                action === 'approve'
                  ? 'Click the button below to approve this user. They will receive an email to set up their password.'
                  : 'Click the button below to reject this application.'
              }}
            </p>
            <button
              @click="handleConfirm"
              :disabled="submitting"
              :class="[
                'inline-block px-16 py-3 font-semibold text-[#ffffff] text-xl rounded-full transition-opacity',
                action === 'approve' ? 'bg-[#6d3b90] hover:opacity-90' : 'bg-[#FDAF18] hover:opacity-90',
                submitting ? 'opacity-50 cursor-not-allowed' : '',
              ]"
            >
              {{ submitting ? 'Processing...' : action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection' }}
            </button>
          </div>
        </template>
      </Container>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { router } from '@inertiajs/vue3'
import Navbar from '~/app/components/navbar.vue'
import Footer from '~/app/components/footer.vue'
import Container from '~/app/components/container.vue'
import Title from '~/app/components/title.vue'

const props = defineProps<{
  action: 'approve' | 'reject'
  token: string
  userName?: string
  userEmail?: string
  error?: string
}>()

const submitting = ref(false)

function handleConfirm() {
  submitting.value = true
  const url =
    props.action === 'approve' ? '/api/admin/approve-user' : '/api/admin/reject-user'
  router.post(url, { token: props.token }, {
    onError: () => {
      submitting.value = false
    },
  })
}
</script>
