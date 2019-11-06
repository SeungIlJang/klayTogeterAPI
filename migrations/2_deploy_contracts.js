const fs = require('fs')
const Klaytogetter = artifacts.require('./Klaytogetter.sol')

module.exports = function (deployer) {
  deployer.deploy(Klaytogetter)
    .then(() => {
        if (Klaytogetter._json) {
            fs.writeFile('deployedABI', JSON.stringify(Klaytogetter._json.abi),
            (err) => {
                if(err) throw err;
                console.log("Success Write ABI Content");
            }
            )

            fs.writeFile('deployedAddress', Klaytogetter.address,
                (err) => {
                    if (err) throw err;
                    console.log("Success Write Address Content")
                }
            )
        }
    })
}
