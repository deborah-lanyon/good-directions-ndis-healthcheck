# Manual Testing Checklist

This document provides a comprehensive checklist for manually testing the Good Directions NDIS Healthcheck application before deployment.

## Pre-Deployment Testing

### Authentication & User Management

- [ ] User Registration
  - [ ] Register new church admin account
  - [ ] Register new visitor account
  - [ ] Verify email validation works
  - [ ] Verify password requirements are enforced
- [ ] Login/Logout
  - [ ] Login with church admin credentials
  - [ ] Login with visitor credentials
  - [ ] Login with super admin credentials
  - [ ] Logout functionality works
  - [ ] Session persistence across page refreshes
- [ ] Password Reset
  - [ ] Request password reset email
  - [ ] Verify reset link works
  - [ ] Set new password successfully
  - [ ] Cannot reuse reset link after password change

### Church Profile Management

- [ ] Create/Edit Church Profile
  - [ ] Add church name, address, location
  - [ ] Upload church logo
  - [ ] Set search radius for properties
  - [ ] Save profile successfully
  - [ ] Edit existing profile
- [ ] Location Services
  - [ ] Address geocoding works correctly
  - [ ] Map displays church location accurately
  - [ ] Radius boundary visible on map
  - [ ] Map bounds saved correctly

### Property Management

- [ ] Property Sync
  - [ ] Trigger manual property sync
  - [ ] Verify properties appear within church radius
  - [ ] Check property details (address, type, settlement date)
  - [ ] Verify duplicate properties are not created
- [ ] Property Display
  - [ ] View all properties for church
  - [ ] Filter properties by feedback status
  - [ ] Filter properties by date range
  - [ ] Search properties by address
  - [ ] Sort properties by various fields
- [ ] Property Updates
  - [ ] Update feedback status (pending → visited → welcomed)
  - [ ] Add visit notes
  - [ ] Assign visitor to property
  - [ ] Verify date of visit is recorded
  - [ ] Verify date of status change is recorded

### Team Management

- [ ] Street Groups
  - [ ] Create new street group
  - [ ] Edit existing street group
  - [ ] Delete street group
  - [ ] Assign streets to group
  - [ ] View properties in street group
- [ ] Visitor Management
  - [ ] Create new visitor
  - [ ] Link visitor to user account
  - [ ] Assign visitor to street groups
  - [ ] Edit visitor details
  - [ ] Remove visitor from street groups
  - [ ] Delete visitor

### Visitor Route Planning

- [ ] Route Creation
  - [ ] View assigned properties as visitor
  - [ ] Select multiple properties for route
  - [ ] Generate optimized route
  - [ ] Verify route waypoints are in correct order
  - [ ] Verify distance calculations are accurate
  - [ ] Verify time estimates are reasonable
- [ ] Route Display
  - [ ] View route summary modal
  - [ ] See starting point (church location)
  - [ ] See all stops in order with distances
  - [ ] See total distance and time
- [ ] Route Actions
  - [ ] Open route in Google Maps
  - [ ] Print route sheet
  - [ ] Close route modal
  - [ ] Deselect properties from route

### Welcome Pack Templates

- [ ] Template Creation/Editing
  - [ ] Access welcome pack template editor
  - [ ] Upload church logo
  - [ ] Upload banner image
  - [ ] Upload about us image
  - [ ] Set church service times
  - [ ] Add contact information
  - [ ] Add about us text
  - [ ] Add about community text
  - [ ] Customize colors (primary, secondary, accent)
  - [ ] Save template
- [ ] Template Preview
  - [ ] Preview welcome pack in browser
  - [ ] Verify all images display correctly
  - [ ] Verify text formatting is correct
  - [ ] Verify colors are applied correctly
- [ ] Template Generation
  - [ ] Generate PDF welcome pack
  - [ ] Verify PDF contains all template content
  - [ ] Verify PDF is formatted correctly

### Amenity Management

- [ ] Amenity Types
  - [ ] View available amenity types
  - [ ] Amenities grouped by category correctly
- [ ] Church Amenities
  - [ ] Add amenities to church
  - [ ] Search for amenities by name
  - [ ] Filter amenities by category
  - [ ] Remove amenities from church
  - [ ] Edit amenity details (custom description)

### Notifications & Emails

- [ ] Property Sync Notifications
  - [ ] Receive email when new properties are found
  - [ ] Email contains property details
  - [ ] Email formatting is correct
