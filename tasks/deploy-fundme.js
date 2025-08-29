const { task } = require("hardhat/config")

task("deploy-fundme", "deploy verify fundme contract").setAction(async(taskArgs, hre) => {
    // create factory
    const fundMeFactory = await ethers.getContractFactory("FundMe")
    console.log("contract deploying")
    //deploy constract from factory
    const fundme = await fundMeFactory.deploy(300)
    await fundme.waitForDeployment()
    console.log(`constract has been deployed successfully, contract addrss is ${fundme.target}`);
    
    //verify fundme
    if (hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {
        console.log("waiting for 5 confirmations")
        await fundme.deploymentTransaction().wait(5)
        await verifyFundMe(fundme.target, [300])
    } else {
        console.log("verification skipped...")
    }
})

async function verifyFundMe(fundMeAddr, args) {
    await hre.run("verify:verify", {
        address: fundMeAddr,
        constructorArguments: args
    });
}

module.exports = {}