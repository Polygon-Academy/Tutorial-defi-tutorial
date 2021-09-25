const StdReferenceChain = artifacts.require("StdReferenceChain");
const StdReferenceProxy = artifacts.require("StdReferenceProxy");
const BandPriceOracle = artifacts.require("BandPriceOracle");
const poolConfigData = require("./config/develop_pool_config.json");

const MockMaticToken = artifacts.require("./mock/MaticToken.sol");
const MockETHToken = artifacts.require("./mock/ETHToken.sol");
const MockBTCToken = artifacts.require("./mock/BTCToken.sol");

module.exports = (deployer, network, accounts) => {
  deployer.then(async () => {
    // step 1 : deploy the ChainPriceOracle;
    await deployer.deploy(StdReferenceChain);
    const stdReferenceChain = await StdReferenceChain.deployed();

    // step 2 : deploy the PriceOracleProxy
    const tokenPriceOralceAddress = stdReferenceChain.address;
    await deployer.deploy(StdReferenceProxy, tokenPriceOralceAddress);

    // step 3 : deploy the BandPriceOracle
    const stdReferenceAddress = (await StdReferenceProxy.deployed()).address;
    let tokenAddresses = {};
    tokenAddresses["WETH"] = (await MockETHToken.deployed()).address;
    tokenAddresses["MATIC"] = (await MockMaticToken.deployed()).address;
    tokenAddresses["BTCB"] = (await MockBTCToken.deployed()).address;

    await deployer.deploy(BandPriceOracle, stdReferenceAddress);
    const bandOracle = await BandPriceOracle.deployed();
    for (const key of Object.keys(poolConfigData)) {
      const token = poolConfigData[key];
      await bandOracle.setTokenPairMap(tokenAddresses[key], token.pair);
    }
  });
};
