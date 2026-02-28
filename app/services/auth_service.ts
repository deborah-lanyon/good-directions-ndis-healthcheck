import User from '#models/user'

export class AuthService {
  async login(email: string, password: string): Promise<User> {
    console.log('[AUTH] Attempting login for:', email)

    try {
      const user = await User.verifyCredentials(email.toLowerCase(), password)
      console.log('[AUTH] Credentials verified for:', email)
      console.log('[AUTH] User approval status:', user.adminApprovalStatus)

      if (user.adminApprovalStatus !== 'approved') {
        console.log('[AUTH] User not approved')
        throw new Error('Account not approved yet. Please wait for admin approval.')
      }

      console.log('[AUTH] Login successful')
      return user
    } catch (error) {
      console.log('[AUTH ERROR]', error)
      throw error
    }
  }
}