- [ ] System Notifications
  - [ ] Password reset emails are sent
  - [ ] User approval emails are sent (admin)
  - [ ] Account approved emails are sent (user)

## Authorization & Security

- [ ] Role-Based Access
  - [ ] Church admin can only access own church data
  - [ ] Visitors can only access assigned properties
  - [ ] Super admin can access all churches
  - [ ] Unapproved users cannot access protected routes
- [ ] Data Isolation
  - [ ] Users cannot view other churches' properties
  - [ ] Users cannot edit other churches' data
  - [ ] Users cannot access other churches' welcome packs
- [ ] Input Validation
  - [ ] SQL injection attempts are blocked
  - [ ] XSS attempts are sanitized
  - [ ] File upload restrictions are enforced (type, size)
  - [ ] Email format validation works
  - [ ] Required fields are validated

## Performance Testing

- [ ] Page Load Times
  - [ ] Dashboard loads in < 2 seconds
  - [ ] Property list loads in < 3 seconds
  - [ ] Welcome pack editor loads in < 2 seconds
  - [ ] Map renders in < 2 seconds
- [ ] Large Data Sets
  - [ ] System handles 1000+ properties without slowdown
  - [ ] Pagination works correctly with large datasets
  - [ ] Search/filter remain responsive with large datasets
- [ ] File Operations
  - [ ] Image uploads complete successfully
  - [ ] PDF generation completes in < 10 seconds
  - [ ] Large image files are handled gracefully

## Browser Compatibility

- [ ] Chrome/Edge (latest version)
  - [ ] All features work correctly
  - [ ] UI renders correctly
  - [ ] No console errors
- [ ] Firefox (latest version)
  - [ ] All features work correctly
  - [ ] UI renders correctly
  - [ ] No console errors
- [ ] Safari (if applicable)
  - [ ] All features work correctly
  - [ ] UI renders correctly
  - [ ] No console errors

## Mobile Responsiveness

- [ ] Mobile Layout (< 768px)
  - [ ] Navigation menu is responsive
  - [ ] Tables are scrollable/responsive
  - [ ] Modals fit on screen
  - [ ] Forms are usable
  - [ ] Maps render correctly
- [ ] Tablet Layout (768px - 1024px)
  - [ ] Layout adjusts correctly
  - [ ] All features remain accessible
  - [ ] Touch interactions work

## Error Handling

- [ ] Network Errors
  - [ ] Graceful handling of API failures
  - [ ] User-friendly error messages displayed
  - [ ] Retry mechanisms work where applicable
- [ ] Validation Errors
  - [ ] Form validation errors are clear
  - [ ] Error messages appear near relevant fields
  - [ ] Multiple errors are all displayed
- [ ] 404/403 Pages
  - [ ] Missing pages show 404 error
  - [ ] Unauthorized access shows 403 error
  - [ ] Error pages have navigation back to home

## Data Integrity

- [ ] Database Operations
  - [ ] Creating records persists data correctly
  - [ ] Updating records saves changes
  - [ ] Deleting records removes data
  - [ ] Foreign key relationships are maintained
  - [ ] Cascade deletes work correctly
- [ ] Transaction Rollbacks
  - [ ] Failed operations don't leave partial data
  - [ ] Database remains consistent after errors

## Deployment Checklist

- [ ] Environment Variables
  - [ ] All required .env variables are set
  - [ ] API keys are configured correctly
  - [ ] Database connection works
  - [ ] Email service is configured
- [ ] Build Process
  - [ ] `npm run build` completes without errors
  - [ ] TypeScript compilation succeeds
  - [ ] Assets are bundled correctly
- [ ] Database Migrations
  - [ ] All migrations run successfully
  - [ ] Database schema matches code expectations
- [ ] Production Settings
  - [ ] NODE_ENV=production
  - [ ] Debug mode is disabled
  - [ ] Logging is configured appropriately
  - [ ] Session security is enabled

## Post-Deployment Verification

- [ ] Smoke Tests
  - [ ] Application starts and loads homepage
  - [ ] Users can login
  - [ ] Dashboard displays correctly
  - [ ] Critical workflows function (property sync, route planning)
- [ ] Monitoring
  - [ ] Error logging is working
  - [ ] Performance metrics are being collected
  - [ ] Uptime monitoring is active

## Notes

- Document any issues found during testing in the issue tracker
- Mark the test date and tester name for each checklist completion
- Re-test after any bug fixes before final deployment
- Keep this checklist updated as new features are added
