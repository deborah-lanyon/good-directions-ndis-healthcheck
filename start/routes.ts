/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
const PropertiesController = () => import('#controllers/properties_controller')
const UsersController = () => import('#controllers/users_controller')
const ChurchProfilesController = () => import('#controllers/church_profiles_controller')
const RoutesController = () => import('#controllers/routes_controller')
const WelcomePacksController = () => import('#controllers/welcome_packs_controller')
const WelcomePackUploadsController = () => import('#controllers/welcome_pack_uploads_controller')
const StreetGroupsController = () => import('#controllers/street_groups_controller')
const VisitorsController = () => import('#controllers/visitors_controller')
const VisitorPortalController = () => import('#controllers/visitor_portal_controller')
const ExportsController = () => import('#controllers/exports_controller')
const AdminController = () => import('#controllers/admin_controller')
const StreetsController = () => import('#controllers/streets_controller')
const HomeController = () => import('#controllers/home_controller')
const ContactController = () => import('#controllers/contact_controller')
const AnalyticsController = () => import('#controllers/analytics_controller')
const RespondentController = () => import('#controllers/respondent_controller')
const MailCampaignController = () => import('#controllers/mail_campaign_controller')

router.get('/', [HomeController, 'index'])
router.get('/home', [HomeController, 'index'])
router.get('/how-it-works', [HomeController, 'howItWorks'])
router.get('/about-us', [HomeController, 'aboutUs'])
router.get('/get-in-touch', [ContactController, 'index'])
router.on('/login').renderInertia('login')
router.on('/register').renderInertia('register')
router.on('/thank-you').renderInertia('thank-you')
router.on('/forgot-password').renderInertia('forgot-password')
router.get('/reset-password', [UsersController, 'resetRequest'])

// Public healthcheck registration
router.get('/r/:code', [RespondentController, 'register'])
router.get('/healthcheck-register', [RespondentController, 'register'])

router
  .group(() => {
    router.get('dashboard', [HomeController, 'hub'])
    router.get('properties', [PropertiesController, 'index'])
    router.get('property-list', [PropertiesController, 'list'])
    router.post('logout', [UsersController, 'logout'])
    router.get('territory-detail', [ChurchProfilesController, 'index'])

    router.put('properties/:id', [PropertiesController, 'update'])
    router.put('territory-detail', [ChurchProfilesController, 'update'])
    router.get('geocode', [ChurchProfilesController, 'geocode'])
    router.put('users', [UsersController, 'update'])
    router.get('test-email', [PropertiesController, 'testEmail'])

    // Welcome Pack routes
    router.get('welcome-pack/template', [WelcomePacksController, 'getTemplate'])
    router.put('welcome-pack/template', [WelcomePacksController, 'updateTemplate'])

    // Amenities management page
    router.get('amenities', [WelcomePacksController, 'index'])

    // Street Groups Management
    router.get('street-groups', [StreetGroupsController, 'page'])
    router.get('street-groups/:id/visitors', [StreetGroupsController, 'visitorsPage'])

    // Visitors Management Page
    router.get('visitors', [VisitorsController, 'listAll'])

    // Team Management Page (combined Street Groups and Visitors in tabs)
    router.get('team-management', [StreetGroupsController, 'teamManagementPage'])

    // How To Use page (for logged in users)
    router.get('how-to-use', [HomeController, 'howToUse'])

    // Analytics Dashboard (church admins only)
    router.get('analytics', [AnalyticsController, 'index'])

    // All Records page (church admins)
    router.get('records', [PropertiesController, 'records'])

    // Mail Campaigns & Respondents pages
    router.get('campaigns', [MailCampaignController, 'index'])
    router.get('campaigns/:id/properties', [MailCampaignController, 'properties'])
    router.get('respondents', [RespondentController, 'page'])

    // Admin pages
    router.get('admin/dashboard', [AdminController, 'dashboard'])
    router.get('admin/territories', [AdminController, 'churches'])
    router.get('admin/users', [AdminController, 'users'])
    router.get('admin/site-settings', [AdminController, 'siteSettings'])
    router.get('admin/analytics', [AdminController, 'analytics'])
    router.get('admin/records', [AdminController, 'records'])
  })
  .use(middleware.auth())

