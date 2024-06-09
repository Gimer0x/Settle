
task("balance", "Prints the contract's token balance")
  .addParam("token", "Token address")
  .addParam("pool", "Pool address")
  .setAction(async (taskArgs) => {
    const token = await ethers.getContractFactory("STLToken");

    const tokenAddress = taskArgs.token;
    const poolAddress = taskArgs.pool;
    
    const stlToken = await token.attach(tokenAddress);
    
    console.log(await stlToken.totalSupply());
    console.log(await stlToken.balanceOf(poolAddress));
  });