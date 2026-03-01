<template>
  <div class="flex flex-col min-h-screen">
    <DashboardNavigation />
    <Container class="py-[70px] grow flex items-center justify-center">
      <div class="max-w-3xl mx-auto text-center px-4">
        <div class="mb-8">
          <h1 class="text-primary font-caprasimo text-4xl md:text-5xl leading-[150%] mb-4">
            Welcome to Good Directions NDIS Healthcheck
          </h1>
          <p class="text-gray-600 text-lg md:text-xl">
            Your portal for managing property visits and welcome packs
          </p>
        </div>

        <Card class="shadow-lg p-8 mb-8">
          <CardHeader>
            <CardTitle class="text-2xl">Get Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <a href="/team-management" class="block">
                <Card
                  class="p-6 bg-blue-50 hover:bg-blue-100 transition-colors border-2 border-blue-200"
                >
                  <div class="flex items-center gap-3 mb-3">
                    <Icon name="users" class="w-6 h-6 text-primary" />
                    <h3 class="text-lg font-semibold text-gray-900">Street Groups</h3>
                  </div>
                  <p class="text-gray-600 text-sm">
                    Manage your street groups and assign streets for property visits
                  </p>
                </Card>
              </a>

              <a href="/amenities" class="block">
                <Card
                  class="p-6 bg-purple-50 hover:bg-purple-100 transition-colors border-2 border-purple-200"
                >
                  <div class="flex items-center gap-3 mb-3">
                    <Icon name="star" class="w-6 h-6 text-purple-600" />
                    <h3 class="text-lg font-semibold text-gray-900">Amenities</h3>
                  </div>
                  <p class="text-gray-600 text-sm">
                    Add local amenities to include in your welcome packs
                  </p>
                </Card>
              </a>

              <a href="/property-list" class="block">
                <Card
                  class="p-6 bg-teal-50 hover:bg-teal-100 transition-colors border-2 border-teal-200"
                >
                  <div class="flex items-center gap-3 mb-3">
                    <Icon name="file-text" class="w-6 h-6 text-teal-600" />
                    <h3 class="text-lg font-semibold text-gray-900">Create Your Welcome Pack</h3>
                  </div>
                  <p class="text-gray-600 text-sm">
                    Design and customise welcome packs for new residents
                  </p>
                </Card>
              </a>

              <a href="/church-profile" class="block">
                <Card
                  class="p-6 bg-orange-50 hover:bg-orange-100 transition-colors border-2 border-orange-200"
                >
                  <div class="flex items-center gap-3 mb-3">
                    <Icon name="settings" class="w-6 h-6 text-orange-600" />
                    <h3 class="text-lg font-semibold text-gray-900">Organisation Profile</h3>
                  </div>
                  <p class="text-gray-600 text-sm">
                    Configure your organisation details and welcome pack template
                  </p>
                </Card>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card class="bg-blue-50 p-6 border-2 border-blue-200">
          <CardHeader>
            <CardTitle class="text-lg">Need to view properties?</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-gray-600 mb-4">
              Use the Street Group or Delivery filters on the Property List page to view properties
            </p>
            <Button as-child class="bg-primary hover:bg-blue-700">
              <a href="/dashboard"> Go to Property List </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </Container>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import DashboardNavigation from '~/app/components/shared/navigation.vue'
import Footer from '~/app/components/footer.vue'
import Container from '~/app/components/container.vue'
import Icon from '~/app/components/icon.vue'
import { Card, CardContent, CardHeader, CardTitle } from '~/app/components/ui/card'
import { Button } from '~/components/ui/button'
</script>
