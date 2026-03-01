<template>
  <div class="space-y-6 mt-4">
    <!-- Main Heading -->
    <div class="bg-white rounded-lg p-6">
      <h1 class="text-2xl font-semibold text-gray-900">Welcome Pack Template</h1>
      <p class="text-gray-600 mt-2">
        Follow these simple steps to create your personalised welcome pack. The local amenities you
        added in your profile will be automatically included when you save the template.
      </p>
    </div>

    <!-- Step 1: Choose Template Design -->
    <Card>
      <CardContent class="pt-6">
        <div class="flex items-start gap-3 mb-4">
          <div
            class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm"
          >
            1
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 text-lg">Choose your Template Design</h3>
            <p class="text-sm text-gray-600 mt-1">
              Select from our professionally designed templates below
            </p>
          </div>
        </div>

        <!-- Template Previews -->
        <div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Minimal & Clean Template -->
            <div
              :class="[
                'group bg-white border-2 rounded-lg overflow-hidden hover:border-blue-500 transition-all',
                form.templateDesign === 'default' && templates.minimal.templateDesign === 'default'
                  ? 'border-blue-600 ring-2 ring-blue-200'
                  : 'border-gray-200',
              ]"
            >
              <div class="aspect-[3/4] bg-white p-6 border-b border-gray-200">
                <!-- Minimal Template Visual -->
                <div class="h-full flex flex-col space-y-3">
                  <div class="w-16 h-16 bg-gray-300 rounded-full mx-auto"></div>
                  <div class="text-center space-y-2 flex-1">
                    <div class="h-3 bg-gray-800 rounded w-3/4 mx-auto"></div>
                    <div class="h-2 bg-gray-400 rounded w-full"></div>
                    <div class="h-2 bg-gray-400 rounded w-5/6 mx-auto"></div>
                    <div class="space-y-1 mt-4">
                      <div class="h-2 bg-gray-300 rounded w-full"></div>
                      <div class="h-2 bg-gray-300 rounded w-4/5 mx-auto"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="p-4">
                <h5 class="font-semibold text-sm text-gray-900 group-hover:text-blue-600">
                  Minimal & Clean
                </h5>
                <p class="text-xs text-gray-500 mt-1 mb-3">Simple, professional layout</p>
                <div class="flex gap-2">
                  <button
                    type="button"
                    @click="applyTemplate('minimal')"
                    class="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                  >
                    Use Template
                  </button>
                  <button
                    type="button"
                    @click="previewTemplate('minimal')"
                    class="px-3 py-1.5 text-blue-600 text-xs hover:underline"
                  >
                    View this Template
                  </button>
                </div>
              </div>
            </div>

            <!-- Magazine/Property Template -->
            <div
              :class="[
                'group bg-white border-2 rounded-lg overflow-hidden hover:border-blue-500 transition-all',
                form.templateDesign === 'magazine'
                  ? 'border-blue-600 ring-2 ring-blue-200'
                  : 'border-gray-200',
              ]"
            >
              <div
                class="aspect-[3/4] bg-gradient-to-b from-emerald-200 to-emerald-100 p-6 border-b border-gray-200 relative"
              >
                <!-- Magazine Template Visual -->
                <div class="h-full flex flex-col">
                  <!-- Large "Welcome" title -->
                  <div class="bg-emerald-600 text-white text-center py-4 mb-4">
                    <div class="text-xl font-serif">Welcome</div>
                  </div>
                  <!-- Content box -->
                  <div class="bg-white p-3 shadow-md flex-1">
                    <div class="h-2 bg-gray-800 rounded w-3/4 mb-2"></div>
                    <div class="h-1 bg-gray-400 rounded w-full mb-1"></div>
                    <div class="h-1 bg-gray-400 rounded w-5/6 mb-1"></div>
                    <div class="h-1 bg-gray-400 rounded w-full"></div>
                  </div>
                  <!-- Property details bar -->
                  <div class="grid grid-cols-4 gap-1 mt-2">
                    <div class="h-6 bg-gray-200 rounded-sm"></div>
                    <div class="h-6 bg-gray-200 rounded-sm"></div>
                    <div class="h-6 bg-gray-200 rounded-sm"></div>
                    <div class="h-6 bg-gray-200 rounded-sm"></div>
                  </div>
                </div>
              </div>
              <div class="p-4">
                <h5 class="font-semibold text-sm text-gray-900 group-hover:text-blue-600">
                  Magazine Style
                </h5>
                <p class="text-xs text-gray-500 mt-1 mb-3">Editorial property layout</p>
                <div class="flex gap-2">
                  <button
                    type="button"
                    @click="applyTemplate('magazine')"
                    class="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                  >
                    Use Template
                  </button>
                  <button
                    type="button"
                    @click="previewTemplate('magazine')"
                    class="px-3 py-1.5 text-blue-600 text-xs hover:underline"
                  >
                    View this Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Step 2, 3: Logo, Banner, Brand Colors -->
    <Card>
      <CardContent class="pt-6">
        <form @submit.prevent="saveTemplate" class="space-y-12">
          <!-- Step 2: Add Your Logo and Banner Image -->
          <div>
            <div class="flex items-start gap-3 mb-4">
              <div
                class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm"
              >
                2
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 text-lg">Add Your Logo and Banner Image</h3>
                <p class="text-sm text-gray-600 mt-1">
                  Upload your church or organization logo and choose a welcoming header image that
                  represents your community
                </p>
              </div>
            </div>
          </div>

          <!-- Branding Section (Logo, Banner uploads) -->
          <WelcomePackSettings />

          <!-- Step 3: Add or Select Your Brand Colours -->
          <div>
            <div class="flex items-start gap-3 mb-4">
              <div
                class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm"
              >
                3
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 text-lg">
                  Add or Select Your Brand Colours
                </h3>
                <p class="text-sm text-gray-600 mt-1">
                  Customize the color scheme to match your branding
                </p>
              </div>
            </div>

            <!-- Brand Colour Selectors -->
            <div class="grid grid-cols-2 gap-6 mt-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                <div class="flex items-center gap-3">
                  <input
                    type="color"
                    v-model="form.primaryColor"
                    class="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    v-model="form.primaryColor"
                    class="px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                <div class="flex items-center gap-3">
                  <input
                    type="color"
                    v-model="form.secondaryColor"
                    class="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    v-model="form.secondaryColor"
                    class="px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Step 4: Provide Copy for Your Welcome Message -->
          <div>
            <div class="flex items-start gap-3 mb-4">
              <div
                class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm"
              >
                4
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 text-lg">
                  Provide Copy for Your Welcome Message
                </h3>
                <p class="text-sm text-gray-600 mt-1">
                  Write a warm greeting to welcome new residents to the neighborhood. This message
                  will appear at the top of the welcome pack.
                </p>
              </div>
            </div>

            <label for="welcomeMessage" class="block text-sm font-medium text-gray-700 mb-2">
              Welcome Message
            </label>
            <RichTextEditor
              v-model="form.welcomeMessage"
              placeholder="Enter your welcome message to new residents..."
            />

            <!-- About our Community -->
            <div class="mt-6">
              <label for="aboutCommunity" class="block text-sm font-medium text-gray-700 mb-2">
                About our Community
              </label>
              <p class="text-xs text-gray-500 mb-3">
                This text will appear below the welcome message on the first page
              </p>
              <RichTextEditor
                v-model="form.aboutCommunity"
                placeholder="What makes this neighborhood special: • Close-knit community with regular social events • Beautiful parks and green spaces..."
              />
            </div>
          </div>

          <!-- Step 5: Provide Text for Your About Us Page and Upload a Supporting Image -->
          <div>
            <div class="flex items-start gap-3 mb-4">
              <div
                class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm"
              >
                5
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 text-lg">
                  Provide Text for Your About Us Page and Upload a Supporting Image
                </h3>
                <p class="text-sm text-gray-600 mt-1">
                  Tell your story and share what makes your community special
                </p>
              </div>
            </div>

            <!-- About Us Text -->
            <label for="churchInfo" class="block text-sm font-medium text-gray-700 mb-2">
              About Us
            </label>
            <RichTextEditor
              v-model="form.churchInfo"
              placeholder="Tell residents about your church, services, and how they can get involved..."
            />

            <!-- About Us Image Upload -->
            <div class="border border-gray-300 rounded-lg p-4 mt-4">
              <p class="text-sm font-medium text-gray-700 mb-3">About Us Image</p>
              <div v-if="aboutUsImageUrl" class="flex flex-col gap-4 mb-4">
                <img
                  :src="aboutUsImageUrl"
                  alt="About Us"
                  class="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  @click="deleteAboutUsImage"
                  :disabled="isDeletingAboutUsImage"
                  class="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg disabled:opacity-50 w-fit"
                >
                  {{ isDeletingAboutUsImage ? 'Deleting...' : 'Remove Image' }}
                </button>
              </div>
              <div v-else class="space-y-2 mb-4">
                <p class="text-sm text-gray-600">
                  No image uploaded. Upload a PNG, JPG, WebP, or GIF file (max 5MB).
                </p>
                <div class="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded p-2">
                  <strong>Recommended:</strong> 1200-1600px wide × 300-400px tall (landscape, 4:1 or
                  16:5 aspect ratio)
                </div>
              </div>
              <label
                class="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition"
              >
                <span class="text-sm text-gray-600">
                  {{ uploadingAboutUsImage ? 'Uploading...' : 'Click to upload image' }}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  @change="uploadAboutUsImage"
                  :disabled="uploadingAboutUsImage"
                  class="hidden"
                />
              </label>
              <div v-if="aboutUsImageError" class="text-sm text-red-600 mt-2">
                {{ aboutUsImageError }}
              </div>
            </div>
          </div>

          <!-- Step 6: Church Services and Other Information -->
          <div>
            <div class="flex items-start gap-3 mb-4">
              <div
                class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm"
              >
                6
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 text-lg">
                  Church Services and Contact Information
                </h3>
                <p class="text-sm text-gray-600 mt-1">
                  Provide details about your church services and contact information
                </p>
              </div>
            </div>

            <!-- Church Services -->
            <div class="mb-6">
              <div class="flex items-center justify-between mb-4">
                <h4 class="text-sm font-medium text-gray-700">Church Services</h4>
                <button
                  type="button"
                  @click="addService"
                  class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Add Service
                </button>
              </div>

              <!-- Service Blocks -->
              <div
                v-if="churchServices.length === 0"
                class="text-sm text-gray-500 text-center py-8 border-2 border-dashed border-gray-300 rounded-lg"
              >
                No services added yet. Click "Add Service" to get started.
              </div>

              <div class="space-y-4">
                <div
                  v-for="(service, index) in churchServices"
                  :key="index"
                  class="border border-gray-300 rounded-lg p-4 bg-gray-50"
                >
                  <div class="flex items-center justify-between mb-3">
                    <h5 class="text-sm font-medium text-gray-700">Service {{ index + 1 }}</h5>
                    <button
                      type="button"
                      @click="removeService(index)"
                      class="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <div class="space-y-3">
                    <!-- Name of Service -->
                    <div>
                      <label
                        :for="`serviceName-${index}`"
                        class="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Name of Service
                      </label>
                      <input
                        type="text"
                        :id="`serviceName-${index}`"
                        v-model="service.name"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                        placeholder="e.g., Sunday Worship, Bible Study"
                      />
                    </div>

                    <!-- Day/s of Service -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Day/s of Service
                      </label>
                      <div class="grid grid-cols-7 gap-1">
                        <label
                          v-for="day in daysOfWeek"
                          :key="day.value"
                          class="flex items-center justify-center"
                        >
                          <input
                            type="checkbox"
                            :value="day.value"
                            v-model="service.days"
                            class="sr-only peer"
                          />
                          <div
                            class="w-full px-2 py-1.5 text-center text-xs border border-gray-300 rounded cursor-pointer peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 hover:bg-gray-50"
                          >
                            {{ day.label }}
                          </div>
                        </label>
                      </div>
                    </div>

                    <!-- Time of Service -->
                    <div>
                      <label
                        :for="`serviceTime-${index}`"
                        class="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Time of Service
                      </label>
                      <input
                        type="time"
                        :id="`serviceTime-${index}`"
                        v-model="service.time"
                        step="1800"
                        class="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Contact Information -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Contact Information</h4>
              <p class="text-xs text-gray-500 mb-4">
                This information will appear on the About page below Church Services
              </p>

              <div class="space-y-4">
                <!-- Address -->
                <div>
                  <label for="contactAddress" class="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    id="contactAddress"
                    v-model="form.contactAddress"
                    rows="2"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    placeholder="e.g., 123 Main Street, Sydney NSW 2000"
                  ></textarea>
                </div>

                <!-- Email -->
                <div>
                  <label for="contactEmail" class="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    v-model="form.contactEmail"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    placeholder="e.g., contact@church.org.au"
                  />
                </div>

                <!-- Phone -->
                <div>
                  <label for="contactPhone" class="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="contactPhone"
                    v-model="form.contactPhone"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    placeholder="e.g., (02) 1234 5678"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Step 7: Additional Page Images -->
          <div>
            <div class="flex items-start gap-3 mb-4">
              <div
                class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm"
              >
                7
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 text-lg">Additional Page Images</h3>
                <p class="text-sm text-gray-600 mt-1">
                  Upload images for the Getting Around, Community Services, and Things to Do pages
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Getting Around Image -->
              <ImageUpload
                label="Getting Around"
                :image-url="gettingAroundImageUrl"
                image-type="gettingAround"
                recommended-size="1200x800px (landscape, 3:2 aspect ratio)"
                @upload-success="handleGettingAroundImageUpload"
                @delete-success="handleGettingAroundImageDelete"
              />

              <!-- Community Services Image -->
              <ImageUpload
                label="Community Services"
                :image-url="communityServicesImageUrl"
                image-type="communityServices"
                recommended-size="1200x800px (landscape, 3:2 aspect ratio)"
                @upload-success="handleCommunityServicesImageUpload"
                @delete-success="handleCommunityServicesImageDelete"
              />

              <!-- Things to Do Image -->
              <ImageUpload
                label="Things to Do"
                :image-url="thingsToDoImageUrl"
                image-type="thingsToDo"
                recommended-size="1200x800px (landscape, 3:2 aspect ratio)"
                @upload-success="handleThingsToDoImageUpload"
                @delete-success="handleThingsToDoImageDelete"
              />
            </div>
          </div>

          <!-- Include Amenities -->
          <div class="flex items-center">
            <input
              type="checkbox"
              id="includeAmenities"
              v-model="form.includeAmenities"
              class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label for="includeAmenities" class="ml-2 block text-sm text-gray-700">
              Include nearby amenities in welcome packs
            </label>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-4 pt-4">
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 bg-tertiary hover:bg-[#e59a00] text-white rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              {{ saving ? 'Saving...' : 'Save Template' }}
            </button>
            <button
              type="button"
              @click="loadAndShowPreview"
              :disabled="loadingPreview"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {{ loadingPreview ? 'Loading Preview...' : 'Preview Your Welcome Pack' }}
            </button>
          </div>

          <!-- Success Message -->
          <div
            v-if="successMessage"
            class="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800"
          >
            {{ successMessage }}
          </div>

          <!-- Error Message -->
          <div
            v-if="errorMessage"
            class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800"
          >
            {{ errorMessage }}
          </div>
        </form>
      </CardContent>
    </Card>

    <!-- Preview Modal -->
    <Dialog
      :open="showPreview"
      @update:open="
        (open) => {
          if (!open) {
            showPreview = false
            previewTemplateType = null
            previewHtml = ''
          }
        }
      "
    >
      <DialogContent class="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader v-if="!previewHtml">
          <DialogTitle class="text-2xl">{{ previewTitle }}</DialogTitle>
        </DialogHeader>

        <div class="space-y-6 py-4">
          <!-- Loading State -->
          <div v-if="loadingPreview" class="flex items-center justify-center py-12">
            <div class="text-center">
              <div
                class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
              ></div>
              <p class="mt-4 text-gray-600">Loading Magazine template preview...</p>
            </div>
          </div>

          <!-- Generated HTML Preview -->
          <div
            v-else-if="previewHtml"
            v-html="previewHtml"
            class="bg-white border border-gray-200 rounded overflow-hidden"
          ></div>

          <!-- Old Preview Content (only shown for template previews) -->
          <div v-else-if="previewTemplateType" class="space-y-6">
            <!-- Preview Content - Matches production HTML template exactly -->
            <div
              class="bg-white border border-gray-200 rounded overflow-hidden"
              style="
                font-family:
                  Inter,
                  -apple-system,
                  BlinkMacSystemFont,
                  'Segoe UI',
                  sans-serif;
                line-height: 1.6;
                color: #2d3748;
              "
            >
              <!-- Header with Banner and Logo (matches production) -->
              <div
                class="header"
                :style="{
                  background: `linear-gradient(135deg, ${branding.primaryColor} 0%, #0041a3 100%)`,
                  color: 'white',
                  textAlign: 'center',
                }"
              >
                <!-- Banner at top (outside padding) -->
                <img
                  v-if="branding.bannerUrl"
                  :src="branding.bannerUrl"
                  alt="Banner"
                  style="
                    width: 100%;
                    max-height: 200px;
                    object-fit: cover;
                    display: block;
                    margin: 0;
                  "
                />

                <!-- Header content with logo and title -->
                <div style="padding: 40px">
                  <img
                    v-if="branding.logoUrl"
                    :src="branding.logoUrl"
                    alt="Logo"
                    style="max-height: 150px; margin-bottom: 20px; display: inline-block"
                  />
                  <h1
                    style="
                      font-family: 'Caprasimo', cursive;
                      font-size: 42px;
                      font-weight: 400;
                      margin-bottom: 20px;
                      letter-spacing: -0.5px;
                    "
                  >
                    Welcome to Your New Home
                  </h1>
                  <div
                    style="font-size: 18px; opacity: 0.95; margin-bottom: 10px; font-weight: 500"
                  >
                    123 Sample Street
                  </div>
                  <div style="font-size: 14px; opacity: 0.85">
                    {{
                      new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    }}
                  </div>
                </div>
              </div>

              <!-- Main Content Area -->
              <div style="padding: 40px">
                <!-- Welcome Message Section -->
                <div v-if="previewContent.welcomeMessage" style="margin-bottom: 40px">
                  <h2
                    :style="{
                      fontFamily: 'Caprasimo, cursive',
                      fontSize: '28px',
                      fontWeight: '400',
                      color: branding.primaryColor,
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      paddingBottom: '15px',
                      borderBottom: `3px solid ${branding.secondaryColor}`,
                    }"
                  >
                    Welcome Message
                  </h2>
                  <div style="color: #4a5568; line-height: 1.8">
                    <p style="margin-bottom: 15px; white-space: pre-wrap">
                      {{ previewContent.welcomeMessage }}
                    </p>
                  </div>
                </div>

                <!-- Church Info Section -->
                <div v-if="previewContent.churchInfo" style="margin-bottom: 40px">
                  <h2
                    :style="{
                      fontFamily: 'Caprasimo, cursive',
                      fontSize: '28px',
                      fontWeight: '400',
                      color: branding.primaryColor,
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      paddingBottom: '15px',
                      borderBottom: `3px solid ${branding.secondaryColor}`,
                    }"
                  >
                    About Your Organisation
                  </h2>
                  <div
                    :style="{
                      background: '#f8f9fa',
                      borderLeft: `4px solid ${branding.secondaryColor}`,
                      padding: '20px',
                      borderRadius: '4px',
                      margin: '15px 0',
                    }"
                  >
                    <div style="color: #4a5568; line-height: 1.8">
                      <p style="margin-bottom: 15px; white-space: pre-wrap">
                        {{ previewContent.churchInfo }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Custom Content Section -->
                <div v-if="previewContent.customContent" style="margin-bottom: 40px">
                  <h2
                    :style="{
                      fontFamily: 'Caprasimo, cursive',
                      fontSize: '28px',
                      fontWeight: '400',
                      color: branding.primaryColor,
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      paddingBottom: '15px',
                      borderBottom: `3px solid ${branding.secondaryColor}`,
                    }"
                  >
                    Additional Information
                  </h2>
                  <div style="color: #4a5568; line-height: 1.8">
                    <p style="margin-bottom: 15px; white-space: pre-wrap">
                      {{ previewContent.customContent }}
                    </p>
                  </div>
                </div>

                <!-- Amenities Section (placeholder) -->
                <div v-if="previewContent.includeAmenities" style="margin-bottom: 40px">
                  <h2
                    :style="{
                      fontFamily: 'Caprasimo, cursive',
                      fontSize: '28px',
                      fontWeight: '400',
                      color: branding.primaryColor,
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      paddingBottom: '15px',
                      borderBottom: `3px solid ${branding.secondaryColor}`,
                    }"
                  >
                    Local Amenities
                  </h2>
                  <p style="color: #718096; margin-bottom: 20px">
                    Here are some useful places near your new home:
                  </p>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px">
                    <div
                      style="
                        background: white;
                        border: 1px solid #e0e0e0;
                        border-radius: 6px;
                        padding: 14px;
                      "
                    >
                      <div
                        style="
                          font-family: 'Karla', sans-serif;
                          font-weight: 600;
                          color: #2d3748;
                          font-size: 14px;
                          margin-bottom: 6px;
                        "
                      >
                        Sample School
                      </div>
                      <div style="color: #718096; font-size: 12px">123 Education St</div>
                    </div>
                    <div
                      style="
                        background: white;
                        border: 1px solid #e0e0e0;
                        border-radius: 6px;
                        padding: 14px;
                      "
                    >
                      <div
                        style="
                          font-family: 'Karla', sans-serif;
                          font-weight: 600;
                          color: #2d3748;
                          font-size: 14px;
                          margin-bottom: 6px;
                        "
                      >
                        Community Park
                      </div>
                      <div style="color: #718096; font-size: 12px">456 Park Ave</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div
                style="
                  background: #f8f9fa;
                  border-top: 2px solid #e0e0e0;
                  padding: 30px 40px;
                  text-align: center;
                  color: #718096;
                  font-size: 13px;
                  margin-top: 50px;
                "
              >
                <div
                  :style="{
                    fontSize: '14px',
                    color: branding.primaryColor,
                    fontWeight: '500',
                    marginBottom: '8px',
                  }"
                >
                  We're here to help you settle into your new community!
                </div>
                <div style="font-size: 12px; color: #a0aec0">
                  Welcome Pack generated by Your Organisation
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                @click="showPreview = false; previewTemplateType = null; previewHtml = ''"
                class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/app/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/app/components/ui/dialog'
