const { task } = require("hardhat/config")

task("interact-fundme")
.setDescription("Interacting with Fundme contract")
.addParam("addr", "fundme contract address")
.setAction(async(taskArgs, hre) => {
	const fundMeFactory = await ethers.getContractFactory("FundMe")	
	const fundMe = fundMeFactory.attach(taskArgs.addr)
	
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
})

module.exports = {}