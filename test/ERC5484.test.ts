import { expect } from "chai";
import { ethers } from "hardhat";
import { parseEther, ZERO, ZERO_ADDRESS } from "./helper";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { BigNumber } from "ethers";

export const ISSUER_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes("ISSUER_ROLE")
);

const name = "SBT";
const symbol = "SBT";

const enum BrunAuth {
  IssuerOnly,
  OwnerOnly,
  Both,
  Neither,
}

async function deploySBT() {
  const [admin, user1, user2] = await ethers.getSigners();
  const tokenFactory = await ethers.getContractFactory("SBT");
  const NFT = await tokenFactory.deploy(name, symbol);

  await NFT.grantRole(ISSUER_ROLE, admin.address);

  return { NFT, admin, user1, user2 };
}

describe("ERC5484 - SBT Test", () => {
  it("metadatas", async () => {
    const { NFT, admin, user1, user2 } = await loadFixture(deploySBT);

    expect(await NFT.name()).to.equal("SBT");
    expect(await NFT.symbol()).to.equal("SBT");
    expect(await NFT.hasRole(ISSUER_ROLE, admin.address)).to.be.true;
  });

  it("interface", async () => {
    const { NFT, admin, user1, user2 } = await loadFixture(deploySBT);

    // EIP-165 interface
    expect(await NFT.supportsInterface("0x01ffc9a7")).to.be.true;
    // EIP-721 interface
    expect(await NFT.supportsInterface("0x80ac58cd")).to.be.true;
    // EIP-5484 interface
    expect(await NFT.supportsInterface("0x0489b56f")).to.be.true;
  });

  it("mint token from issuer", async () => {
    const { NFT, admin, user1 } = await loadFixture(deploySBT);

    const tx = NFT.mint(user1.address, 1, BrunAuth.IssuerOnly);

    await expect(tx)
      .to.emit(NFT, "Transfer")
      .withArgs(ZERO_ADDRESS, user1.address, 1);
    await expect(tx)
      .to.emit(NFT, "Issued")
      .withArgs(admin.address, user1.address, 1, BrunAuth.IssuerOnly);

    expect(await NFT.balanceOf(user1.address)).to.equal(1);
    expect(await NFT.burnAuth(1)).to.equal(BrunAuth.IssuerOnly);
  });

  it("mint token from non-issuer", async () => {
    const { NFT, admin, user1, user2 } = await loadFixture(deploySBT);

    await expect(
      NFT.connect(user1).mint(user1.address, 1, BrunAuth.IssuerOnly)
    ).to.revertedWith("ERC5484: try to mint from who is not issuer");
  });

  it("burn token without ownership or auth", async () => {
    const { NFT, admin, user1, user2 } = await loadFixture(deploySBT);

    await NFT.mint(user1.address, 1, BrunAuth.IssuerOnly);

    await expect(NFT.connect(user2).burn(1)).to.revertedWith(
      "ERC5484 : burn authorization failed."
    );

    await NFT.mint(user1.address, 2, BrunAuth.Both);

    await expect(NFT.connect(user2).burn(1)).to.revertedWith(
      "ERC5484 : burn authorization failed."
    );
  });

  it("burn token with BrunAuth.IssuerOnly", async () => {
    const { NFT, admin, user1, user2 } = await loadFixture(deploySBT);

    await NFT.mint(user1.address, 1, BrunAuth.IssuerOnly);

    await expect(NFT.connect(user1).burn(1)).to.revertedWith(
      "ERC5484 : burn authorization failed."
    );

    await expect(NFT.burn(1))
      .to.emit(NFT, "Transfer")
      .withArgs(user1.address, ZERO_ADDRESS, 1);

    expect(await NFT.balanceOf(user1.address)).to.equal(0);
  });

  it("burn token with BrunAuth.OwnerOnly", async () => {
    const { NFT, admin, user1, user2 } = await loadFixture(deploySBT);

    await NFT.mint(user1.address, 1, BrunAuth.OwnerOnly);

    await expect(NFT.burn(1)).to.revertedWith(
      "ERC5484 : burn authorization failed."
    );

    await expect(NFT.connect(user1).burn(1))
      .to.emit(NFT, "Transfer")
      .withArgs(user1.address, ZERO_ADDRESS, 1);

    expect(await NFT.balanceOf(user1.address)).to.equal(0);
  });
});
