<template>
  <div class="bg-[#f1ede0] min-h-screen flex flex-col">
    <header>
      <Navigation />
    </header>
    <main class="flex-1">
      <Container class="mt-24 mb-24">
        <Title :title="content.title" styleClass="text-primary" />

        <div class="max-w-4xl mx-auto mt-12 space-y-6">
          <p
            v-if="content.paragraph1"
            class="text-primary font-karla text-2xl leading-relaxed text-center"
          >
            {{ content.paragraph1 }}
          </p>
          <p
            v-if="content.paragraph2"
            class="text-primary font-karla text-2xl leading-relaxed text-center"
          >
            {{ content.paragraph2 }}
          </p>
          <p
            v-if="content.paragraph3"
            class="text-primary font-karla text-2xl leading-relaxed text-center"
          >
            {{ content.paragraph3 }}
          </p>
        </div>
      </Container>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Navigation from '~/app/components/shared/navigation.vue'
import Footer from '~/app/components/footer.vue'
import Container from '~/app/components/container.vue'
import Title from '~/app/components/title.vue'

interface AboutUsContent {
  title: string
  paragraph1: string
  paragraph2: string
  paragraph3: string
}

const props = withDefaults(
  defineProps<{
    content?: AboutUsContent
  }>(),
  {
    content: () => ({
      title: 'About Us',
      paragraph1:
        'The Good Directions NDIS Healthcheck was created to help churches connect with new residents in their local communities.',
      paragraph2: '',
      paragraph3: '',
    }),
  }
)

const content = computed(() => props.content)
</script>