import WelcomePackSettings from '~/app/components/WelcomePackSettings.vue'
import RichTextEditor from '~/app/components/ui/rich-text-editor.vue'
import ImageUpload from '~/app/components/ui/image-upload.vue'

const form = ref({
  name: 'Default Template',
  welcomeMessage: '',
  aboutCommunity: '',
  churchInfo: '',
  customContent: '',
  contactAddress: '',
  contactEmail: '',
  contactPhone: '',
  primaryColor: '#94b4af',
  secondaryColor: '#566874',
  includeAmenities: true,
  templateDesign: 'default',
})

const daysOfWeek = [
  { label: 'Mon', value: 'monday' },
  { label: 'Tue', value: 'tuesday' },
  { label: 'Wed', value: 'wednesday' },
  { label: 'Thu', value: 'thursday' },
  { label: 'Fri', value: 'friday' },
  { label: 'Sat', value: 'saturday' },
  { label: 'Sun', value: 'sunday' },
]

// Church Services - Array of service objects
const churchServices = ref<Array<{ name: string; days: string[]; time: string }>>([])

const addService = () => {
  churchServices.value.push({
    name: '',
    days: [],
    time: '',
  })
}

const removeService = (index: number) => {
  churchServices.value.splice(index, 1)
}

const saving = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const showPreview = ref(false)
const previewTemplateType = ref<'minimal' | 'community' | 'modern' | 'magazine' | null>(null)
const previewHtml = ref('')
const loadingPreview = ref(false)

