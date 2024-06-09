const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

const ZERO = ethers.parseEther("0"); 
const ONE = ethers.parseEther("1");
const TWO = ethers.parseEther("2");
const THREE = ethers.parseEther("3");
const FOUR = ethers.parseEther("4");
const ONE_HUNDRED = ethers.parseEther("100");


describe("STLPool", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployPool() {
    const [owner, alice, bob, john , jane] = await ethers.getSigners();

    const STLToken = await ethers.getContractFactory("STLToken");
    const stltoken = await STLToken.deploy("STL Token","STL");

    const STLPool = await ethers.getContractFactory("STLPool");
    const stlpool = await STLPool.deploy(stltoken);


    //Mint tokens
    await stltoken.mint(owner, ONE_HUNDRED);

    await expect(stltoken.transfer(alice, ONE))
      .not.to.be.reverted;

    await expect(stltoken.transfer(bob, TWO))
      .not.to.be.reverted;

    await expect(stltoken.transfer(john, TWO))
      .not.to.be.reverted;

    await expect(stltoken.transfer(jane, TWO))
      .not.to.be.reverted;

    await stltoken.approve(stlpool, ONE_HUNDRED);
    await stltoken.connect(alice).approve(stlpool, ONE);
    await stltoken.connect(bob).approve(stlpool, TWO);
    await stltoken.connect(john).approve(stlpool, TWO);
    await stltoken.connect(jane).approve(stlpool, TWO);

    return { stlpool, stltoken, owner, alice, bob, john , jane};
  }

  describe("Deployment", function () {
    it("Should validate when depositing tokens", async () => {
      const { stlpool, stltoken, owner, alice, bob, john , jane } = await loadFixture(deployPool);
      await expect(stlpool.connect(alice).addLiquidity(ONE))
        .to.emit(stlpool, "LogAddLiquidity")
        .withArgs(alice, ONE);
    });

    /// Alice contributes 1 and Bob adds 2 tokens, bringing the total in the pool to 3. 
    /// This means Alice holds 25% of the pool, and Bob has 75%. When HT deposits 3 as
    /// rewards, Alice is eligible to withdraw 2, while Bob can take out 4
    it("Should allow to withdraw rewards after reward", async () => {
      const { stlpool, stltoken, owner, alice, bob, john , jane } = await loadFixture(deployPool);

      await stlpool.connect(alice).addLiquidity(ONE);
      await stlpool.connect(bob).addLiquidity(TWO);

      expect(await stltoken.balanceOf(stlpool)).to.be.equal(THREE);

      await stlpool.addRewards(THREE);

      await expect(stlpool.connect(alice).withdraw())
        .to.changeTokenBalances(stltoken, [alice, stlpool], [TWO,-TWO]);

      await expect(stlpool.connect(bob).withdraw())
        .to.changeTokenBalances(stltoken, [bob, stlpool], [FOUR,-FOUR]);

    });   

    it("Should check the balance of the pool after withdraw ", async () => {
      const { stlpool, stltoken, owner, alice, bob, john , jane } = await loadFixture(deployPool);

      await stlpool.connect(alice).addLiquidity(ONE);
      await stlpool.connect(bob).addLiquidity(TWO);

      expect(await stltoken.balanceOf(stlpool)).to.be.equal(THREE);

      await stlpool.addRewards(THREE);

      await expect(stlpool.connect(alice).withdraw())
        .to.changeTokenBalances(stltoken, [alice, stlpool], [TWO,-TWO]);

      expect(await stltoken.balanceOf(stlpool)).to.be.equal(FOUR);
    });

    /// Alice makes a deposit first, then HT contributes rewards, followed by 
    /// Bob's deposit. If Alice withdraws next and Bob withdraws afterward, Alice 
    /// would receive her initial deposit plus all the rewards. Bob, however, would 
    /// only retrieve his deposit, as he contributed after the rewards were distributed 
    /// to the pool.
    it("Should allow to withdraw without rewards", async () => {
      const { stlpool, stltoken, owner, alice, bob, john , jane } = await loadFixture(deployPool);

      await stlpool.connect(alice).addLiquidity(ONE);
      await stlpool.addRewards(ONE);
      await stlpool.connect(bob).addLiquidity(ONE);

      await expect(stlpool.connect(alice).withdraw())
        .to.changeTokenBalances(stltoken, [alice, stlpool], [TWO,-TWO]);

      await expect(stlpool.connect(bob).withdraw())
        .to.changeTokenBalances(stltoken, [bob, stlpool], [ONE,-ONE]);
    });

    /// Several users add liquidity to the pool and withdraw according to the number 
    /// of rewards deposited after their withdraw.
    it("Should allow to withdraw corresponging rewads several stakers", async () => {
      const { stlpool, stltoken, owner, alice, bob, john , jane } = await loadFixture(deployPool);

      await stlpool.connect(alice).addLiquidity(ONE);
      await stlpool.addRewards(ONE);

      await stlpool.connect(bob).addLiquidity(ONE);
      await stlpool.addRewards(TWO);

      await stlpool.connect(jane).addLiquidity(ONE);
      await stlpool.addRewards(THREE);

      await expect(stlpool.connect(alice).withdraw())
        .to.changeTokenBalances(stltoken, [alice, stlpool], [FOUR,-FOUR]);

      await expect(stlpool.connect(bob).withdraw())
        .to.changeTokenBalances(stltoken, [bob, stlpool], [THREE,-THREE]);

      await expect(stlpool.connect(jane).withdraw())
        .to.changeTokenBalances(stltoken, [jane, stlpool], [TWO,-TWO]);
    });

    it("should withdraw after several deposited rewards", async () => {
      const { stlpool, stltoken, owner, alice, bob, john, jane } = await loadFixture(deployPool);

      await stlpool.connect(alice).addLiquidity(ONE);
      await stlpool.connect(bob).addLiquidity(ONE);

      await stlpool.addRewards(TWO);     
      await stlpool.addRewards(TWO);

      await expect(stlpool.connect(bob).withdraw())
        .to.changeTokenBalances(stltoken, [bob, stlpool], [THREE,-THREE]);

      await expect(stlpool.connect(alice).withdraw())
        .to.changeTokenBalances(stltoken, [alice, stlpool], [THREE,-THREE]);
    })

    it("Should recover funds", async () => {
      const { stlpool, stltoken, owner, alice, bob, john , jane } = await loadFixture(deployPool);

      await stltoken.transfer(stlpool, ONE);
      expect(await stltoken.balanceOf(stlpool)).to.be.equal(ONE);

      await expect(stlpool.recover(owner, stltoken))
        .to.changeTokenBalances(stltoken, [owner, stlpool], [ONE, -ONE]);
    });
  });
});


// STLModule#STLToken - 0xA934379960B2503d29e7F7E49f04248cA04782Ba
// STLModule#STLPool - 0x8D943881eB8F55E4D037b3b2CF731418f619deFD

// https://sepolia.etherscan.io/address/0xA934379960B2503d29e7F7E49f04248cA04782Ba#code
// https://sepolia.etherscan.io/address/0x8D943881eB8F55E4D037b3b2CF731418f619deFD#code