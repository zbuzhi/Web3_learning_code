require("@nomicfoundation/hardhat-toolbox")
// require("dotenv/config")
require("@chainlink/env-enc").config()
// require("./tasks/deploy-fundme")  // 引入task
// require("./tasks/interact-fundme")
require("./tasks")

const SEPOLIA_URL = process.env.SEPOLIA_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const PRIVATE_KEY_1 = process.env.PRIVATE_KEY_1
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

// 网络原因不能部署，使用本地网络代理
const { ProxyAgent, setGlobalDispatcher } = require("undici");
proxyAgent = new ProxyAgent("http://127.0.0.1:7890")
setGlobalDispatcher(proxyAgent)

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      // url: "", 第三方服务商，拿到jsonRpcUrl，例如：Alchemy, Infura, QuickNode
      url: SEPOLIA_URL,
      accounts: [PRIVATE_KEY, PRIVATE_KEY_1],
      chainId: 11155111
    }
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY
    }
  },
  // sourcify: {
  //   enabled: true
  // },
  mocha: {
    timeout: 1000000000
  }
};