// About Us Image Upload
const aboutUsImageUrl = ref<string | undefined>(undefined)
const uploadingAboutUsImage = ref(false)
const isDeletingAboutUsImage = ref(false)
const aboutUsImageError = ref('')

// Additional Page Images
const gettingAroundImageUrl = ref<string | undefined>(undefined)
const communityServicesImageUrl = ref<string | undefined>(undefined)
const thingsToDoImageUrl = ref<string | undefined>(undefined)

// Branding settings
const branding = ref({
  logoUrl: undefined as string | undefined,
  bannerUrl: undefined as string | undefined,
  primaryColor: '#94b4af',
  secondaryColor: '#566874',
})

// Template presets
const templates = {
  minimal: {
    name: 'Minimal & Clean',
    welcomeMessage:
      "Welcome to your new home! We're delighted to have you as part of our community.",
    churchInfo: "Our church offers weekly services and community events. We'd love to meet you!",
    customContent: 'For any questions or assistance, feel free to reach out to our community team.',
    includeAmenities: true,
    templateDesign: 'default',
  },
  community: {
    name: 'Community Focused',
    welcomeMessage:
      "A warm welcome to our wonderful neighborhood! We're so excited you've chosen to make this community your home.\n\nOur church family is here to support you as you settle in. Whether you're looking for spiritual guidance, community connections, or just a friendly face, our doors are always open.",
    churchInfo:
      'Join us for Sunday services at 9:00 AM and 11:00 AM. We also host community events, study groups, and volunteer opportunities throughout the week.\n\nOur mission is to create a welcoming, inclusive space where everyone can grow in faith and fellowship.',
    customContent:
      "Community Tips:\n• Weekly farmers market every Saturday morning\n• Family-friendly parks and playgrounds nearby\n• Active neighborhood watch program\n• Monthly community gatherings\n\nWe're here to help you feel at home!",
    includeAmenities: true,
    templateDesign: 'default',
  },
  modern: {
    name: 'Modern & Bold',
    welcomeMessage:
      "Welcome to the neighborhood! 🏡\n\nYou're now part of a vibrant, dynamic community. We can't wait to get to know you!",
    churchInfo:
      'Our church is a modern, welcoming space for people of all backgrounds.\n\n📅 Service Times: Sundays 10:00 AM\n🎵 Contemporary worship with live music\n☕ Coffee and connection after every service\n👨‍👩‍👧‍👦 Programs for all ages\n\nFollow us on social media to stay connected!',
    customContent:
      'Your Neighborhood at a Glance:\n✓ Award-winning schools\n✓ Vibrant local businesses\n✓ Safe, family-friendly streets\n✓ Active community calendar\n✓ Easy access to public transport\n\nNeed anything? Scan the QR code to connect with our community team instantly!',
    includeAmenities: true,
    templateDesign: 'default',
  },
  magazine: {
    name: 'Magazine Style',
    welcomeMessage:
      "Welcome to your beautiful new neighborhood! We are absolutely thrilled to have you join our vibrant community.\n\nThis area is known for its friendly neighbors, tree-lined streets, and strong sense of belonging. Whether you're here to put down roots or just settling in for a while, we want you to feel right at home from day one.\n\nOur church community has been serving this neighborhood for years, and we're passionate about helping newcomers connect, find their place, and discover all the wonderful things this area has to offer.",
    churchInfo:
      "Our church is a warm, welcoming space where faith meets community. We believe in creating meaningful connections and supporting one another through all of life's seasons.\n\nWe offer worship services, community groups, and opportunities to serve alongside neighbors who share your values. No matter where you are on your faith journey, there's a place for you here.",
    customContent:
      "What makes this neighborhood special:\n• Close-knit community with regular social events\n• Beautiful parks and green spaces\n• Excellent schools and family programs\n• Safe, walkable streets\n• Diverse local shops and cafes\n• Active community initiatives\n• Regular farmers markets and seasonal festivals\n\nYou'll find all the essentials nearby, along with hidden gems that give this area its unique character.",
    includeAmenities: true,
    templateDesign: 'magazine',
  },
}

