<template>
  <div class="bg-[#ffffff] min-h-screen flex flex-col">
    <header>
      <Navbar />
    </header>
    <main class="flex-1">
      <Container class="mt-24">
        <div class="flex justify-center items-center mb-12">
          <Icon name="hero" />
        </div>
        <Title title="You’ve got mail" styleClass="text-tertiary" />
        <p
          class="my-10 font-semibold text-center text-primary font-karla text-3xl leading-[150%] max-w-[673px] mx-auto py-10"
        >
          Thank you for your application, we’ve sent a confirmation email to {{ email }}
        </p>
      </Container>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { router } from '@inertiajs/vue3'
import Navbar from '~/app/components/navbar.vue'
import Footer from '~/app/components/footer.vue'
import Container from '~/app/components/container.vue'
import Title from '~/app/components/title.vue'
import Icon from '~/app/components/icon.vue'
import { usePage } from '@inertiajs/vue3'

const page = usePage()
const email = new URLSearchParams(window.location.search).get('email') || page.props.email

if (!email) {
  router.visit('/')
}
</script>
