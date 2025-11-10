import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployed = await deploy("CipherBidVault", {
    from: deployer,
    log: true,
    skipIfAlreadyDeployed: true,
  });

  console.log(`CipherBidVault contract: `, deployed.address);
};
export default func;
func.id = "deploy_cipherBidVault"; // id required to prevent reexecution
func.tags = ["CipherBidVault"];

