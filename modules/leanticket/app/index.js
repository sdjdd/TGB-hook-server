const LC = require('open-leancloud-storage/node');

const { leanTicket } = require('../../../config');

const app = LC.init({
  appId: leanTicket.appId,
  appKey: leanTicket.appKey,
  masterKey: leanTicket.masterKey,
  serverURL: leanTicket.serverURL,
});
const auth = app.auth();
const db = app.database();
const cloud = app.cloud();

module.exports = { app, auth, db, cloud };
