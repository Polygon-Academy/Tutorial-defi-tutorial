require("dotenv").config();

const mnemonic = process.env.MNEMONIC;
const polygonscanAPI = process.env.ETHERSCANAPI;
const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 1337,
      network_id: "*", // Match any network id
      gasPrice: 20000000000,
    },
    polygon: {
      provider: new HDWalletProvider(mnemonic, process.env.POLYGON_RPC),
      network_id: 137,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
    mumbai: {
      provider: new HDWalletProvider(mnemonic, process.env.POLYGON_MUMBAI_RPC),
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
  },
  contracts_directory: "./src/contracts/",
  contracts_build_directory: "./src/abis/",
  compilers: {
    solc: {
      version: "0.6.11",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },

  // EtherScan / PolygonScan Verify ABI
  plugins: ["truffle-plugin-verify"],

  api_keys: {
    polygonscan: polygonscanAPI,
  },
};
