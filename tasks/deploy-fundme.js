const { task } = require("hardhat/config")

// task("task名称").setAction(async(参数, 运行时环境) => { task的执行逻辑 });
task("deploy-fundme", "deploy and verify fundme conract").setAction(async(taskArgs, hre) => {
	// create factory
	const fundMeFactory = await ethers.getContractFactory("FundMe")		// 只有在async函数中才可以使用await关键字
	console.log("contract deploying...")
	// deploy contract from factory
	const fundMe = await fundMeFactory.deploy(180)
	await fundMe.waitForDeployment()
	console.log(`contract has been deployed successfully, contract address is ${fundMe.target}`)
	
	// verify contract
	if(hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY){
		// 延迟问题：这里显示的合约部署完成，是指在区块链上部署成功了，但是etherscan还没有把合约记录在自己的数据中，这个时候调用etherscan的api来验证合约，有可能会查不到这个合约地址导致验证失败
		// 解决方法：一般来说，在合约部署完成之后，再等5~6个区块，再验证合约，这个时候大概率可以成功验证
		console.log("Waiting for 5 confirmations...")
		await fundMe.deploymentTransaction().wait(5)
		await verify(fundMe.target, [180])
	}else{
		console.log("verification skipped.")
	}
})

async function verify(fundMeAddr, args) {
	// verify contract
	console.log("contract verification...")
	await hre.run("verify:verify", {
		address: fundMeAddr,
		constructorArguments: args,
	})
}

// 导出task
module.exports = {}


// 运行task：
// npx hardhat deploy-fundme --network sepolia