function applyTemplate(templateType: 'minimal' | 'community' | 'modern' | 'magazine') {
  const template = templates[templateType]
  form.value.name = template.name
  form.value.welcomeMessage = template.welcomeMessage
  form.value.churchInfo = template.churchInfo
  form.value.customContent = template.customContent
  form.value.includeAmenities = template.includeAmenities
  form.value.templateDesign = template.templateDesign || 'default'

  successMessage.value = `"${template.name}" template applied! You can customize it further below.`
  setTimeout(() => {
    successMessage.value = ''
  }, 4000)

  // Scroll to the form
  setTimeout(() => {
    const formCard = document.querySelector('.space-y-6 > .bg-white')
    if (formCard) {
      formCard.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, 100)
}

async function previewTemplate(templateType: 'minimal' | 'community' | 'modern' | 'magazine') {
  previewTemplateType.value = templateType
  previewHtml.value = ''
  showPreview.value = true

  // For magazine template, fetch generic example with fictional sample data
  if (templateType === 'magazine') {
    loadingPreview.value = true
    try {
      // Create a temporary body with magazine template data for preview
      const magazinePreviewData = {
        templateDesign: 'magazine',
        welcomeMessage: templates.magazine.welcomeMessage,
        churchInfo: templates.magazine.churchInfo,
        customContent: templates.magazine.customContent,
      }

      const csrfToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1]

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (csrfToken) {
        headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken)
      }

      const response = await fetch('/api/welcome-pack/preview-sample', {
        method: 'POST',
        headers,
        credentials: 'same-origin',
        body: JSON.stringify(magazinePreviewData),
      })

      if (response.ok) {
        const data = await response.json()
        previewHtml.value = data.html
      }
    } catch (error) {
      console.error('Failed to load magazine preview:', error)
    } finally {
      loadingPreview.value = false
    }
  }
}

