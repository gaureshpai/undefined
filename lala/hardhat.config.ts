import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:7545",
      chainId: 1337,
      accounts: [
        process.env.NEXT_PUBLIC_ADMIN_PRIVATE_KEY || "0x32e796ffc858b0a72f3638a244c8d8cd1d37b7a5f936d419e3a879f943551519",
      ],
    },
    hardhat: {
      chainId: 31337,
    },
  },
};

export default config;
