const LC = require('open-leancloud-storage/node');

const { leanTicket } = require('../../../config');

const app = LC.init({
  appId: leanTicket.appId,
  appKey: leanTicket.appKey,
  masterKey: leanTicket.masterKey,
  serverURL: leanTicket.serverURL,
});
const db = app.database();
const cloud = app.cloud();

module.exports = { app, db, cloud };
