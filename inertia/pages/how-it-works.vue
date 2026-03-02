<template>
  <div class="bg-[#f1ede0] min-h-screen flex flex-col">
    <header>
      <Navigation />
    </header>
    <main class="flex-1">
      <Container class="mt-24 mb-24">
        <Title title="How It Works" styleClass="text-primary" />

        <div class="max-w-4xl mx-auto mt-12">
          <!-- Introduction -->
          <p class="text-primary font-karla text-2xl leading-relaxed mb-12 text-center">
            Good Directions NDIS Healthcheck makes it easy for your territory to welcome new residents
            to your neighbourhood. Here's how it works.
          </p>

          <!-- Steps -->
          <div class="space-y-8">
            <!-- Step 1: Register Your Territory -->
            <div class="bg-white rounded-2xl p-8 shadow-sm">
              <div class="flex items-start gap-6">
                <div
                  class="flex-shrink-0 w-12 h-12 bg-primary text-secondary rounded-full flex items-center justify-center font-caprasimo text-2xl"
                >
                  1
                </div>
                <div>
                  <h3 class="font-caprasimo text-2xl text-primary mb-3">Register Your Territory</h3>
                  <p class="text-primary font-karla text-lg leading-relaxed">
                    Sign up for a free account and set up your territory profile with your location.
                    Once approved, the portal will automatically track properties in your area
                    that have recently been sold or rented.
                  </p>
                </div>
              </div>
            </div>

            <!-- Step 2: Properties Sync Automatically -->
            <div class="bg-white rounded-2xl p-8 shadow-sm">
              <div class="flex items-start gap-6">
                <div
                  class="flex-shrink-0 w-12 h-12 bg-primary text-secondary rounded-full flex items-center justify-center font-caprasimo text-2xl"
                >
                  2
                </div>
                <div>
                  <h3 class="font-caprasimo text-2xl text-primary mb-3">Properties Sync Automatically</h3>
                  <p class="text-primary font-karla text-lg leading-relaxed">
                    Each time you log in, the portal syncs the latest property sales and rental
                    listings in your postcode. You'll see a dashboard of new residents waiting
                    to be welcomed to your community.
                  </p>
                </div>
              </div>
            </div>

            <!-- Step 3: Organise Your Team -->
            <div class="bg-white rounded-2xl p-8 shadow-sm">
              <div class="flex items-start gap-6">
                <div
                  class="flex-shrink-0 w-12 h-12 bg-primary text-secondary rounded-full flex items-center justify-center font-caprasimo text-2xl"
                >
                  3
                </div>
                <div>
                  <h3 class="font-caprasimo text-2xl text-primary mb-3">Organise Your Team</h3>
                  <p class="text-primary font-karla text-lg leading-relaxed">
                    Create street groups to divide your area into manageable visiting zones.
                    Add team members from your territory and assign them to specific street groups.
                    Each team member gets their own login to see their assigned properties.
                  </p>
                </div>
              </div>
            </div>

            <!-- Step 4: Visit and Welcome -->
            <div class="bg-white rounded-2xl p-8 shadow-sm">
              <div class="flex items-start gap-6">
                <div
                  class="flex-shrink-0 w-12 h-12 bg-primary text-secondary rounded-full flex items-center justify-center font-caprasimo text-2xl"
                >
                  4
                </div>
                <div>
                  <h3 class="font-caprasimo text-2xl text-primary mb-3">Visit and Welcome</h3>
                  <p class="text-primary font-karla text-lg leading-relaxed">
                    Team members visit properties and record their interactions. They can mark
                    properties as visited, leave notes, and track outcomes. Use the route
                    planner to create efficient visiting routes with Google Maps integration.
                  </p>
                </div>
              </div>
            </div>

            <!-- Step 5: Track Progress -->
            <div class="bg-white rounded-2xl p-8 shadow-sm">
              <div class="flex items-start gap-6">
                <div
                  class="flex-shrink-0 w-12 h-12 bg-primary text-secondary rounded-full flex items-center justify-center font-caprasimo text-2xl"
                >
                  5
                </div>
                <div>
                  <h3 class="font-caprasimo text-2xl text-primary mb-3">Track Your Progress</h3>
                  <p class="text-primary font-karla text-lg leading-relaxed">
                    View analytics to see how your outreach is going. Track how many properties
                    have been visited, monitor team activity, and export reports. Everything
                    you need to manage your community welcome program in one place.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Features Highlight -->
          <div class="mt-16">
            <h2 class="font-caprasimo text-3xl text-primary mb-8 text-center">Key Features</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-white rounded-xl p-6 shadow-sm">
                <div class="flex items-center gap-3 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <h4 class="font-karla font-semibold text-lg text-primary">Automatic Property Sync</h4>
                </div>
                <p class="text-primary/80 font-karla">
                  Properties are automatically imported from real estate listings daily.
                </p>
              </div>

              <div class="bg-white rounded-xl p-6 shadow-sm">
                <div class="flex items-center gap-3 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h4 class="font-karla font-semibold text-lg text-primary">Team Management</h4>
                </div>
                <p class="text-primary/80 font-karla">
                  Add team members, assign them to areas, and track their visiting progress.
                </p>
              </div>

              <div class="bg-white rounded-xl p-6 shadow-sm">
                <div class="flex items-center gap-3 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <h4 class="font-karla font-semibold text-lg text-primary">Route Planning</h4>
                </div>
                <p class="text-primary/80 font-karla">
                  Generate optimised visiting routes and open them directly in Google Maps.
                </p>
              </div>

              <div class="bg-white rounded-xl p-6 shadow-sm">
                <div class="flex items-center gap-3 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h4 class="font-karla font-semibold text-lg text-primary">Analytics & Reports</h4>
                </div>
                <p class="text-primary/80 font-karla">
                  Track visits, view statistics, and export data for your records.
                </p>
              </div>
            </div>
          </div>

          <!-- CTA -->
          <div class="mt-16 text-center">
            <p class="text-primary font-karla text-xl mb-6">
              Ready to start welcoming new residents to your community?
            </p>
            <a
              href="/register"
              class="inline-block px-12 py-4 rounded-full font-caprasimo text-2xl bg-primary text-secondary hover:opacity-90 transition-opacity"
            >
              Get Started Free
            </a>
            <p class="text-primary/60 font-karla text-sm mt-4">
              No credit card required. Free for territories.
            </p>
          </div>
        </div>
      </Container>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Navigation from '~/app/components/shared/navigation.vue'
import Footer from '~/app/components/footer.vue'
import Container from '~/app/components/container.vue'
import Title from '~/app/components/title.vue'
</script>
