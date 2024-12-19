const { DECIMAL, INITIAL_ANSWER, developmentChains} = require("../helper-hardhat-config")

const { ProxyAgent, setGlobalDispatcher } = require("undici");
proxyAgent = new ProxyAgent("http://127.0.0.1:7890")
setGlobalDispatcher(proxyAgent)

module.exports=async({getNamedAccounts, deployments}) => {
	if(developmentChains.includes(network.name)){
		const {firstAccount} = await getNamedAccounts()
		const {deploy} = deployments
		await deploy("MockV3Aggregator", {
			from: firstAccount,
			args: [DECIMAL, INITIAL_ANSWER],		// Mock合约构造函数的入参： 在chainlink的喂价体系里一个通证对的USD都是8位，如果通证对应ETH是18位、假设$3000美元/ETH，由于是8位的小数，所以是3000*10^8
			log: true
		})
	}else{
		console.log("environment is not local, mock contract deployment is skipped...")
	}	
}

module.exports.tags = ["all", "mock"]