// Computed property to get content for preview
const previewContent = computed(() => {
  // If viewing a specific template, show template content
  if (previewTemplateType.value) {
    return templates[previewTemplateType.value]
  }
  // Otherwise show user's current form content
  return {
    name: form.value.name,
    welcomeMessage: form.value.welcomeMessage,
    churchInfo: form.value.churchInfo,
    customContent: form.value.customContent,
    includeAmenities: form.value.includeAmenities,
  }
})

// Computed property for preview title
const previewTitle = computed(() => {
  if (previewTemplateType.value) {
    return `${templates[previewTemplateType.value].name} Template Preview`
  }
  return 'Your Welcome Pack Preview'
})

onMounted(async () => {
  await loadTemplate()
  await loadBranding()
})

const loadTemplate = async () => {
  try {
    const response = await fetch('/api/welcome-pack/template', {
      credentials: 'same-origin',
    })

    if (response.ok) {
      const data = await response.json()
      if (data.template) {
        form.value = {
          name: data.template.name || 'Default Template',
          welcomeMessage: data.template.welcomeMessage || '',
          aboutCommunity: data.template.aboutCommunity || '',
          churchInfo: data.template.churchInfo || '',
          customContent: data.template.customContent || '',
          contactAddress: data.template.contactAddress || '',
          contactEmail: data.template.contactEmail || '',
          contactPhone: data.template.contactPhone || '',
          primaryColor: data.template.primaryColor || '#94b4af',
          secondaryColor: data.template.secondaryColor || '#566874',
          includeAmenities: data.template.includeAmenities !== false,
          templateDesign: data.template.templateDesign || 'default',
        }

        // Load church services from JSON string
        if (data.template.churchServices) {
          try {
            const services = JSON.parse(data.template.churchServices)
            churchServices.value = Array.isArray(services) ? services : []
          } catch (e) {
            console.error('Failed to parse church services:', e)
            churchServices.value = []
          }
        }
      }
    }
  } catch (error) {
    console.error('Failed to load template:', error)
  }
}

