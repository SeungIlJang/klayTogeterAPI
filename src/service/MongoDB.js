const debug = require('debug')('nodejsexpressapp:MongoDb');
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://klayUser:klay123@52.141.16.164:27017/klay';
// var url = 'mongodb://admin:admin123@52.141.16.164:27017/admin';

let  db;

MongoClient.connect(url, function (err, database) {
    if (err) {
        console.error('MongoDB 연결 실패', err);
        return;
    }else{
        console.error('MongoDB 연결 성공 ');
    }
    db = database.db('klay');
});

module.exports = {
    getConnect: async () => {
        try {
            let clientDB=await MongoClient.connect(url);
            return  clientDB.db('klay');
        }catch (e) {
            debug(e);
            return e;
        }
    },
    getCollection:  async function (_collectionName) {
        try {
            return await db.collection(_collectionName);
        }catch (e) {
            debug(e);
            return e;
        }
    },
    insert : async function (_collectionName,_user) {
        try {
            let collection = await this.getCollection(_collectionName);
            return collection.insert(_user).then(results => {
                debug('Promise Based Insert Result : ', results);
                return '';
            }, (err => {
                debug('== Rejected\n', err);
                return err;
            }));

        }catch (e) {
            debug(e);
            return e;
        }

    },
    findOne: async  function (_collectionName,_user) {
        try {
            let collection = await this.getCollection(_collectionName);
            return  await collection.findOne(_user);
        }catch(e){
            debug(e);
            return e;
        }

    },
    find: async function (_collectionName,_user) {
        try {
            let collection = await this.getCollection(_collectionName);
            return await collection.find(_user).toArray();

        }catch(e) {
            debug(e);
            return e;
        }
    },
    findAll: async function (_collectionName) {
        try {
            let collection = await this.getCollection(_collectionName);
            return await collection.find().toArray();

        }catch(e) {
            debug(e);
            return e;
        }
    }
};
