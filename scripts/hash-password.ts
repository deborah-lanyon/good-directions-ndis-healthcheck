import hash from '@adonisjs/core/services/hash'

const password = process.argv[2] || 'password123'

hash.make(password).then((hashed) => {
  console.log('\n===========================================')
  console.log('Original password:', password)
  console.log('Hashed password:', hashed)
  console.log('===========================================\n')
  console.log('Use this SQL to update the password:')
  console.log(`UPDATE users SET password = '${hashed}' WHERE email = 'your-email@example.com';`)
  console.log('\n')
  process.exit(0)
})
