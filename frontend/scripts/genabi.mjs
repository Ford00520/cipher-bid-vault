import * as fs from "fs";
import * as path from "path";

// Where to output generated ABI/addresses in the frontend
const outdir = path.resolve("./src/lib/generated");

if (!fs.existsSync(outdir)) {
  fs.mkdirSync(outdir, { recursive: true });
}

// Resolve deployments directory from parent hardhat project
const line = "\n===================================================================\n";
const candidates = [
  path.resolve("../deployments"),
  path.resolve("../../deployments"),
];

let deploymentsDir = undefined;
let projectRoot = undefined;
for (const cand of candidates) {
  if (fs.existsSync(cand)) {
    deploymentsDir = cand;
    projectRoot = path.dirname(cand);
    break;
  }
}

if (!deploymentsDir) {
  console.error(
    `${line}Unable to locate a deployments directory. Looked at:\n${candidates
      .map((c) => ` - ${c}`)
      .join("\n")}\n\nEnsure you have deployed contracts (e.g., 'npx hardhat deploy --network localhost') in your Hardhat project.${line}`
  );
  process.exit(1);
}

function readDeployment(chainName, chainId, contractName, optional) {
  const chainDeploymentDir = path.join(deploymentsDir, chainName);

  if (!fs.existsSync(chainDeploymentDir)) {
    const hintRoot = projectRoot ? path.basename(projectRoot) : "<hardhat-project>";
    if (!optional) {
      console.error(
        `${line}Unable to locate '${chainDeploymentDir}' directory.\n\n1. Goto '${hintRoot}' directory\n2. Run 'npx hardhat deploy --network ${chainName}'.${line}`
      );
      process.exit(1);
    }
    return undefined;
  }

  const contractJsonPath = path.join(chainDeploymentDir, `${contractName}.json`);
  if (!fs.existsSync(contractJsonPath)) {
    const hintRoot = projectRoot ? path.basename(projectRoot) : "<hardhat-project>";
    if (!optional) {
      console.error(
        `${line}Missing ${contractName}.json in '${chainDeploymentDir}'.\n\n1. Goto '${hintRoot}' directory\n2. Run 'npx hardhat deploy --network ${chainName}'.${line}`
      );
      process.exit(1);
    }
    return undefined;
  }

  const jsonString = fs.readFileSync(contractJsonPath, "utf-8");
  const obj = JSON.parse(jsonString);
  obj.chainId = chainId;

  return obj;
}

function generateForContract(CONTRACT_NAME) {
  // Try to read localhost deployment
  const deployLocalhost = readDeployment(
    "localhost",
    31337,
    CONTRACT_NAME,
    false /* optional */
  );

  // Sepolia is optional
  let deploySepolia = readDeployment(
    "sepolia",
    11155111,
    CONTRACT_NAME,
    true /* optional */
  );

  if (!deploySepolia) {
    deploySepolia = {
      abi: deployLocalhost.abi,
      address: "0x0000000000000000000000000000000000000000",
    };
  }

  if (deployLocalhost && deploySepolia) {
    if (
      JSON.stringify(deployLocalhost.abi) !==
      JSON.stringify(deploySepolia.abi)
    ) {
      console.error(
        `${line}Deployments on localhost and Sepolia differ for ${CONTRACT_NAME}. ABIs don't match. Consider re-deploying the contracts on both networks.${line}`
      );
      process.exit(1);
    }
  }

  const tsCode = `
/*
  This file is auto-generated.
  Command: 'pnpm genabi'
*/
export const ${CONTRACT_NAME}ABI = ${JSON.stringify(
    { abi: deployLocalhost.abi },
    null,
    2
  )} as const;
`;

  const tsAddresses = `
/*
  This file is auto-generated.
  Command: 'pnpm genabi'
*/
export const ${CONTRACT_NAME}Addresses = {
  "11155111": { address: "${deploySepolia.address}", chainId: 11155111, chainName: "sepolia" },
  "31337": { address: "${deployLocalhost.address}", chainId: 31337, chainName: "localhost" },
} as const;
`;

  console.log(`Generated ${path.join(outdir, `${CONTRACT_NAME}ABI.ts`)}`);
  console.log(`Generated ${path.join(outdir, `${CONTRACT_NAME}Addresses.ts`)}`);

  fs.writeFileSync(path.join(outdir, `${CONTRACT_NAME}ABI.ts`), tsCode, "utf-8");
  fs.writeFileSync(
    path.join(outdir, `${CONTRACT_NAME}Addresses.ts`),
    tsAddresses,
    "utf-8"
  );
}

// Generate ABI and addresses for CipherBidVault
generateForContract("CipherBidVault");
console.log(`${line}Successfully generated ABI and addresses files!${line}`);
