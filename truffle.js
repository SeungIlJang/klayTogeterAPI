// config for klaytn
const PrivateKeyConnector = require('connect-privkey-to-provider')
// const HDWalletProvider = require("truffle-hdwallet-provider-klaytn");
const NETWORK_ID = '1001'
const GASLIMIT = '20000000'
const URL = `https://api.baobab.klaytn.net:8651`
const PRIVATE_KEY = '0x205bd81255d2f3fee2dbb5ba7dbd2034c0ae9ca98ca77c4945b239b5dfc2cf4e'

module.exports = {
    networks: {
        klaytn: {
            provider: new PrivateKeyConnector(PRIVATE_KEY, URL),
            // provider: () => new HDWalletProvider(PRIVATE_KEY, URL),
            network_id: NETWORK_ID,
            gas: GASLIMIT,
            gasPrice: null,
        },
    },

    // Specify the version of compiler, we use 0.4.24
    compilers: {
        solc: {
            version: '0.4.24',
        },
    },
}
