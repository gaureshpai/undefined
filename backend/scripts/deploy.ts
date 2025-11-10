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

  // Deploy Fractionalizer
  const Fractionalizer = await ethers.getContractFactory("Fractionalizer");
  const fractionalizer = await Fractionalizer.deploy();
  await fractionalizer.deployed();

  const fractionalizerAddress = fractionalizer.address;
  console.log("✅ Fractionalizer deployed to:", fractionalizerAddress);

  console.log("\n🔗 Setting contract addresses...");
  await fractionalizer.setPropertyRegistryAddress(propertyRegistryAddress);
  await propertyRegistry.setFractionalizerAddress(fractionalizerAddress);
  console.log("✅ Contract addresses set.");

  // --- Optional Test Flow ---
  console.log("\n📝 Creating sample property request...");

  // Create a property request with multiple owners
  const owner1 = deployer.address;
  const owner2 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Example second owner
  
  const createRequestTx = await propertyRegistry.createPropertyRequest(
    "Green Villa",
    "https://example.com/partnership-agreement.pdf",
    "https://example.com/maintenance-agreement.pdf",
    "https://example.com/rent-agreement.pdf",
    "https://example.com/green-villa.jpg",
    [owner1, owner2], // owners
    [6000, 4000] // 60% and 40% (in basis points)
  );
  await createRequestTx.wait();
  console.log("✅ Property request created");
  // Approve the request
  console.log("\n✅ Approving request...");
  const approveRequestTx = await propertyRegistry.approveRequest(1);

  await approveRequestTx.wait();
  console.log("✅ Request approved and property created (and fractionalized)");

  const propertyId = 1;
  const property = await propertyRegistry.getProperty(propertyId);
  console.log("✅ Property Details:");
  console.log({
    id: property.id.toString(),
    name: property.name,
    imageUrl: property.imageUrl,
  });

  // Get property owners
  const [ownerAddresses, percentages] = await propertyRegistry.getPropertyOwners(propertyId);
  console.log("\n👥 Property Owners:");
  for (let i = 0; i < ownerAddresses.length; i++) {
    console.log(`  ${ownerAddresses[i]}: ${percentages[i] / 100}%`);
  }

  // Get fractional contract address
  const fractionalNFTAddress = await fractionalizer.fractionalContracts(propertyId);
  console.log("\n✅ Fractional NFT (ERC20) deployed at:", fractionalNFTAddress);

  // Attach FractionalNFT interface
  const FractionalNFT = await ethers.getContractFactory("FractionalNFT");
  const fractionalNFT = FractionalNFT.attach(fractionalNFTAddress);

  // Verify balances
  console.log("\n📊 Token Balances:");
  for (let i = 0; i < ownerAddresses.length; i++) {
    const balance = await fractionalNFT.balanceOf(ownerAddresses[i]);
    console.log(`  ${ownerAddresses[i]}: ${balance.toString()} tokens`);
  }

  console.log("\n🎉 Deployment and test flow complete!");
  console.log("\n📋 Contract Addresses:");
  console.log(`  PropertyRegistry: ${propertyRegistryAddress}`);
  console.log(`  Fractionalizer: ${fractionalizerAddress}`);
  console.log("\n💡 Update these addresses in your frontend configuration!");
}

main().catch((error) => {
  console.error("❌ Error deploying contracts:", error);
  process.exitCode = 1;
});
