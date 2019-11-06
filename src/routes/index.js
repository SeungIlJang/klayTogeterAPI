const express = require('express');
const router = express.Router();
const debug = require('debug')('nodejsexpressapp:index');


/* GET home page. */
router.get('/', function(req, res, next) {
  debug('index');
  res.render('index', { title: 'Express' });

});

module.exports = router;
