// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import {IEntryPoint} from "@account-abstraction/interfaces/IEntryPoint.sol";
import {BaseAccount} from "@account-abstraction/core/BaseAccount.sol";
// struct representing users Ops
import {UserOperation} from "@account-abstraction/interfaces/UserOperation.sol";
// to validate the signature, can be changed by other signature verification
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// initalizer contract to verify if the signers ( owner of the wallet) are valid and run only once
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import {TokenCallbackHandler} from "@account-abstraction/samples/callback/TokenCallbackHandler.sol";

import {Zapper} from "./../Zapper.sol";

contract Wallet is
    BaseAccount,
    Initializable,
    UUPSUpgradeable,
    TokenCallbackHandler
{
    using ECDSA for bytes32;
    address public owner;

    // immutable to keep track of them
    address public immutable walletFactory;
    IEntryPoint private immutable _entryPoint;

    bool funded;
    Zapper zapper;

    modifier onlyAuthenticated() {
        // add something to authenticate msg.sender
        _;
    }

    event WalletInitialized(IEntryPoint indexed entryPoint, address owner);

    modifier _requireFromEntryPointOrFactory() {
        require(
            msg.sender == address(_entryPoint) || msg.sender == walletFactory,
            "only entry point or wallet factory can call"
        );
        _;
    }

    constructor(IEntryPoint anEntryPoint, address ourWalletFactory) {
        _entryPoint = anEntryPoint;
        walletFactory = ourWalletFactory;
    }

    //////////////////////INITIALIZER//////////////////////////
    function initialize(address initOwner) public initializer {
        _initialize(initOwner);
    }

    function _initialize(address initOwner) internal {
        //require(initialOwners.length > 0, "no owners");
        // verify that the owner is valid through a secp256r1 signature
        owner = initOwner;
        emit WalletInitialized(_entryPoint, initOwner);
    }

    //////////////////////UPGRADE//////////////////////////
    function _authorizeUpgrade(
        address
    ) internal view override _requireFromEntryPointOrFactory {}

    //////////////////////BASE//////////////////////////
    function entryPoint() public view override returns (IEntryPoint) {
        return _entryPoint;
    }

    // create a new way to validate the signature
    // Passkey, digital new signature, etc.
    function _validateSignature(
        UserOperation calldata userOp, // UserOperation data structure passed as input
        bytes32 userOpHash // Hash of the UserOperation without the signatures
    ) internal view override returns (uint256) {
        // Convert the userOpHash to an Ethereum Signed Message Hash
        bytes32 hash = userOpHash.toEthSignedMessageHash();

        if (owner != hash.recover(userOp.signature))
            return SIG_VALIDATION_FAILED;

        // If all signatures are valid (i.e., they all belong to the owners), return 0
        return 0;
    }

    //////////////////////HELPERS//////////////////////////
    function _call(address target, uint256 value, bytes memory data) internal {
        (bool success, bytes memory result) = target.call{value: value}(data);
        if (!success) {
            assembly {
                // The assembly code here skips the first 32 bytes of the result, which contains the length of data.
                // It then loads the actual error message using mload and calls revert with this error message.
                revert(add(result, 32), mload(result))
            }
        }
    }

    function encodeSignatures(
        bytes[] memory signatures
    ) public pure returns (bytes memory) {
        return abi.encode(signatures);
    }

    function getDeposit() public view returns (uint256) {
        return entryPoint().balanceOf(address(this));
    }

    function addDeposit() public payable {
        entryPoint().depositTo{value: msg.value}(address(this));
    }

    // in one function the SCW can do a fusion swap
    function swapTokenWith1Inch(
        IERC20 tokenIn,
        IERC20 tokenOut,
        uint256 amount,
        bytes calldata data
    ) public onlyAuthenticated {
        require(funded);
        Zapper(zapper).zapAndDoSomething{value: amount}(
            tokenIn, // IERC20(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE), // ether
            tokenOut, // APE
            0x1111111254EEB25477B68fb85Ed929f73A960582, // 1inch router
            amount,
            data
        );
    }

    receive() external payable {
        funded = true;
    }

    //////////////////////EXECUTE//////////////////////////
    function execute(
        address dest,
        uint256 value,
        bytes calldata func
    ) external _requireFromEntryPointOrFactory {
        _call(dest, value, func);
    }

    function executeBatch(
        address[] calldata dests,
        uint256[] calldata values,
        bytes[] calldata funcs
    ) external _requireFromEntryPointOrFactory {
        require(dests.length == funcs.length, "wrong dests lengths");
        require(values.length == funcs.length, "wrong values lengths");
        for (uint256 i = 0; i < dests.length; i++) {
            _call(dests[i], values[i], funcs[i]);
        }
    }

    /////////////////////PAYMASTER & ZAPPER //////////////////////////
    function setZapper(Zapper _zapper) external onlyAuthenticated {
        zapper = _zapper;
    }
}
