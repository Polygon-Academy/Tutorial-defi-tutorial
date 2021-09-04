const MockMaticToken = artifacts.require("./mock/MaticToken.sol");
const MockETHToken = artifacts.require("./mock/ETHToken.sol");
const MockBTCToken = artifacts.require("./mock/BTCToken.sol");

module.exports = (deployer, network, [owner]) => {
  deployer.then(async () => {
    await deployer.deploy(MockETHToken);
    const ethToken = await MockETHToken.deployed();
    await ethToken.mint(owner, "100000000000000000000");

    await deployer.deploy(MockMaticToken);
    const maticToken = await MockMaticToken.deployed();
    await maticToken.mint(owner, "100000000000000000000");

    await deployer.deploy(MockBTCToken);
    const btcToken = await MockBTCToken.deployed();
    await btcToken.mint(owner, "100000000000000000000");
  });
};
