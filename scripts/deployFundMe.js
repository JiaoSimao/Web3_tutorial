//import ethers.js
//create main function
//execute main function

const {ethers} = require("hardhat")

async function main() {
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

    // init 2 accounts
    const [firstAccount, secondAccount] = await ethers.getSigners()
    // fund contract with first account
    const fundTX = await fundme.fund({value: ethers.parseEther("0.5")})
    await fundTX.wait()
    // check balance of contract
    const balanceOfContract = await ethers.provider.getBalance(fundme.target)
    console.log(`Balance of the contract is ${balanceOfContract}`)
    // fund contract with second account
    const fundTXWithSecondAccount = await fundme.connect(secondAccount).fund({value: ethers.parseEther("0.5")})
    await fundTXWithSecondAccount.wait()
    // check balance of contract
    const balanceOfContractAfterSecondAccount = await ethers.provider.getBalance(fundme.target)
    console.log(`Balance of the contract is ${balanceOfContractAfterSecondAccount}`)
    // check mapping fundersToAmount
    const firstAccountBalanceInFundMe = await fundme.fundersToAmount(firstAccount.address)
    const secondAccountBalanceInFundMe = await fundme.fundersToAmount(secondAccount.address)
    console.log(`balance of firstaccount is ${firstAccountBalanceInFundMe}`)
    onsole.log(`balance of firstaccount is ${secondAccountBalanceInFundMe}`)
}

async function verifyFundMe(fundMeAddr, args) {
    await hre.run("verify:verify", {
        address: fundMeAddr,
        constructorArguments: args
    });
}
main().then().catch((error) => {
    console.error(error)
    process.exit(1)
})
