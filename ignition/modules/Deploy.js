const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("STLModule", (m) => {

  const stlToken = m.contract("STLToken", ["STL Token", "STL"]);

  const stlPool = m.contract("STLPool", [stlToken], {
    after: [stlToken],
  });

  return { stlToken, stlPool };
});