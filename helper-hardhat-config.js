const DECIMAL = 8
const INITIAL_ANSWER = 300000000000
const developmentChains = ["hardhat", "local"]
const LOCK_TIME = 180                           // 部署FundMe合约的锁定期（秒）
const CONFIRMATIONS = 3;                        // 等待部署完成之后的新入块数量
const networkConfig = {
  11155111: {
    ethUsdDataFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",   // sepolia testNet的ETH/USD地址
  },
  97: {
    ethUsdDataFeed: "0x5741306c21795FdCBb9b265Ea0255F499DFe515C",   // BNB Chain Testnet的ETH/USD地址
  },
}
// 根据chainId配置不同的配置

module.exports = {
  DECIMAL,
  INITIAL_ANSWER,
  developmentChains,
  LOCK_TIME,
  CONFIRMATIONS,
  networkConfig
}