router
  .group(() => {
    router.post('routes/plan', [RoutesController, 'plan'])
    router.post('routes/plan-street-group', [RoutesController, 'planStreetGroup'])
    router.get('welcome-pack/preview/:propertyId', [WelcomePacksController, 'preview'])
    router.get('welcome-pack/generate/:propertyId', [WelcomePacksController, 'generate'])
    router.get('welcome-pack/generate-pdf/:propertyId', [WelcomePacksController, 'generatePdf'])
    router.post('welcome-pack/preview-sample', [WelcomePacksController, 'previewSample'])
    router.get('welcome-pack/preview-template', [WelcomePacksController, 'previewTemplate'])
    router.get('welcome-pack/template', [WelcomePacksController, 'getTemplateApi'])
    router.put('welcome-pack/template', [WelcomePacksController, 'updateTemplate'])
    router.post('welcome-pack/upload-image', [WelcomePackUploadsController, 'uploadImage'])
    router.post('welcome-pack/template-update', [WelcomePackUploadsController, 'updateTemplate'])
    router.delete('welcome-pack/delete-image', [WelcomePackUploadsController, 'deleteImage'])
    router.get('amenities', [WelcomePacksController, 'getAmenities'])
    router.post('amenities', [WelcomePacksController, 'createAmenity'])
    router.put('amenities/:id', [WelcomePacksController, 'updateAmenity'])
    router.delete('amenities/:id', [WelcomePacksController, 'deleteAmenity'])
    router.get('amenity-types', [WelcomePacksController, 'getAmenityTypes'])
    router.post('geocode', [ChurchProfilesController, 'geocode'])

    // Street Groups
    router.get('street-groups', [StreetGroupsController, 'listAll'])
    router.post('street-groups', [StreetGroupsController, 'create'])
    router.get('available-streets', [StreetGroupsController, 'availableStreets'])
    router.get('street-groups/:id', [StreetGroupsController, 'show'])
    router.put('street-groups/:id', [StreetGroupsController, 'update'])
    router.delete('street-groups/:id', [StreetGroupsController, 'destroy'])
    router.put('street-groups/:id/visitors', [StreetGroupsController, 'updateVisitors'])
    router.post('street-groups/:id/streets', [StreetGroupsController, 'assignStreet'])
    router.put('street-assignments/:assignmentId', [StreetGroupsController, 'updateStreet'])
    router.delete('street-assignments/:assignmentId', [StreetGroupsController, 'removeStreet'])
    router.get('street-groups/:id/properties', [StreetGroupsController, 'properties'])

    // Streets API - fetch streets near church for map selection
    router.get('churches/:id/streets', [StreetsController, 'nearChurch'])
    router.get('churches/:id/property-streets', [StreetsController, 'propertyStreets'])
    router.get('churches/:id/postcode-streets', [StreetsController, 'postcodeStreets'])

    // Visitors API endpoints (church-level management)
    router.get('visitors', [VisitorsController, 'getAllForChurch']) // Get all visitors for church (API)
    router.post('visitors', [VisitorsController, 'store']) // Church-level visitor creation
    router.post('visitors/toggle-admin-visitor', [VisitorsController, 'toggleAdminVisitor'])
    router.get('visitors/:id', [VisitorsController, 'show'])
    router.put('visitors/:id', [VisitorsController, 'update'])
    router.delete('visitors/:id', [VisitorsController, 'destroy'])
    router.post('visitors/:id/send-invitation', [VisitorsController, 'sendInvitation'])
    router.post('visitors/:id/revoke-access', [VisitorsController, 'revokeAccess'])
    router.post('visitors/:id/act-as', [VisitorsController, 'actAsVisitor'])
    router.post('visitors/stop-acting', [VisitorsController, 'stopActingAsVisitor'])

    // Legacy street-group-level visitor routes (for backwards compatibility)
    router.get('street-groups/:streetGroupId/visitors', [VisitorsController, 'index'])
    router.post('street-groups/:streetGroupId/visitors', [VisitorsController, 'store'])

    // Analytics API
    router.get('analytics/stats', [AnalyticsController, 'stats'])

    // Church records API
    router.get('records', [PropertiesController, 'getRecords'])
    router.get('records/export', [PropertiesController, 'exportRecords'])

    // Exports
    router.get('export/street-group/:streetGroupId', [ExportsController, 'exportStreetGroup'])
    router.get('export/visitor/:visitorId', [ExportsController, 'exportVisitor'])
    router.post('export/property-list', [ExportsController, 'exportPropertyList'])

    // Admin territory actions
    router.post('admin/territories', [AdminController, 'createChurch'])
    router.put('admin/territories/:churchId', [AdminController, 'updateChurch'])
    router.post('admin/territories/:churchId/select', [AdminController, 'selectTerritory'])
    router.delete('admin/territories/:churchId', [AdminController, 'deleteChurch'])
    router.get('admin/territories/sync-status', [AdminController, 'churchesSyncStatus'])

    // Admin user management
    router.post('admin/users', [AdminController, 'createUser'])
    router.get('admin/users/list', [AdminController, 'getUsers'])
    router.put('admin/users/:userId', [AdminController, 'updateUser'])
    router.put('admin/users/:userId/role', [AdminController, 'changeUserRole'])
    router.post('admin/users/:userId/reset-password', [AdminController, 'resetUserPassword'])
    router.delete('admin/users/:userId', [AdminController, 'deleteUser'])

    router.post('admin/impersonate/:userId', [AdminController, 'impersonateUser'])
    router.post('admin/stop-impersonating', [AdminController, 'stopImpersonating'])
    router.post('admin/switch-view', [AdminController, 'switchView'])

    // Site settings
    router.get('admin/site-settings', [AdminController, 'getSiteSettingsApi'])
    router.put('admin/site-settings', [AdminController, 'updateSiteSettings'])

    // Admin analytics
    router.get('admin/analytics/stats', [AdminController, 'analyticsStats'])

    // Admin records
    router.get('admin/records', [AdminController, 'getRecords'])
    router.get('admin/records/export', [AdminController, 'exportRecords'])

    // Demo mode
    router.post('admin/demo/toggle', [AdminController, 'toggleDemoMode'])
    router.get('admin/demo/status', [AdminController, 'getDemoStatus'])

    // Diagnostic: test Zyla API for a specific suburb
    router.get('admin/test-zyla/:suburb', [AdminController, 'testZylaApi'])

    // Mail Campaigns
    router.post('campaigns', [MailCampaignController, 'store'])
    router.get('campaigns/:id/sync-status', [MailCampaignController, 'syncStatus'])
    router.post('campaigns/:id/retry-sync', [MailCampaignController, 'retrySync'])
    router.get('campaigns/:id/labels', [MailCampaignController, 'labels'])
    router.post('campaigns/:id/posted', [MailCampaignController, 'markPosted'])
    router.delete('campaigns/:id', [MailCampaignController, 'destroy'])

    // Respondents
    router.get('respondents', [RespondentController, 'index'])
    router.put('respondents/:id', [RespondentController, 'update'])
  })
  .prefix('/api')
  .use(middleware.auth())

