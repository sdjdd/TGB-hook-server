const AV = require('leancloud-storage');

async function isCustomerService(userId) {
  const role = await new AV.Query('_Role')
    .equalTo('name', 'customerService')
    .equalTo('users', AV.Object.createWithoutData('_User', userId))
    .select('objectId')
    .first();
  return !!role;
}

module.exports = { isCustomerService };
