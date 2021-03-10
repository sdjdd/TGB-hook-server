const { auth } = require('../app');

async function isCustomerService(userId) {
  const count = await auth
    .queryRole()
    .where('name', '==', 'customerService')
    .where('users', '==', auth.user(userId))
    .count();
  return count > 0;
}

module.exports = { isCustomerService };
