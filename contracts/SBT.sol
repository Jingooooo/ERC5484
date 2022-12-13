// SPDX-License-Identifier: NONE
pragma solidity ^0.8.0;

import "./ERC5484v2.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract SBT is ERC5484, AccessControl {
    string public constant version_ = "0.1";

    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    bytes32 private constant _MINT_TYPEHASH =
        keccak256("Mint(address to,uint256 tokenId,BurnAuth auth)");
    bytes32 private constant _BURN_TYPEHASH =
        keccak256("Burn(uint256 tokenId)");

    constructor(
        string memory name_,
        string memory symbol_
    ) ERC5484(name_, symbol_) {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC5484, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _isIssuer(address issuer) internal view override returns (bool) {
        return hasRole(ISSUER_ROLE, issuer);
    }

    function mint(
        address to,
        uint256 tokenId,
        BurnAuth auth,
        bytes calldata signature
    ) external onlyRole(ISSUER_ROLE) {
        address signer = ECDSA.recover(_MINT_TYPEHASH, signature);

        require(signer == to, "ERC5484: invalid signature");

        _mint(to, tokenId, auth);
    }

    // function _checkBurnAuth(
    //     uint256 tokenId,
    //     bytes memory signature
    // ) internal view override {
    //     BurnAuth auth = _burnAuthOf(tokenId);

    //     if (auth == BurnAuth.IssuerOnly) {
    //         address issuer = _issuerOf(tokenId);
    //         require(
    //             _isIssuer(issuer, tokenId),
    //             "ERC5484 : burn authorization failed."
    //         );
    //     } else if (auth == BurnAuth.OwnerOnly) {
    //         address owner = ERC5484.ownerOf(tokenId);
    //         require(
    //             _msgSender() == owner,
    //             "ERC5484 : burn authorization failed."
    //         );
    //     } else if (auth == BurnAuth.Both) {
    //         // address issuer = _issuerOf(tokenId);
    //         // address owner = ERC5484.ownerOf(tokenId);
    //         // require(
    //         //     _msgSender() == owner,
    //         //     "ERC5484 : burn authorization failed."
    //         // );
    //     } else if (auth == BurnAuth.Neither) {}

    function burn(uint256 tokenId) external {
        _burn(tokenId);
    }
}
