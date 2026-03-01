<template>
  <SidebarLayout pageTitle="User Guide" pageSubtitle="Learn how to use the Good Directions NDIS Healthcheck">
    <div class="max-w-4xl">
      <!-- Table of Contents -->
      <div class="bg-white rounded-xl p-6 shadow-sm mb-8">
        <h2 class="font-karla font-semibold text-lg text-gray-800 mb-4">Contents</h2>
        <nav class="space-y-2">
          <a href="#getting-started" class="block text-primary hover:underline font-karla">1. Getting Started</a>
          <a href="#church-profile" class="block text-primary hover:underline font-karla">2. Setting Up Your Organisation Profile</a>
          <a href="#properties" class="block text-primary hover:underline font-karla">3. Understanding Your Properties Dashboard</a>
          <a href="#street-groups" class="block text-primary hover:underline font-karla">4. Managing Street Groups</a>
          <a href="#visitors" class="block text-primary hover:underline font-karla">5. Adding and Managing Team Members</a>
          <a href="#assigning" class="block text-primary hover:underline font-karla">6. Assigning Team Members to Street Groups</a>
          <a href="#notifications" class="block text-primary hover:underline font-karla">7. Understanding Notifications</a>
          <a href="#filters" class="block text-primary hover:underline font-karla">8. Using Filters and Export</a>
        </nav>
      </div>

      <!-- Section 1: Getting Started -->
      <section id="getting-started" class="mb-10">
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-karla font-bold text-lg">
              1
            </div>
            <div class="flex-1">
              <h3 class="font-karla font-semibold text-xl text-gray-800 mb-4">Getting Started</h3>
              <div class="space-y-4 text-gray-600 font-karla leading-relaxed">
                <p>
                  Welcome to the Good Directions NDIS Healthcheck! This platform helps your organisation welcome new residents
                  to your community by tracking recently sold and rented properties in your area.
                </p>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 class="font-semibold text-blue-800 mb-2">How it works:</h4>
                  <ol class="list-decimal list-inside space-y-2 text-blue-700">
                    <li>Set up your organisation profile with your location</li>
                    <li>Properties in your postcode are automatically synced when you log in</li>
                    <li>Create street groups to organise your visiting areas</li>
                    <li>Add team members (visitors) who will welcome new residents</li>
                    <li>Assign team members to street groups</li>
                    <li>Team members receive email notifications when new properties appear on their streets</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 2: Church Profile -->
      <section id="church-profile" class="mb-10">
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-karla font-bold text-lg">
              2
            </div>
            <div class="flex-1">
              <h3 class="font-karla font-semibold text-xl text-gray-800 mb-4">Setting Up Your Organisation Profile</h3>
              <div class="space-y-4 text-gray-600 font-karla leading-relaxed">
                <p>
                  Your organisation profile determines the area where properties will be tracked.
                  Properties within your organisation's postcode will be monitored.
                </p>

                <h4 class="font-semibold text-gray-800 mt-6">To set up your profile:</h4>
                <ol class="list-decimal list-inside space-y-3">
                  <li>Navigate to <strong>Organisation Profile</strong> in the sidebar</li>
                  <li>Click the <strong>Update</strong> button to enable editing</li>
                  <li>Enter your organisation details:
                    <ul class="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li>Organisation Name</li>
                      <li>Organisation Website (optional)</li>
                      <li>Address, Suburb, and Postcode</li>
                    </ul>
                  </li>
                  <li>Click <strong>Look up</strong> to see your location on the map (optional but recommended)</li>
                  <li>Click <strong>Save</strong> to save your profile</li>
                </ol>

                <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                  <h4 class="font-semibold text-amber-800 mb-2">Important:</h4>
                  <p class="text-amber-700">
                    When you save your organisation profile with a new location, properties will automatically
                    sync. You don't need to click "Look up" for the sync to work - it's just for visual
                    confirmation of the location.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 3: Properties Dashboard -->
      <section id="properties" class="mb-10">
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-karla font-bold text-lg">
              3
            </div>
            <div class="flex-1">
              <h3 class="font-karla font-semibold text-xl text-gray-800 mb-4">Understanding Your Properties Dashboard</h3>
              <div class="space-y-4 text-gray-600 font-karla leading-relaxed">
                <p>
                  The Properties page shows all recently sold and rented properties within your organisation's area.
                </p>

                <h4 class="font-semibold text-gray-800 mt-6">Property Information:</h4>
                <ul class="list-disc list-inside space-y-2">
                  <li><strong>Address</strong> - The property location</li>
                  <li><strong>Status</strong> - Whether you've visited (Pending, Visited, Not Home, etc.)</li>
                  <li><strong>Assigned To</strong> - Which team member is responsible</li>
                  <li><strong>Visited Status</strong> - Whether the property has been visited</li>
                  <li><strong>Date</strong> - When the property was sold or rented</li>
                  <li><strong>Type</strong> - Sold or Rented</li>
                </ul>

                <h4 class="font-semibold text-gray-800 mt-6">Property Types:</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h5 class="font-semibold text-green-800">Sold Properties</h5>
                    <p class="text-green-700 text-sm mt-1">
                      Properties that have been sold. These appear when the sale is recorded.
                    </p>
                  </div>
                  <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h5 class="font-semibold text-purple-800">Rental Properties</h5>
                    <p class="text-purple-700 text-sm mt-1">
                      Properties that have been rented. These appear when a rental listing is removed
                      from the market (indicating a lease was signed).
                    </p>
                  </div>
                </div>

                <h4 class="font-semibold text-gray-800 mt-6">Automatic Syncing:</h4>
                <p>
                  Properties are automatically synced:
                </p>
                <ul class="list-disc list-inside space-y-1 mt-2">
                  <li>Once per day when you log in to the portal</li>
                  <li>When you update your organisation profile location</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 4: Street Groups -->
      <section id="street-groups" class="mb-10">
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-karla font-bold text-lg">
              4
            </div>
            <div class="flex-1">
              <h3 class="font-karla font-semibold text-xl text-gray-800 mb-4">Managing Street Groups</h3>
              <div class="space-y-4 text-gray-600 font-karla leading-relaxed">
                <p>
                  Street groups help you organise your visiting areas. You can group streets together
                  and assign team members to specific groups.
                </p>

                <h4 class="font-semibold text-gray-800 mt-6">Creating a Street Group:</h4>
                <ol class="list-decimal list-inside space-y-2">
                  <li>Navigate to <strong>Street Groups</strong> in the sidebar</li>
                  <li>Click <strong>Add Street Group</strong></li>
                  <li>Enter a name for the group (e.g., "North Zone" or "Main Street Area")</li>
                  <li>Add a description (optional)</li>
                  <li>Type street names and click <strong>Add</strong> to include them in the group</li>
                  <li>Click <strong>Create</strong> to save the street group</li>
                </ol>

                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <h4 class="font-semibold text-blue-800 mb-2">Tip:</h4>
                  <p class="text-blue-700">
                    You can add any street name - it doesn't need to have properties synced yet.
                    When properties appear on those streets, they'll automatically be matched to your street group.
                  </p>
                </div>

                <h4 class="font-semibold text-gray-800 mt-6">Editing a Street Group:</h4>
                <ol class="list-decimal list-inside space-y-2">
                  <li>Click on the street group you want to edit</li>
                  <li>Add or remove streets as needed</li>
                  <li>Add or remove assigned team members</li>
                  <li>Click <strong>Save</strong> to update</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 5: Team Members -->
      <section id="visitors" class="mb-10">
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-karla font-bold text-lg">
              5
            </div>
            <div class="flex-1">
              <h3 class="font-karla font-semibold text-xl text-gray-800 mb-4">Adding and Managing Team Members</h3>
              <div class="space-y-4 text-gray-600 font-karla leading-relaxed">
                <p>
                  Team members are the people from your organisation who will visit new residents.
                  They can receive email notifications when new properties appear on their assigned streets.
                </p>

                <h4 class="font-semibold text-gray-800 mt-6">Adding a Team Member:</h4>
                <ol class="list-decimal list-inside space-y-2">
                  <li>Navigate to <strong>Team Members</strong> in the sidebar</li>
                  <li>Click <strong>Add Team Member</strong></li>
                  <li>Enter their details:
                    <ul class="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li>Name (required)</li>
                      <li>Email address (optional - needed for notifications)</li>
                      <li>Phone number (optional)</li>
                    </ul>
                  </li>
                  <li>Click <strong>Create</strong> to add the team member</li>
                </ol>

                <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                  <h4 class="font-semibold text-amber-800 mb-2">Email Notifications:</h4>
                  <p class="text-amber-700">
                    If you want a team member to receive email notifications about new properties,
                    make sure to add their email address. Team members without email addresses won't
                    receive automatic notifications.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 6: Assigning Team Members -->
      <section id="assigning" class="mb-10">
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-karla font-bold text-lg">
              6
            </div>
            <div class="flex-1">
              <h3 class="font-karla font-semibold text-xl text-gray-800 mb-4">Assigning Team Members to Street Groups</h3>
              <div class="space-y-4 text-gray-600 font-karla leading-relaxed">
                <p>
                  Once you've created street groups and added team members, you can assign team members
                  to specific street groups. This determines which properties they're responsible for.
                </p>

                <h4 class="font-semibold text-gray-800 mt-6">To assign a team member:</h4>
                <ol class="list-decimal list-inside space-y-2">
                  <li>Go to <strong>Street Groups</strong></li>
                  <li>Click on the street group you want to assign someone to</li>
                  <li>In the "Assigned Team Members" section, select the team member(s)</li>
                  <li>Click <strong>Save</strong></li>
                </ol>

                <h4 class="font-semibold text-gray-800 mt-6">What happens next:</h4>
                <ul class="list-disc list-inside space-y-2">
                  <li>The team member will appear as "Assigned To" for properties on those streets</li>
                  <li>If they have an email address, they'll receive notifications when new properties appear</li>
                  <li>Team members can also log in to view their assigned properties</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 7: Notifications -->
      <section id="notifications" class="mb-10">
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-karla font-bold text-lg">
              7
            </div>
            <div class="flex-1">
              <h3 class="font-karla font-semibold text-xl text-gray-800 mb-4">Understanding Notifications</h3>
              <div class="space-y-4 text-gray-600 font-karla leading-relaxed">
                <p>
                  The portal sends email notifications to keep everyone informed about new properties.
                </p>

                <h4 class="font-semibold text-gray-800 mt-6">Notification Types:</h4>
                <div class="space-y-4 mt-4">
                  <div class="border border-gray-200 rounded-lg p-4">
                    <h5 class="font-semibold text-gray-800">New Property Notification (Operations Manager)</h5>
                    <p class="text-gray-600 text-sm mt-1">
                      Sent to you when new properties are synced for your organisation.
                    </p>
                  </div>
                  <div class="border border-gray-200 rounded-lg p-4">
                    <h5 class="font-semibold text-gray-800">Property Assignment (Team Members)</h5>
                    <p class="text-gray-600 text-sm mt-1">
                      Sent to team members when new properties appear on streets in their assigned street groups.
                      Includes the property addresses and details.
                    </p>
                  </div>
                </div>

                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <h4 class="font-semibold text-blue-800 mb-2">When are notifications sent?</h4>
                  <ul class="list-disc list-inside text-blue-700 space-y-1">
                    <li>After your first login of the day (when properties sync)</li>
                    <li>After you update your organisation location</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 8: Filters and Export -->
      <section id="filters" class="mb-10">
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-karla font-bold text-lg">
              8
            </div>
            <div class="flex-1">
              <h3 class="font-karla font-semibold text-xl text-gray-800 mb-4">Using Filters and Export</h3>
              <div class="space-y-4 text-gray-600 font-karla leading-relaxed">
                <p>
                  The Properties page includes several filters to help you find specific properties.
                </p>

                <h4 class="font-semibold text-gray-800 mt-6">Available Filters:</h4>
                <ul class="list-disc list-inside space-y-2">
                  <li><strong>Filter (Visited Status)</strong> - Show all, visited only, or not visited</li>
                  <li><strong>Street Group</strong> - Filter by specific street group</li>
                  <li><strong>Visitor</strong> - Filter by assigned team member</li>
                  <li><strong>Type</strong> - Show all, sold only, or rentals only</li>
                  <li><strong>Date Range</strong> - Filter by time period (last day, week, month, or calendar year)</li>
                  <li><strong>Search</strong> - Search by address</li>
                </ul>

                <h4 class="font-semibold text-gray-800 mt-6">Exporting Properties:</h4>
                <ol class="list-decimal list-inside space-y-2">
                  <li>Apply any filters you want (the export will include filtered results)</li>
                  <li>Click the <strong>Export</strong> button</li>
                  <li>A CSV file will download with all the property details</li>
                </ol>

                <h4 class="font-semibold text-gray-800 mt-6">View Options:</h4>
                <ul class="list-disc list-inside space-y-2">
                  <li><strong>List View</strong> - See properties in a table format</li>
                  <li><strong>Map View</strong> - See properties plotted on a map</li>
                </ul>

                <h4 class="font-semibold text-gray-800 mt-6">Route Planning:</h4>
                <p>
                  You can select multiple properties and click <strong>Plan Route</strong> to generate
                  an optimised visiting route.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Need Help Section -->
      <div class="bg-primary/10 rounded-xl p-6 mt-8">
        <h3 class="font-karla font-semibold text-lg text-primary mb-2">Need More Help?</h3>
        <p class="text-gray-600 font-karla">
          If you have questions or need assistance, please visit the
          <a href="/get-in-touch" class="text-primary hover:underline font-semibold">Get in Touch</a>
          page to contact us.
        </p>
      </div>
    </div>
  </SidebarLayout>
</template>

<script setup lang="ts">
import SidebarLayout from '~/app/components/layouts/sidebar-layout.vue'
</script>
