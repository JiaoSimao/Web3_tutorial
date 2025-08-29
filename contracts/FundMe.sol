// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract FundMe {
    // 1. 创建一个收款函数
    // 2. 记录投资人并且查看
    // 3. 在锁定期内，达到目标值，生产商可以提款
    // 4. 在锁定期内，没有达到目标值，投资人在锁定期以后退款

    uint256 constant MINIMUM_AMOUNT = 100 * 10**18;
    
    uint256 constant TARGET = 1000 * 10 ** 18;

    mapping(address => uint256) public fundersToAmount;

    address public owner;

    uint256 deployTimeStamp;
    uint256 lockTime;

    address erc20Addr;

    bool public getFundSuccess = false;
    AggregatorV3Interface internal dataFeed;


    constructor(uint256 _lockTime) {
        dataFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
        owner = msg.sender;
        deployTimeStamp = block.timestamp;
        lockTime = _lockTime;
    }

    function getChainlinkDataFeedLatestAnswer() public view returns (int256) {
        // prettier-ignore
        (
            /* uint80 roundId */,
            int256 answer,
            /*uint256 startedAt*/,
            /*uint256 updatedAt*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }

    function fund() external payable {
        require(convertEthToUsd(msg.value) >= MINIMUM_AMOUNT, "send more eth");
        require(block.timestamp < deployTimeStamp + lockTime, "window is closed");
        fundersToAmount[msg.sender] = msg.value;
    }

    function convertEthToUsd(uint256 ethAmount)
        internal
        view
        returns (uint256)
    {
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        return (ethAmount * ethPrice) / 10**8;
    }

    function getFund() external payable windowClose onlyOwner{
        require(convertEthToUsd(address(this).balance) >= TARGET, "Targer is not reached");
        //transfer
        // payable(msg.sender).transfer(address(this).balance);
        //send
        // bool success = payable(msg.sender).send(address(this).balance);
        // require(success, "tx failed");
        //call
        bool success;
        (success, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(success, "transfer tx failed");
        fundersToAmount[msg.sender] = 0;
        getFundSuccess = true;
    }

    function refund() external payable windowClose{
        require(convertEthToUsd(address(this).balance) < TARGET, "Targer is not reached");
        require(fundersToAmount[msg.sender] > 0, "thers is no fund for you");
        bool success;
        (success, ) = payable(msg.sender).call{value: fundersToAmount[msg.sender]}("");
        require(success, "transfer tx failed");
        fundersToAmount[msg.sender] = 0;
    }

    function setFunderToAmount(address funder, uint256 amountToUpdate) external {
        require(msg.sender == erc20Addr, "only erc20 contract can call this function");
        fundersToAmount[funder] = amountToUpdate;
    }

    function setErc20Addr(address _erc20Addr) public onlyOwner{
        erc20Addr = _erc20Addr;
    }

    function transferOwnership(address newOwner) public onlyOwner{
        owner = newOwner;
    }

    modifier windowClose() {
        require(block.timestamp >= deployTimeStamp + lockTime, "window is not closed");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "this function can only be called by owner");
        _;
    }
}