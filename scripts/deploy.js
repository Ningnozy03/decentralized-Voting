const { ethers } = require("hardhat");

async function main() {
  const Create = await hre.ethers.getContractFactory("Create");
  const create = await Create.deploy();
  
  await create.deployed();
  
  console.log("Contract deployed to:", create.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode =1;
  });
