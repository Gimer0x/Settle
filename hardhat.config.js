require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();
require("./tasks/balance.js");

/** @type import('hardhat/config').HardhatUserConfig */

// npx hardhat balance --token 0x1c5DB7B6e480fb940aB48254755673492e2948d7 --pool 0xc5B0571565D02DF93b26AD0470251d9C3e428dB8 --network sepolia

const {
  SEPOLIA_URL,
  SEPOLIA_PRIVATE_KEY,
  ETHERSCAN_KEY
} = process.env;

module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: SEPOLIA_URL,
      chainId: 11155111,
      accounts: [ SEPOLIA_PRIVATE_KEY || '']
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_KEY
  }
};