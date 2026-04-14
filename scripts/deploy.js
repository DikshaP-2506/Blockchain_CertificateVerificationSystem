const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const AcademicRegistry = await hre.ethers.getContractFactory("AcademicRegistry");
  const registry = await AcademicRegistry.deploy();

  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log("AcademicRegistry deployed to:", address);

  // Save the contract address and ABI to the frontend
  const frontendDir = path.join(__dirname, '..', 'frontend', 'src', 'utils');
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }

  const artifactPath = path.join(__dirname, '..', 'artifacts', 'contracts', 'AcademicRegistry.sol', 'AcademicRegistry.json');
  if (!fs.existsSync(artifactPath)) {
    console.error("Artifact not found at:", artifactPath);
    console.log("Please run npx hardhat compile first.");
    process.exit(1);
  }
  
  const abi = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  const contractData = {
    address: address,
    abi: abi.abi
  };

  fs.writeFileSync(
    path.join(frontendDir, 'contractData.json'),
    JSON.stringify(contractData, null, 2)
  );

  console.log("Contract data saved to frontend/src/utils/contractData.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
