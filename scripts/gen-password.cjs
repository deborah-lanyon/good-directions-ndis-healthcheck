const { scrypt, randomBytes } = require('crypto')
const { promisify } = require('util')

const scryptAsync = promisify(scrypt)

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = await scryptAsync(password, salt, 64)
  return `scrypt$${salt}$${derivedKey.toString('hex')}`
}

const password = process.argv[2] || 'password123'

hashPassword(password).then((hashed) => {
  console.log('\n===========================================')
  console.log('Original password:', password)
  console.log('Hashed password:', hashed)
  console.log('===========================================\n')
  console.log('Copy this SQL and run it in Cloud SQL Studio:')
  console.log(`\nUPDATE users SET password = '${hashed}' WHERE email = 'your-email@example.com';\n`)
})
