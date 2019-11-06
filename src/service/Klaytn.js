const caver = require('../klaytn/caver');
const klayTogetherContract = require('../klaytn/KlayTogetherContract');
const debug = require('debug')('nodejsexpressapp:klaytn');
const serviceMongDB = require('../service/MongoDB');
const jwt = require('jsonwebtoken');
let masterAddress;
const init = () => {
    const masterPrivateKey = '0x205bd81255d2f3fee2dbb5ba7dbd2034c0ae9ca98ca77c4945b239b5dfc2cf4e';
    masterAddress = '0x850633ad76bfee965002a8c9924ab58145231ad8';
    // (1) Add User Private Key
    caver.klay.accounts.wallet.add(masterPrivateKey);
};
init();

const sendTransaction = (_address) => {
    // (2) Create Transaction
    const transaction = {
        type: 'VALUE_TRANSFER',
        from: masterAddress,
        to: _address,
        gas: '300000',
        value: caver.utils.toPeb('0.05', 'KLAY'),
    };
    // (3) Send Transaction
    return caver.klay.sendTransaction(transaction)
        .on('transactionHash', console.log)
        .on('receipt', async (receipt) => {
            const newAccountBalance = await caver.klay.getBalance(_address);
            console.log(newAccountBalance);
            let rtnValue = {
                hash:receipt.transactionHash,
                balance:newAccountBalance
            };
            return rtnValue;
        })
        .on('error', console.log);

};

const integrateWallet = async (_privateKey) => {
    const walletInstance = await caver.klay.accounts.privateKeyToAccount(_privateKey);
    debug('walletInstance.address:',walletInstance.address);
    try {
        caver.klay.accounts.wallet.add(walletInstance);
    }catch (e) {
        debug(e);
    }
    klayTogetherContract.options.from = walletInstance.address;
    debug('length:',caver.klay.accounts.wallet.length);
};
const selectMemberByAddress = async (_address) =>{
    let checkUser ={
        address:_address
    };
    try {
        return await serviceMongDB.findOne("users", checkUser);
    }catch (e) {
        debug(e);
        return e;
    }
};

const setOptionsFrom = async (_address) =>{
    klayTogetherContract.options.from = _address;
};

const setWallet = async (_address) => {
    debug('setWallet');
    let memberInfo = await selectMemberByAddress(_address);
    integrateWallet(memberInfo.private);
};
const removeWallet = async (_address) => {
    debug('removeWallet');
    await caver.klay.accounts.wallet.remove(_address);
};