const loadBranding = async () => {
  try {
    const response = await fetch('/api/welcome-pack/template')
    if (response.ok) {
      const data = await response.json()
      const template = data.template || data
      branding.value = {
        logoUrl: template.logoUrl,
        bannerUrl: template.bannerUrl,
        primaryColor: template.primaryColor || '#94b4af',
        secondaryColor: template.secondaryColor || '#566874',
      }
      aboutUsImageUrl.value = template.aboutUsImageUrl
      gettingAroundImageUrl.value = template.gettingAroundImageUrl
      communityServicesImageUrl.value = template.communityServicesImageUrl
      thingsToDoImageUrl.value = template.thingsToDoImageUrl
    }
  } catch (error) {
    console.error('Failed to load branding:', error)
  }
}

const saveTemplate = async () => {
  saving.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    // Get CSRF token from cookie
    const csrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1]

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }

    if (csrfToken) {
      headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken)
    }

    // Prepare payload with serialized church services
    const payload = {
      ...form.value,
      churchServices: JSON.stringify(churchServices.value),
    }

    const response = await fetch('/api/welcome-pack/template', {
      method: 'PUT',
      headers,
      credentials: 'same-origin',
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to save template' }))
      throw new Error(errorData.error || 'Failed to save template')
    }

    successMessage.value = 'Template saved successfully!'

    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('Error saving template:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to save template'
  } finally {
    saving.value = false
  }
}

