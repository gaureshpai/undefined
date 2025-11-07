import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("PropertyModule", (m) => {
  // 1️⃣ Deploy the PropertyRegistry contract
  const propertyRegistry = m.contract("PropertyRegistry");

  // 2️⃣ Optional: automatically register a sample property after deployment
  // Example owners and shares
  const owners = [
    "0xfbfC843230a08C4BBe8a38827aF18F3124D9aE33",
    "0x79473C6c62ba58328a94a722A2B733433e4d699e",
  ];
  const shares = [60n, 40n];

  // Call the registerProperty() function on the deployed contract
  m.call(propertyRegistry, "registerProperty", ["Green Villa", owners, shares]);

  // 3️⃣ Return deployed contract reference
  return { propertyRegistry };
});