module.exports = {

    getBalance: async function (_adress) {
        return await caver.klay.getBalance(_adress);
    },
    createAccount : async  function(){
        return await caver.klay.accounts.create();
    },
    callOwner: async function () {
        return await klayTogetherContract.methods.owner().call();
    },
    callContractBalance: async function () {
        return await klayTogetherContract.methods.getBalance().call();
    },

    createMember: function (_kakaoId,_address) {

        return klayTogetherContract.methods.createMember(_kakaoId,_address).send({
            from: masterAddress,
            gas: '250000'
        }).then(function (receipt) {
            if (receipt.status) {
                debug('transactionHash:',receipt.transactionHash);
                return receipt.transactionHash;
            }
        }).catch(err =>{
            debug(err);
        });
    },
    createNest: async function (_paramInfo) {
        await setWallet(_paramInfo.address);
        debug('_paramInfo.depositValue:',_paramInfo.depositValue);
        return klayTogetherContract.methods.createNest(_paramInfo.nestName,_paramInfo.eggCnt,_paramInfo.amount,_paramInfo.period,_paramInfo.rate,_paramInfo.turn).send({
                from: _paramInfo.address,
                gas: '1000000',
                value: _paramInfo.depositValue
            }).then(function (receipt) {
                removeWallet(_paramInfo.address);
                debug('length:',caver.klay.accounts.wallet.length);
                if (receipt.status) {
                    debug(receipt);
                    return receipt.transactionHash;
                }
            }).catch(err =>{
                removeWallet(_paramInfo.address);
                debug('length:',caver.klay.accounts.wallet.length);
                debug(err);
                return err;
            });
    },
    joinNest: async function (_paramInfo) {
        await setWallet(_paramInfo.address);
        debug('_paramInfo.depositValue:',_paramInfo.depositValue);
        return klayTogetherContract.methods.joinNest(_paramInfo.nestId,_paramInfo.turn).send({
            from: _paramInfo.address,
            gas: '1000000',
            value: _paramInfo.depositValue
        }).then(function (receipt) {
            removeWallet(_paramInfo.address);
            debug('length:',caver.klay.accounts.wallet.length);
            if (receipt.status) {
                debug(receipt);
                return receipt.transactionHash;
            }
        }).catch(err =>{
            removeWallet(_paramInfo.address);
            debug('length:',caver.klay.accounts.wallet.length);
            debug(err);
            return err;
        });
    },
    getMemberLength: async function () {
        return await klayTogetherContract.methods.getMemberLength().call();
    },
    getNestLength: async function () {
        return await klayTogetherContract.methods.getNestIdListLength().call();
    },
    getNestDetail: async function (_nestId) {
        return await klayTogetherContract.methods.nestMapping(_nestId).call();
    },
    //멤버가 속한 nestId 배열 반환
    getMemberNestIdArray: async function (_address) {
        await setOptionsFrom(_address);
        return await klayTogetherContract.methods.getMemberNestIdArray().call();
    },
    getMemberNestList: async function(_address){
        let rtnArray = new Array();
        let memberNestIdArray = await this.getMemberNestIdArray(_address);
        debug(memberNestIdArray);
        for(let i=0; i< memberNestIdArray.length; i++){
            let nestId = memberNestIdArray[i];
            let nestDetail = await this.getNestDetail(nestId);
            nestDetail.eggs = await this.getNestMemberList(nestId);
            debug(nestDetail);
            rtnArray.push(nestDetail);
        }
        // String 형태로 변환
        // var jsonData = JSON.stringify(rtnArray) ;

        return rtnArray;
        // return jsonData;
    },
    getNestList: async function(){
        let rtnArray = new Array();
        let nestLength = await this.getNestLength();
        debug(nestLength);
        for(let i=0; i< nestLength; i++){
            let nestId = memberNestIdArray[i];
            let nestDetail = await this.getNestDetail(nestId);
            nestDetail.eggs = await this.getNestMemberList(nestId);
            debug(nestDetail);
            rtnArray.push(nestDetail);
        }
        // String 형태로 변환
        // var jsonData = JSON.stringify(rtnArray) ;

        return rtnArray;
        // return jsonData;
    },
    //nest에 포함된 Id 배열 반환
    getNestMemberIdArray: async function (_nestId) {
        return await  klayTogetherContract.methods.getNestMemberIdArray(_nestId).call();
    },
    getNestEggsDetail: async function (_nestMemberId) {
        return await klayTogetherContract.methods.nestEggsInfos(_nestMemberId).call();
    },
    getMemberAdressListOfNest : async function(_nestId){
        return await klayTogetherContract.methods.getMemberAdressListOfNest(_nestId).call();
    },
    getEggInfoOfNest : async function(_nestId,_address){
        return await klayTogetherContract.methods.getEggInfoOfNest(_nestId,_address).call();
    },
    getEggListOfNest : async function(_nestId){
        let rtnArray = new Array();
        let nestMemberAdressList = await this.getMemberAdressListOfNest(_nestId);
        debug(nestMemberAdressList);
        for(let i=0; i< nestMemberAdressList.length; i++){
            let eggAddress = nestMemberAdressList[i];
            let nestEggDetail = await this.getEggInfoOfNest(_nestId,eggAddress);
            debug(nestEggDetail);
            rtnArray.push(nestEggDetail);
        }
        return rtnArray;
    },
    getNestMemberList: async function(_nestId){
        let rtnArray = new Array();
        let nestMemberIdArray = await this.getNestMemberIdArray(_nestId);
        debug(nestMemberIdArray);
        for(let i=0; i< nestMemberIdArray.length; i++){
            let nestMemberId = nestMemberIdArray[i];
            let nestMemberDetail = await this.getNestEggsDetail(nestMemberId);
            debug(nestMemberDetail);
            rtnArray.push(nestMemberDetail);
        }
        // String 형태로 변환
        // var jsonData = JSON.stringify(rtnArray) ;

        return rtnArray;
        // return jsonData;
    },
    getMemberId: async function (_address) {
        await setOptionsFrom(_address);
        return await klayTogetherContract.methods.getMemberId().call();
    },
    getMemberInfo: async function (memberId) {
        return  await klayTogetherContract.methods.members(memberId).call();

    },

    jwtCreate : async (_kakaoId, _secret) =>{
        let rtnValue;
        try {
            rtnValue = await jwt.sign(
                {_id: _kakaoId},
                _secret,
                {
                    expiresIn: '1d',
                    issuer: 'KlayTogether.com'
                });
        }catch (e) {
            rtnValue = e;
        }
        return rtnValue;
    },
    login: async function(_kakaoId,_secret) {
        debug('kakaoId:',_kakaoId);
        debug('secret:',_secret);

        let checkUser ={
            kakaoId:_kakaoId
        };
        let user;
        try {
            user = await serviceMongDB.findOne("users", checkUser);
            debug('user:',user);
        }catch (e) {
            debug(e);
            return e;
        }

        if(user){
            try {
                let jwtToken = await this.jwtCreate(_kakaoId, _secret);
                let rtnUser = {
                    kakaoId: user.kakaoId,
                    address: user.address,
                    token: jwtToken
                };
                // klayTogetherContract.options.from = user.address;
                return rtnUser;
            }catch(e){
                return e;
            }

        }else{
            try {
                let walletInstance = await this.createAccount();

                debug('walletInstance:',walletInstance);
                let newUser = {
                    kakaoId: _kakaoId,
                    address:walletInstance.address,
                    private:walletInstance.privateKey
                };

                let rtnValue = await serviceMongDB.insert("users", newUser);
                if(rtnValue!=='')debug('insert err:',rtnValue);

                let jwtToken = await this.jwtCreate(_kakaoId, _secret);
                let hash = await this.createMember(_kakaoId,newUser.address);
                let rtnObj = await sendTransaction(newUser.address);
                let rtnUser = {
                    kakaoId :   newUser.kakaoId,
                    address :   newUser.address,
                    token   :   jwtToken,
                    hash    :   rtnObj.hash,
                    balance: rtnObj.balance
                };

                return rtnUser;

            }catch (e) {
                debug(e);
                return e;
            }
        }
    },
    connectionTest : async function () {
        let user = {
            kakaoId: 'k1',
            address:'a2',
            token:'t3'
        };
        // serviceMongDB.insert("users",user);
        let returnValue = await serviceMongDB.find("users",user);
        debug('API:',returnValue);
        return returnValue;

        // return await klayTogetherContract.methods.connectionTest().call();
    }


};


