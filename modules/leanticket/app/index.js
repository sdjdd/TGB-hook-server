const LC = require('open-leancloud-storage/node');

const {
  LEANTICKET_APP_ID,
  LEANTICKET_APP_KEY,
  LEANTICKET_MASTER_KEY,
  LEANTICKET_SERVER_URL,
} = require('../../../config');

const app = LC.init({
  appId: LEANTICKET_APP_ID,
  appKey: LEANTICKET_APP_KEY,
  masterKey: LEANTICKET_MASTER_KEY,
  serverURL: LEANTICKET_SERVER_URL,
});
const db = app.database();
const cloud = app.cloud();

module.exports = { app, db, cloud };
