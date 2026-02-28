import User from '#models/user'

const email = 'lanyondeborah@gmail.com'
const password = 'password123' // Change this after login
const fullName = 'Deborah Lanyon'

async function restoreAdmin() {
  try {
    // Check if user already exists
    const existing = await User.findBy('email', email)
    if (existing) {
      console.log('User already exists with ID:', existing.id)
      return
    }

    // Create new super admin user
    const user = await User.create({
      email,
      password,
      fullName,
      isSuperAdmin: true,
      adminApprovalStatus: 'approved',
    })

    console.log('✅ Super admin account restored!')
    console.log('Email:', email)
    console.log('Temporary Password:', password)
    console.log('User ID:', user.id)
    console.log('\n⚠️  IMPORTANT: Please change your password after logging in!')
  } catch (error) {
    console.error('Error restoring admin account:', error)
  }

  process.exit(0)
}

restoreAdmin()
