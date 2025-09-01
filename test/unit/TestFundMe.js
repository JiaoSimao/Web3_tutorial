const { ethers, deployments, getNamedAccounts, network } = require("hardhat")
const { assert, expect } = require("chai")
const helpers = require("@nomicfoundation/hardhat-network-helpers")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name) 
? describe.skip
:describe("test fundme constructor", async function () {
    let fundMe;
    let fundMeSecondAccount
    let firstAccount;
    let secondAccount;
    let mockV3Aggregator
    beforeEach(async function () {
        await deployments.fixture(["all"])
        firstAccount = (await getNamedAccounts()).firstAccount
        secondAccount = (await getNamedAccounts()).secondAccount
        const fundMeDeployment = await deployments.get("FundMe")
        mockV3Aggregator = await deployments.get("MockV3Aggregator")
        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address)
        fundMeSecondAccount = await ethers.getContractAt("FundMe", secondAccount)
    })

    it("test if owner is msg.sender", async function () {
        // const [firstAccount] = await ethers.getSigners()
        // const fundMeFactory = await ethers.getContractFactory("FundMe")
        // const fundme = await fundMeFactory.deploy(180)
        await fundMe.waitForDeployment()
        assert.equal((await fundMe.owner()), firstAccount)
    })

    it("test if the datafeed is assigned correctly", async function () {
        // fundMeFactory = await ethers.getContractFactory("FundMe")
        // const fundMe = await fundMeFactory.deploy(180)
        await fundMe.waitForDeployment()
        assert.equal((await fundMe.dataFeed()), mockV3Aggregator.address)

    })

    //fund,getFund,refund
    //unit test for fund
    //window open, value greather than minimum value, funder balance
    it("window close, value greather than minimum,fund failed", async function() {
        // make sure the window is closed
        await helpers.time.increase(200)
        await helpers.mine()
        // value is greather minimum value
        expect(fundMe.fund({value: ethers.parseEther("0.2")})).to.be.revertedWith("window is closed")

    })

    it("window open,value is less than minimum, fund failed", async function () {
        expect(fundMe.fund({value: ethers.parseEther("0.01")})).to.be.revertedWith("send more eth")
    })

    it("window open, value is greather than minimum, fund successfully", async function () {
        await fundMe.fund({value: ethers.parseEther("0.1")})
        const balance = await fundMe.fundersToAmount(firstAccount)
        expect(balance).to.equal(ethers.parseEther("0.1"))
    })

    //unit test to get fund
    //onlyOwner, windowclose, target reached
    it("not owner, window closed, targer reached, getFund failed", async function () {
        // make sure the target is reached
        await fundMe.fund({value: ethers.parseEther("1")})

        // make sure the window is closed
        await helpers.time.increase(200)
        await helpers.mine()

        expect(fundMeSecondAccount.getFund()).to.be.revertedWith("this function can only be called by owner")
    })

    it("window open,target reached, getFund failed", async function () {
        await fundMe.fund({value: ethers.parseEther("1")})
        await expect(fundMe.getFund()).to.be.revertedWith("window is not closed")
    })

    it("window closed, target not reached, getFund failed", async function () {
        // make sure the target is reached
        await fundMe.fund({value: ethers.parseEther("0.1")})
        // make sure the window is closed
        await helpers.time.increase(200)
        await helpers.mine()
        await expect(fundMe.getFund()).to.be.revertedWith("Targer is not reached")
    })

    it("window closed, target reached, getFund success", async function () {
        await fundMe.fund({value: ethers.parseEther("1")})
        // make sure the window is closed
        await helpers.time.increase(200)
        await helpers.mine()
        await expect(fundMe.getFund()).to.emit(fundMe, "FundWithdrawnByOwner").withArgs(ethers.parseEther("1.2"))
    })

    //refund
    // window closed, target not reached, funder has balance
    it("window open, target not reached, funder has baleans", async function () {
        await fundMe.fund({value: ethers.parseEther("0.1")})
        await expect(fundMe.refund()).to.be.revertedWith("window is not closed")
    })

    it("window closed, target reached, funder has balance", async function () {
        await fundMe.fund({value: ethers.parseEther("1")})
        // make sure the window is closed
        await helpers.time.increase(200)
        await helpers.mine()
        await expect(fundMe.refund()).to.be.revertedWith("Targer is not reached")
    })

    //这个测试有问题
    // it("window closed, target not reached, funder has balance", async function () {
    //     await fundMe.fund({value: ethers.parseEther("0.1")})
    //     // make sure the window is closed
    //     await helpers.time.increase(200)
    //     await helpers.mine()
    //     await expect(fundMeSecondAccount.refund()).to.be.revertedWith("there is no fund for you")
    // })

    it("window closed, target reached, funder has balance", async function () {
        await fundMe.fund({value: ethers.parseEther("0.1")})
        // make sure the window is closed
        await helpers.time.increase(200)
        await helpers.mine()
        await expect(fundMe.refund()).to.emit(fundMe,  "ReFundWithdrawnByOwner").withArgs(firstAccount, ethers.parseEther("0.1"))

    })
})