const loadAndShowPreview = async () => {
  loadingPreview.value = true
  previewHtml.value = ''
  try {
    const response = await fetch('/api/welcome-pack/preview-template', {
      credentials: 'same-origin',
    })

    if (response.ok) {
      const data = await response.json()
      previewHtml.value = data.html
      showPreview.value = true
    } else {
      errorMessage.value = 'Failed to load preview'
    }
  } catch (error) {
    console.error('Error loading preview:', error)
    errorMessage.value = 'Failed to load preview'
  } finally {
    loadingPreview.value = false
  }
}

const uploadAboutUsImage = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  // Validate file size
  if (file.size > 5 * 1024 * 1024) {
    aboutUsImageError.value = 'File must be smaller than 5MB'
    return
  }

  // Validate file type
  if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
    aboutUsImageError.value = 'File must be an image (JPG, PNG, GIF, or WebP)'
    return
  }

  uploadingAboutUsImage.value = true
  aboutUsImageError.value = ''

  try {
    // Get CSRF token from cookie
    const csrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1]

    const formData = new FormData()
    formData.append('image', file)
    formData.append('type', 'aboutUs')

    const headers: Record<string, string> = {}
    if (csrfToken) {
      headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken)
    }

    const response = await fetch('/api/welcome-pack/upload-image', {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'same-origin',
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Upload failed')
    }

    aboutUsImageUrl.value = data.url

    // Save the URL to the template
    await updateTemplateWithAboutUsImage(data.url)

    successMessage.value = 'About Us image uploaded successfully'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed'
    aboutUsImageError.value = message
    console.error('Upload error:', error)
  } finally {
    uploadingAboutUsImage.value = false
    input.value = ''
  }
}

