import { waffle, ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { BigNumber, utils } from "ethers";

const hre: HardhatRuntimeEnvironment = require("hardhat");

export async function mineBlock() {
  await hre.network.provider.request({ method: "evm_mine" });
}

export async function mineBlocks(numebr: number) {
  for (let i = 0; i < numebr; i++) {
    await mineBlock();
  }
}

export function currentblock(): Promise<number> {
  return ethers.provider.getBlockNumber();
}

export const takeSnapshot = async () => {
  const result = await hre.network.provider.request({ method: "evm_snapshot" });
  await mineBlock();
  return result;
};

/**
 *  Restores a snapshot that was previously taken with takeSnapshot
 *  @param id The ID that was returned when takeSnapshot was called.
 */
export const revertSnapshot = async (id: any) => {
  await hre.network.provider.request({ method: "evm_revert", params: [id] });
  return await mineBlock();
};
