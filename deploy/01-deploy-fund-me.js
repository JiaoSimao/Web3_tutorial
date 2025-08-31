// function deployFunction() {
//     console.log("this is a deploy function");

const { network } = require("hardhat");
const { developmentChains, nerworkConfid, LOCKTIME, CONFIRMATIONS } = require("../helper-hardhat-config")
// const { getNamedAccounts } = require("hardhat");

    
// }

// module.exports.default = deployFunction
// module.exports = async(hre) => {
//     const getNamdeAccounts = hre.getNamdeAccounts
//     const deployments = hre.deployments

//     console.log("this is a deploy function");
// }


module.exports = async({getNamedAccounts, deployments}) => {
    // const firstAccount = (await getNamedAccounts()).firstAccount
    // const deploy = deployments.deploy
    const {firstAccount} = await getNamedAccounts()
    const {deploy} = deployments

    //判断是本地环境还是sepolia
    let dataFeedAddr;
    if(developmentChains.includes(network.name)) {
        const mockV3Aggregator = await deployments.get("MockV3Aggregator")
        dataFeedAddr = mockV3Aggregator.address
    }else {
        dataFeedAddr = nerworkConfid[network.config.chainId].ethUsdDataFeed
    }
    
    const fundMe = await deploy("FundMe", {
        from: firstAccount,
        args: [LOCKTIME, dataFeedAddr],
        log: true,
        waitConfirmations: CONFIRMATIONS
    })

    if (hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {
        await hre.run("verify:verify", {
            address: fundMe.address,
            constructorArguments: [LOCKTIME, dataFeedAddr]
        });
    }else {
        console.log("Network is not sepolia, verification is skipped..");
        
    }
}

module.exports.tags = ["all", "fundme"]