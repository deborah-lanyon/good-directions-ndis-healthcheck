import hash from '@adonisjs/core/services/hash'

const storedHash =
  'scrypt$60a6cdd8424b550399611a48b67f12b7$5032fa5e0385b81362665b2535933bae71e7e1c23e091d8dec9d7ec7789f902237008a0d75840d246bcd7e298b33ca7852809b8d554e1c6b97a9c9f858f5ae01'
const password = 'Winston1058!'

const isValid = await hash.use('scrypt').verify(storedHash, password)
console.log('Password hash valid:', isValid)
