const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const serviceKlaytn = require('../service/Klaytn');
const serviceMongDB = require('../service/MongoDB');
const debug = require('debug')('nodejsexpressapp:klaytnAPI');
// const jwt = require('jsonwebtoken');


/* GET home page. */
router.get('/', asyncHandler(async (req, res, next) => {
  let value = await  serviceKlaytn.connectionTest();
  let stringObj = {
    rtnValue:value,
  };
  let jsonStr = JSON.stringify(stringObj);
  // let jsonObj = JSON.parse(jsonStr);
  debug(jsonStr);
  // debug(jsonObj);
  res.send(jsonStr);


}));

router.post('/login',asyncHandler(async (req, res, next) => {

  try {
    let _kakaoId = req.body.kakaoId;
    if(_kakaoId === undefined) {
      res.send('plz input kakaoId');

    }else {
      const _secret = process.env.JWT_KEY;
      debug(_kakaoId, _secret);


      let rtnValue = await serviceKlaytn.login(_kakaoId, _secret);
      debug(rtnValue);
      res.send(rtnValue);
    }
  }catch(e){
    debug(e);
    res.send(e);
  }

  // let stringObj = {
  //   rtnValue:value,
  // };
  // let jsonStr = JSON.stringify(stringObj);
  // let jsonObj = JSON.parse(jsonStr);
  // debug(jsonStr);
  // debug(jsonObj);
  // res.send(jsonStr);

}));

router.post('/getMemberLength',asyncHandler(async (req, res, next) => {

  try {
    debug(req.body);
    let rtnValue = await serviceKlaytn.getMemberLength();
    debug(rtnValue);
    res.send(rtnValue);
  }catch(e){
    debug(e);
    res.send(e);
  }

}));

router.post('/createNest',asyncHandler(async (req, res, next) => {

  try {
    debug(req.body);
    let paramInfo = req.body;
    debug(paramInfo.address);
    let rtnValue = await serviceKlaytn.createNest(paramInfo);
    debug(rtnValue);
    res.send(rtnValue);
  }catch(e){
    debug(e);
    res.send(e);
  }

}));
router.post('/getNestLength',asyncHandler(async (req, res, next) => {

  try {
    debug(req.body);
    let rtnValue = await serviceKlaytn.getNestLength();
    debug(rtnValue);
    res.send(rtnValue);
  }catch(e){
    debug(e);
    res.send(e);
  }

}));

router.post('/getNestDetail',asyncHandler(async (req, res, next) => {

  try {
    debug(req.body);
    let nestId = req.body.nestId;
    let rtnObj = await serviceKlaytn.getNestDetail(nestId);
    debug(rtnObj);
    res.send(rtnObj);
  }catch(e){
    debug(e);
    res.send(e);
  }

}));

router.post('/getEggListOfNest',asyncHandler(async (req, res, next) => {

  try {
    debug(req.body);
    let nestId = req.body.nestId;
    let rtnObj = await serviceKlaytn.getEggListOfNest(nestId);
    debug(rtnObj);
    res.send(rtnObj);
  }catch(e){
    debug(e);
    res.send(e);
  }

}));

router.post('/getMemberAdressListOfNest',asyncHandler(async (req, res, next) => {

  try {
    debug(req.body);
    let nestId = req.body.nestId;
    let rtnObj = await serviceKlaytn.getMemberAdressListOfNest(nestId);
    debug(rtnObj);
    res.send(rtnObj);
  }catch(e){
    debug(e);
    res.send(e);
  }

}));



router.post('/joinNest',asyncHandler(async (req, res, next) => {

  try {
    debug(req.body);
    let paramInfo = req.body;
    let rtnValue = await serviceKlaytn.joinNest(paramInfo);
    debug(rtnValue);
    res.send(rtnValue);
  }catch(e){
    debug(e);
    res.send(e);
  }

}));

router.post('/getMemberNestList',asyncHandler(async (req, res, next) => {

  try {
    debug(req.body);
    let address = req.body.address;
    let rtnValue = await serviceKlaytn.getMemberNestList(address);
    debug(rtnValue);
    res.send(rtnValue);
  }catch(e){
    debug(e);
    res.send(e);
  }

}));

router.post('/getNestMemberList',asyncHandler(async (req, res, next) => {

  try {
    debug(req.body);
    let nestId = req.body.nestId;
    let rtnValue = await serviceKlaytn.getNestMemberList(nestId);
    debug(rtnValue);
    res.send(rtnValue);
  }catch(e){
    debug(e);
    res.send(e);
  }

}));



router.post('/testJson',asyncHandler(async (req, res, next) => {

  debug(req.body);

  res.send(req.body);

}));

router.post('/testSelectAll',asyncHandler(async (req, res, next) => {
  debug(req.body);
  debug(req.body.collectionName);
  let collectionName = req.body.collectionName;
  let rtnValue = await serviceMongDB.findAll(collectionName);
  res.send(rtnValue);

}));

router.post('/createNest',asyncHandler(async (req, res, next) => {

  let nestInfo = req.body;
  try {
    let rtnValue = await serviceKlaytn.createNest(address,nestInfo);
    debug(rtnValue);
    res.send(rtnValue);
  }catch(e){
    debug(e);
    res.send(e);
  }

}));

router.get('/getBalance', asyncHandler(async (req, res, next) => {
  // let address = '0x850633ad76bfee965002a8c9924ab58145231ad8';
  let address = '0x3A3953eE2Ff9611619c4EaE6EA58F083749DE284';
  let value = await serviceKlaytn.getBalance(address);

  let stringObj = {
    rtnValue:value,
  };
  let jsonStr = JSON.stringify(stringObj);
  // let jsonObj = JSON.parse(jsonStr);
  debug(jsonStr);
  // debug(jsonObj);
  res.send(jsonStr);


}));


router.get('/connectionTest', function(req, res, next) {
  serviceKlaytn.connectionTest().then ( value => {
    res.send(value);
  } ).catch(next);
});

module.exports = router;
