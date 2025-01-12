// SPDX-License-Identifier: MIT
pragma solidity =0.5.16;

import "../src/UniswapV2Pair.sol";
import "../src/UniswapV2Factory.sol";

contract InitHashTest {
    function setUp() public {}

    function testInitHash() public {
        // Get creation code
        bytes memory bytecode = type(UniswapV2Pair).creationCode;
        bytes32 init_hash = keccak256(bytecode);
        
        // Log values using assembly since we can't use forge-std in 0.5.16
        assembly {
            // Store the string "INIT_HASH: " at the next free memory location
            mstore(0x80, "INITCODE: ")
            
            // Log the string
            log0(0x80, 32)
            
            // Log the hash
            mstore(0x80, init_hash)
            log0(0x80, 32)
        }

        // Optional verification (uncomment if needed)
        /*
        address factory = ; 
        address token0 = ;
        address token1 = ;
        
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        address computedPair;
        assembly {
            let ptr := mload(0x40)
            mstore(ptr, 0xff)
            mstore(add(ptr, 0x01), factory)
            mstore(add(ptr, 0x15), salt)
            mstore(add(ptr, 0x35), init_hash)
            computedPair := and(keccak256(ptr, 85), 0xffffffffffffffffffffffffffffffffffffffff)
        }
        
        require(computedPair == 0x1Ae36818fF46841ed1DE7eF4a77906f807503816, "Init hash verification failed");
        */
    }
}
