const { seconds } = require("@nomicfoundation/hardhat-network-helpers/dist/src/helpers/time/duration");

require("@nomicfoundation/hardhat-toolbox");
require("@chainlink/env-enc").config()
require("./tasks/index")
require("hardhat-deploy")

const SEPOLIA_URL = process.env.SEPOLIA_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const PRIVATE_KEY_1 = process.env.PRIVATE_KEY_1

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [PRIVATE_KEY,PRIVATE_KEY_1],
      chainId: 11155111
    }
  },
  etherscan: {
      // Your API key for Etherscan
      // Obtain one at https://etherscan.io/
      apiKey: {
        sepolia: ETHERSCAN_API_KEY
      }
  },
  // sourcify: {
  //   // Disabled by default
  //   // Doesn't need an API key
  //   enabled: true
  // }
  namedAccounts: {
    firstAccount: {
      default: 0
    },
    secondAccount: {
      default: 1
    }
  },
  mocha: {
    timeout: 300000
  },
  gasReporter: {
    enabled: true
  }
};
