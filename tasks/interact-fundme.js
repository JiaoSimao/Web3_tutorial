const { task } = require("hardhat/config")

task("interact-fundme", "interact with fundme contract").addParam("addr", "fundme contract address").setAction(async(taskArgs, hre) => {
    const fundMeFactory = await ethers.getContractFactory("FundMe")
    const fundme = fundMeFactory.attach(taskArgs.addr)
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
})

async function verifyFundMe(fundMeAddr, args) {
    await hre.run("verify:verify", {
        address: fundMeAddr,
        constructorArguments: args
    });
}
module.exports = {}