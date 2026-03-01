<template>
  <div class="bg-[#f1ede0] min-h-screen flex flex-col">
    <header>
      <Navbar />
    </header>
    <main class="flex-1">
      <Container class="mt-24">
        <Title title="User rejected successfully" styleClass="text-tertiary" />
        <p
          class="my-10 font-semibold text-center text-primary font-karla text-3xl leading-[150%] max-w-[673px] mx-auto py-10"
        >
          The application has been rejected.
        </p>
      </Container>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Navbar from '~/app/components/navbar.vue'
import Footer from '~/app/components/footer.vue'
import Container from '~/app/components/container.vue'
import Title from '~/app/components/title.vue'
</script>
