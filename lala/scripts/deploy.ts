import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying PropertyRegistry contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  // Deploy PropertyRegistry
  const PropertyRegistry = await ethers.getContractFactory("PropertyRegistry");
  const propertyRegistry = await PropertyRegistry.deploy();
  await propertyRegistry.deployed();

  const propertyRegistryAddress = await propertyRegistry.address;
  console.log("✅ PropertyRegistry deployed to:", propertyRegistryAddress);

  console.log("\n🚀 Deploying Fractionalizer contract...");

  // Deploy Fractionalizer (pass PropertyRegistry address)
  const Fractionalizer = await ethers.getContractFactory("Fractionalizer");
  const fractionalizer = await Fractionalizer.deploy(propertyRegistryAddress);
  await fractionalizer.deployed();

  const fractionalizerAddress = fractionalizer.address;
  console.log("✅ Fractionalizer deployed to:", fractionalizerAddress);

  // --- Optional Test Flow ---
  console.log("\n🏠 Registering sample property...");

  // Register a sample property (only deployer = owner can call)
  const registerTx = await propertyRegistry.registerProperty(
    "Green Villa",
    deployer.address,
    "https://example.com/partnership-agreement.pdf",
    "https://example.com/maintenance-agreement.pdf",
    "https://example.com/rent-agreement.pdf",
    "https://example.com/green-villa.jpg"
  );
  await registerTx.wait();

  const propertyId = 1;
  const property = await propertyRegistry.getProperty(propertyId);
  console.log("✅ Property Registered:");
  console.log({
    id: property.id.toString(),
    name: property.name,
    imageUrl: property.imageUrl,
  });

  console.log("\n🧩 Fractionalizing property NFT...");
  console.log("Approving Fractionalizer to manage property NFT... \n\n\n\n\n\n\n");
  const approveTx = await propertyRegistry.approve(fractionalizer.address, propertyId);
  await approveTx.wait();
  
  // Fractionalize NFT
  const fractionalizeTx = await fractionalizer.fractionalizeNFT(
    propertyId,
    "GreenVillaShares",
    "GVS",
    1000 // total shares
  );
  await fractionalizeTx.wait();
  console.log("Approved.\n\n\n\n\n\n\n\n");
  

  // Get fractional contract address
  const fractionalNFTAddress = await fractionalizer.getFractionalContract(propertyId);
  console.log("✅ Fractional NFT (ERC20) deployed at:", fractionalNFTAddress);

  // Attach FractionalNFT interface
  const FractionalNFT = await ethers.getContractFactory("FractionalNFT");
  const fractionalNFT = FractionalNFT.attach(fractionalNFTAddress);

  // Verify deployer's balance
  const deployerBalance = await fractionalNFT.balanceOf(deployer.address);
  console.log("📊 Deployer's fractional token balance:", deployerBalance.toString());

  console.log("\n🎉 Deployment and test flow complete!");
}

main().catch((error) => {
  console.error("❌ Error deploying contracts:", error);
  process.exitCode = 1;
});
