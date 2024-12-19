require("@nomicfoundation/hardhat-toolbox")
// require("dotenv/config")
require("@chainlink/env-enc").config()
// require("./tasks/deploy-fundme")  // 引入task
// require("./tasks/interact-fundme")
require("./tasks")
require("hardhat-deploy")
require("@nomicfoundation/hardhat-ethers");
require("hardhat-deploy");
require("hardhat-deploy-ethers");

const SEPOLIA_URL = process.env.SEPOLIA_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const PRIVATE_KEY_1 = process.env.PRIVATE_KEY_1
const PRIVATE_KEY_2 = process.env.PRIVATE_KEY_2
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

// 网络原因不能部署，使用本地网络代理
const { ProxyAgent, setGlobalDispatcher } = require("undici");
proxyAgent = new ProxyAgent("http://127.0.0.1:7890")
setGlobalDispatcher(proxyAgent)

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  defaultNetwork: "hardhat",  // 默认网络
  mocha: {
    timeout: 300000,  // 300s
  },
  networks: {
    sepolia: {
      url: SEPOLIA_URL,       //  第三方服务商提供的jsonRpcUrl，例如：Alchemy, Infura, QuickNode
      accounts: [PRIVATE_KEY, PRIVATE_KEY_1, PRIVATE_KEY_2],
      chainId: 11155111
    }
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY
    }
  },
  namedAccounts: {
    firstAccount: {
      default: 0
    },
    secondAccount: {
      default: 1
    },
    thirdAccount: {
      default: 2
    },
  },
  // sourcify: {
  //   enabled: true
  // },
  mocha: {
    timeout: 1000000000
  },
  gasReporter: {
		enabled: false,
  },
};
