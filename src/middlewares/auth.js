const debug = require('debug')('nodejsexpressapp:auth');
const jwt = require('jsonwebtoken');
const url = require('url');

const authMiddleware = (req, res, next) => {
    let pathName = url.parse(req.url).pathname;
    debug('pathName:',pathName);
    if(pathName.indexOf('login')>-1 || pathName.indexOf('test')>-1 || pathName.indexOf('getBalance')>-1) {
        next();
    }else{
        const token = req.headers['x-access-token'] || req.query.token;

        // token does not exist
        if(!token) {
            return res.status(403).json({
                success: false,
                message: 'not logged in or invalid token!!!'
            })
        }

        // create a promise that decodes the token
        const p = new Promise(
            (resolve, reject) => {
                jwt.verify(token, req.app.get('jwt-secret'), (err, decoded) => {
                    if(err) reject(err)
                    resolve(decoded)
                })
            }
        )

        // if it has failed to verify, it will return an error message
        const onError = (error) => {
            res.status(403).json({
                success: false,
                message: error.message
            })
        }

        // process the promise
        p.then((decoded)=>{
            req.decoded = decoded
            next()
        }).catch(onError)
    }
}

module.exports = authMiddleware;