const updateTemplateWithAboutUsImage = async (imageUrl: string) => {
  try {
    const csrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1]

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (csrfToken) {
      headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken)
    }

    await fetch('/api/welcome-pack/template-update', {
      method: 'POST',
      headers,
      credentials: 'same-origin',
      body: JSON.stringify({ aboutUsImageUrl: imageUrl }),
    })
  } catch (error) {
    console.error('Failed to update template with about us image:', error)
  }
}

const deleteAboutUsImage = async () => {
  const url = aboutUsImageUrl.value
  if (!url) return

  isDeletingAboutUsImage.value = true

  try {
    // Get CSRF token from cookie
    const csrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1]

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (csrfToken) {
      headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken)
    }

    const response = await fetch('/api/welcome-pack/delete-image', {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ url }),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Delete failed')
    }

    aboutUsImageUrl.value = undefined

    // Update the template to remove the URL
    await updateTemplateWithAboutUsImage('')

    successMessage.value = 'About Us image removed successfully'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Delete failed'
    errorMessage.value = message
  } finally {
    isDeletingAboutUsImage.value = false
  }
}

// Getting Around Image Handlers
const handleGettingAroundImageUpload = async (url: string) => {
  gettingAroundImageUrl.value = url
  await updateTemplateImage('gettingAroundImageUrl', url)
  successMessage.value = 'Getting Around image uploaded successfully'
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

const handleGettingAroundImageDelete = async () => {
  gettingAroundImageUrl.value = undefined
  await updateTemplateImage('gettingAroundImageUrl', '')
  successMessage.value = 'Getting Around image removed successfully'
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

// Community Services Image Handlers
const handleCommunityServicesImageUpload = async (url: string) => {
  communityServicesImageUrl.value = url
  await updateTemplateImage('communityServicesImageUrl', url)
  successMessage.value = 'Community Services image uploaded successfully'
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

const handleCommunityServicesImageDelete = async () => {
  communityServicesImageUrl.value = undefined
  await updateTemplateImage('communityServicesImageUrl', '')
  successMessage.value = 'Community Services image removed successfully'
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

// Things to Do Image Handlers
const handleThingsToDoImageUpload = async (url: string) => {
  thingsToDoImageUrl.value = url
  await updateTemplateImage('thingsToDoImageUrl', url)
  successMessage.value = 'Things to Do image uploaded successfully'
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

const handleThingsToDoImageDelete = async () => {
  thingsToDoImageUrl.value = undefined
  await updateTemplateImage('thingsToDoImageUrl', '')
  successMessage.value = 'Things to Do image removed successfully'
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

// Helper function to update template image URLs
const updateTemplateImage = async (field: string, imageUrl: string) => {
  try {
    const csrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1]

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (csrfToken) {
      headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken)
    }

    await fetch('/api/welcome-pack/template-update', {
      method: 'POST',
      headers,
      credentials: 'same-origin',
      body: JSON.stringify({ [field]: imageUrl }),
    })
  } catch (error) {
    console.error(`Failed to update template with ${field}:`, error)
  }
}
</script>
