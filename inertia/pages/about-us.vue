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
          <p
            v-if="content.paragraph4"
            class="text-primary font-karla text-2xl leading-relaxed text-center"
          >
            {{ content.paragraph4 }}
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
  paragraph4: string
}

const props = withDefaults(
  defineProps<{
    content?: AboutUsContent
  }>(),
  {
    content: () => ({
      title: 'About Us',
      paragraph1:
        'Good Directions is an established registered NDIS Service Provider set up to allow participants to develop and maintain 100% person centred supports.',
      paragraph2:
        'Our vision is to apply our model of Good Directions Participant-owned Disability Service Provider and continually find new ways for participants to own and manage more of their personal resources. We do this through a \'shared management\' approach that enables people to live their lives in a way that they choose, with the right support.',
      paragraph3:
        'Good Directions Participant-Owned Disability Service model has earned very high accolades. Recent Quality Assurance Audits (QAA) have awarded Good Directions with four best practice areas, and described Good Directions as \'taking choice and control to the next level\'.',
      paragraph4:
        'If you have high support needs \u2013 and you or your family are interested in true choice and control \u2013 Good Directions will provide you with a level of support that is unmatched in the sector and that will exceed your expectations.',
    }),
  }
)

const content = computed(() => props.content)
</script>
