const caver = require('../klaytn/caver');
const path = require('path');
const fs = require('fs');

/**
 * 1. Create contract instance
 * ex:) new caver.klay.Contract(DEPLOYED_ABI, DEPLOYED_ADDRESS)
 * You can call contract method through this instance.
 * Now you can access the instance by `this.countContract` variable.
 */

const DEPLOYED_ADDRESS = fs.readFileSync(path.join(__dirname,'/../../deployedAddress'), 'utf8').replace(/\n|\r/g, "");
const DEPLOYED_ABI = fs.existsSync(path.join(__dirname, '/../../deployedABI')) && fs.readFileSync(path.join(__dirname, '/../../deployedABI'), 'utf8')

const klayTogetterContract = DEPLOYED_ABI
    && DEPLOYED_ADDRESS
    && new caver.klay.Contract(JSON.parse(DEPLOYED_ABI), DEPLOYED_ADDRESS);


module.exports = klayTogetterContract;

