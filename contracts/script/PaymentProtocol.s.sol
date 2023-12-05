// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import "../src/AA/WalletFactory.sol";
import {IEntryPoint} from "@account-abstraction/interfaces/IEntryPoint.sol";
import {Zapper} from "../src/Zapper.sol";

contract PaymentPScript is Script {
    // Address of the EntryPoint contract on Goerli
    IEntryPoint constant ENTRYPOINT =
        IEntryPoint(0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789);

    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY"); // Fetch the private key from environment variables
        vm.startBroadcast(deployerPrivateKey); // Start broadcasting transactions

        // Initialize the Zapper contract
        Zapper zapper = new Zapper();

        // Initialize the WalletFactory contract
        WalletFactory walletFactory = new WalletFactory(ENTRYPOINT, zapper);

        vm.stopBroadcast(); // Stop broadcasting transactions
    }
}
