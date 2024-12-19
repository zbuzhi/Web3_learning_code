// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// 1、创建一个收款函数
// 2、记录投资人并且查看
// 3、在锁定期内，达到目标值，生产商可以提款
// 4、在锁定期内，没有达到目标值，投资人在锁定期以后退款

contract FundMe{
    mapping (address => uint256) public fundersToAmount;
    
    AggregatorV3Interface public dataFeed;

    uint256 public constant MINIMUM_VALUE = 100 * 10 ** 18;   // USD

    uint256 public constant TARGET = 1000 * 10 ** 18;

    address public owner;

    uint256 deploymentTimestamp;    // 众筹开始的时间
    uint256 lockTime;               // 锁定时长

    address erc20Addr;             
    bool public getFundSuccess = false;

    event FundWithdrawByOwner(uint256);
    event RefundByFunder(address, uint256);

    constructor(uint256 _lockTime, address dataFeedAddr){
        // sepolia testnet
        dataFeed = AggregatorV3Interface(dataFeedAddr);
        owner = msg.sender;
        deploymentTimestamp = block.timestamp;  // 发送合约所在区块的时间点
        lockTime = _lockTime;
    }

    function fund() external payable {
        require(convertEthToUsd(msg.value) >= MINIMUM_VALUE, "Send more ETH");
        require(block.timestamp < deploymentTimestamp + lockTime, "window is closed");
        fundersToAmount[msg.sender] += msg.value;
    }

    function getRunTime()public view returns(uint256){
        return deploymentTimestamp + lockTime;
    }

    /**
     * Returns the latest answer.
     */
    function getChainlinkDataFeedLatestAnswer() public view returns (int) {
        // (uint80 roundID, int answer, uint startedAt, uint timeStamp, uint80 answeredInRound) = dataFeed.latestRoundData();
        (,int answer,,,) = dataFeed.latestRoundData();
        return answer;
    }

    function convertEthToUsd(uint256 ethAmount) internal view returns(uint256){
        // ETH amount * ETH price = ETH value
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        return ethAmount * ethPrice / (10 ** 8);
    }

    function transferOwnership(address newOwner) public onlyOwner {
        owner = newOwner;
    }

    function getFund() external windowClosed onlyOwner {
        require(convertEthToUsd(address(this).balance) >= TARGET, "Target is not reached.");
        // solidity 的三种不同转账方式
        // transfer（纯转账）：transfer ETH and revert if tx failed.
        // payable(msg.sender).transfer(address(this).balance);
        
        // send（纯转账）：transfer ETH and return false if failed.
        // bool success = payable(msg.sender).send(address(this).balance);
        // require(success, "tx failed.");
        
        // call（转账中可调用函数或记录数据）：transfer ETH with data return value of function and bool
        bool success;
        uint256 balance = address(this).balance;
        (success, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(success, "transfer tx failed.");
        getFundSuccess = true;  // flag
        // emit event
        emit FundWithdrawByOwner(balance);
    }

    function refund() external windowClosed {
        require(convertEthToUsd(address(this).balance) < TARGET, "Target is reached.");
        require(fundersToAmount[msg.sender] != 0, "there is no fund for you");
        bool success;
        uint256 balance = fundersToAmount[msg.sender];
        (success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "transfer tx failed.");
        fundersToAmount[msg.sender] = 0;
        emit RefundByFunder(msg.sender, balance);
    }

    function setFunderToAmount(address funder, uint256 amountToUpdate) external {
        require(msg.sender == erc20Addr, "You do not have permission to call this function");
        fundersToAmount[funder] = amountToUpdate;
    }

    function setErc20Addr(address _erc20Addr) public onlyOwner {
        erc20Addr = _erc20Addr;
    }

    // 修改器
    modifier windowClosed() {
        require(block.timestamp >= deploymentTimestamp + lockTime, "window is not closed");
        _;  // 应用此修改器的函数的其他操作，根据位置来决定先执行 修改器的逻辑 还是 函数的逻辑
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "this function can only be called by owner");
        _;
    }
}