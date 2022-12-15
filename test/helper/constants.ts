import { constants, BigNumber } from "ethers";
import { parseEther } from "./utils";

export const MAX_UINT = constants.MaxUint256;
export const ZERO_ADDRESS: string = constants.AddressZero;
export const ZERO = constants.Zero;
export const blocksPerYear = BigNumber.from(2102400);

export const BaseRatePerYear = parseEther(1);
export const multiplierPerYear = parseEther(2);
export const GovDebtRatio = parseEther(0.5);

export const BASE_TOKEN_BALANCE = 10;
export const DECIMAL = 8;
