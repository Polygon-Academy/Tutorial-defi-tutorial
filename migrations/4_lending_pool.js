const AlTokenDeployer = artifacts.require("AlTokenDeployer");
const BandPriceOracle = artifacts.require("BandPriceOracle");
const LendingPool = artifacts.require("LendingPool");
const DefaultPoolConfiguration = artifacts.require("DefaultPoolConfiguration");
const poolConfigData = require("./config/develop_pool_config.json");

const MockMaticToken = artifacts.require("./mock/MaticToken.sol");
const MockETHToken = artifacts.require("./mock/ETHToken.sol");
const MockBTCToken = artifacts.require("./mock/BTCToken.sol");

module.exports = async (deployer, network, accounts) => {

  const poolStatus = {
    INACTIVE: 0,
    ACTIVE: 1,
    CLOSED: 2,
  };

  deployer.then(async () => {
    await deployer.deploy(AlTokenDeployer);
    const alTokenDeployer = await AlTokenDeployer.deployed();

    await deployer.deploy(LendingPool, alTokenDeployer.address);
    const lendingPool = await LendingPool.deployed();
    console.log("LendingPool Address: ", lendingPool.address);

    const bandOracle = await BandPriceOracle.deployed();
    await lendingPool.setPriceOracle(bandOracle.address);

    let tokenAddresses = {};
    tokenAddresses["MATIC"] = (await MockMaticToken.deployed()).address;
    tokenAddresses["WETH"] = (await MockETHToken.deployed()).address;
    tokenAddresses["BTCB"] = (await MockBTCToken.deployed()).address;

    for (const key of Object.keys(poolConfigData)) {
      const token = poolConfigData[key];
      await deployer.deploy(
        DefaultPoolConfiguration,
        token.baseBorrowRate,
        token.rateSlope1,
        token.rateSlope2,
        token.collateralPercent,
        token.liquidationBonus
      );
      const poolConfig = await DefaultPoolConfiguration.deployed();
      await lendingPool.initPool(tokenAddresses[key], poolConfig.address);
      await lendingPool.setPoolStatus(tokenAddresses[key], poolStatus.ACTIVE);
    }



    const fs = require('fs');
    let config = `
        export const alTokenAddress = "${alTokenDeployer.address}"
        export const tokenAddresses = ${JSON.stringify(tokenAddresses)}
        export const bandPriceOracleAddress = "${bandOracle.address}"
        export const lendingPoolAddress = "${lendingPool.address}"
    `.replace(/^(\s+)(?=export)/gm, ``);
    let data = JSON.stringify(config);
   
    fs.writeFileSync('./src/config.js', JSON.parse(data))
  }
  
  );
};
