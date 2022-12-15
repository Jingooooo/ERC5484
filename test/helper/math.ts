import { BigNumber } from "@ethersproject/bignumber";
import { parseEther } from ".";
import { blocksPerYear } from "./constants";

export const bnCloseTo = (target: BigNumber, a: BigNumber, b: BigNumber) => {
  return target.gte(a) && target.lt(b);
};

export const divByBlocksPerYear = (num: BigNumber) => {
  return num.div(blocksPerYear);
};

export const getBorrowRate = (
  cash: BigNumber,
  borrow: BigNumber,
  reserve: BigNumber,
  multiplierPerBlock: BigNumber,
  baseRatePerBlock: BigNumber
) => {
  const utilizationRate: BigNumber = borrow
    .mul(parseEther(1))
    .div(cash.add(borrow).sub(reserve));

  return utilizationRate
    .mul(multiplierPerBlock)
    .div(parseEther(1))
    .add(baseRatePerBlock);
};

export const getSupplyRate = (
  cash: BigNumber,
  borrow: BigNumber,
  reserve: BigNumber,
  govDeptRatio: BigNumber,
  multiplierPerBlock: BigNumber,
  baseRatePerBlock: BigNumber
) => {
  const borrowRate: BigNumber = getBorrowRate(
    cash,
    borrow,
    reserve,
    multiplierPerBlock,
    baseRatePerBlock
  );

  return borrowRate.mul(govDeptRatio).div(parseEther(1));
};
