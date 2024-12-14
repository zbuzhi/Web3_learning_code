// import ethers.js
// create main function
// execute main function

const  { ethers } = require("hardhat")

// const { ProxyAgent, setGlobalDispatcher } = require("undici");
// proxyAgent = new ProxyAgent("http://127.0.0.1:7890")
// setGlobalDispatcher(proxyAgent)

async function main() {
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
		verify(fundMe.target, [180])
	}else{
		console.log("verification skipped.")
	}

	// init 2 accounts
	const [firstAccount, secondAccount] = await ethers.getSigners()	// 获取hardhat配置文件里的两个不同的私钥所代表的账户

	// fund contract with first account
	const fundTx = await fundMe.fund({value: ethers.parseEther("0.2")})	// 因为fund是payable函数，所以需要指定eth的数量；solidity中是不能用小数，所以需要对单位进行转换 ethers.parseEther("")
	await fundTx.wait()	// 等待交易完成（上一步只是发送交易成功，但是交易还没有完成，需要等待交易完成）

	// check balacce of contract
	const blanceOfContract = await ethers.provider.getBalance(fundMe.target)
	console.log(`Balance of the contract is ${blanceOfContract}`)

	// fund contract with second account
	await fundMe.connect()
	const fundTxWithSecondAccount = await fundMe.connect(secondAccount).fund({value: ethers.parseEther("0.2")})	// .connect() 不写，默认使用的是第一个账户
	await fundTxWithSecondAccount.wait()

	// check balance of contract
	const blanceOfContractAfterSecondFund = await ethers.provider.getBalance(fundMe.target)
	console.log(`Balance of the contract is ${blanceOfContractAfterSecondFund}`)

	// check mapping fundersToAmount
	const firstAccountBalanceInFundMe = await fundMe.fundersToAmount(firstAccount.address)
	const secondAccountBalanceInFundMe = await fundMe.fundersToAmount(secondAccount.address)
	console.log(`Balance of first account ${firstAccount.address} is ${firstAccountBalanceInFundMe}`)
	console.log(`Balance of second account ${secondAccount.address} is ${secondAccountBalanceInFundMe}`)

}

async function verify(fundMeAddr, args) {
	// verify contract
	console.log("contract verification...")
	await hre.run("verify:verify", {
		address: fundMeAddr,
		constructorArguments: args,
	});
}

main().then().catch((error) => {
	console.error(error)
	process.exit(1)	// 0正常退出 1异常退出
})