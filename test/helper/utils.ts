import { BigNumber } from "@ethersproject/bignumber";
import { utils, ethers } from "ethers";
import { type } from "os";

export const parseUnit = (number: number | string, unit?: any): BigNumber => {
  if (typeof number === "number")
    return utils.parseUnits(number.toString(), unit);
  else return utils.parseUnits(number, unit);
};

export const parseEther = (number: number | string): BigNumber => {
  return parseUnit(number);
};

export function getInterfaceID(contractInterface: ethers.utils.Interface) {
  let interfaceID: ethers.BigNumber = ethers.constants.Zero;
  const functions: string[] = Object.keys(contractInterface.functions);
  for (let i = 0; i < functions.length; i++) {
    interfaceID = interfaceID.xor(contractInterface.getSighash(functions[i]));
  }

  return interfaceID;
}