router
  .group(() => {
    router.get('auth/check', [UsersController, 'checkAuth'])
    router.post('login', [UsersController, 'login'])
    router.post('register', [UsersController, 'store'])
    router.post('forgot-password', [UsersController, 'forgotPassword'])
    router.post('reset-password', [UsersController, 'resetPassword'])
    router.get('admin/approve-user/:token', [UsersController, 'approveUser'])
    router.post('admin/approve-user', [UsersController, 'confirmApproveUser'])
    router.get('admin/reject-user/:token', [UsersController, 'rejectUser'])
    router.post('admin/reject-user', [UsersController, 'confirmRejectUser'])
    router.post('contact', [ContactController, 'submit'])
    router.post('healthcheck-register', [RespondentController, 'store'])
  })
  .prefix('/api')

router.post('/api/properties/sync', [PropertiesController, 'sync']).use(middleware.auth())
router
  .get('/api/properties/sync-status', [PropertiesController, 'syncStatus'])
  .use(middleware.auth())
router
  .get('/api/properties/tracked-rentals', [PropertiesController, 'trackedRentals'])
  .use(middleware.auth())

// Visitor Invitation Routes (public - no auth required)
router.get('/visitor/accept-invitation/:token', [VisitorPortalController, 'showAcceptInvitation'])
router.post('/visitor/accept-invitation/:token', [VisitorPortalController, 'acceptInvitation'])

// Visitor Portal Routes — disabled (single admin role, no visitor user type)
// router
//   .group(() => {
//     router.get('dashboard', [VisitorPortalController, 'dashboard'])
//     router.get('properties', [VisitorPortalController, 'properties'])
//     router.get('properties/:id', [VisitorPortalController, 'showProperty'])
//     router.put('properties/:id', [VisitorPortalController, 'updateProperty'])
//     router.get('stats', [VisitorPortalController, 'stats'])
//     router.get('help', [VisitorPortalController, 'help'])
//   })
//   .prefix('/visitor')
//   .use([middleware.auth(), middleware.visitor()])

// Run migrations endpoint (protected by APP_KEY)
router
  .get('/api/migrations/run', async ({ response }) => {
    try {
      const ace = await import('@adonisjs/core/services/ace')
      await ace.default.exec('migration:run', ['--force'])
      return response.json({ message: 'Migrations completed successfully' })
    } catch (error) {
      console.error('Migration error:', error)
      return response.status(500).json({
        message: 'Migration failed',
        error: error.message,
      })
    }
  })
  .use(middleware.appKey())

// Setup demo endpoint (protected by APP_KEY)
router
  .get('/api/setup-demo', async ({ response }) => {
    try {
      const ace = await import('@adonisjs/core/services/ace')
      await ace.default.exec('setup:demo', ['--reset'])
      return response.json({ message: 'Demo setup completed successfully' })
    } catch (error) {
      console.error('Demo setup error:', error)
      return response.status(500).json({
        message: 'Demo setup failed',
        error: error.message,
      })
    }
  })
  .use(middleware.appKey())
