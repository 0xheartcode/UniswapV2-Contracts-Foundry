# UniswapV2-Contracts-Foundry 🌊

*A Foundry implementation of the Uniswap V2 protocol with modern deployment infrastructure*

## Project Overview 📖

This project adapts the original Uniswap V2 protocol (written in Solidity 0.5.16/0.6.6) to work with modern development tools, particularly Foundry. Instead of reimplementing the core functionality, I've focused on creating a robust deployment infrastructure to bridge legacy code with current tooling.

My primary technical focus includes:

- Building a versatile deployment pipeline supporting multiple networks (private testnet, Holesky, Sepolia)
- Creating sophisticated environment validation to prevent deployment failures
- Developing a modular deployment system with chain-specific contract verification
- Implementing (manual) initCode hash generation for proper contract address calculation
- Automating dependency management between contracts during deployment

This project demonstrates how to effectively integrate older, battle-tested DeFi code with modern developer tooling.

## Deployment Architecture 🏗️

The deployment system uses a layered approach to ensure reliability and flexibility:

```
┌─────────────────────────────────────────────────────────────┐
│                     High-Level Scripts                       │
│  deployAll.js, deployCORE.js, deployWETH9.js, deployROUTER.js  │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                     Deployment Library                       │
│         deployment.js, verification.js, utils.js            │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                  Environment Management                      │
│          baseDeployment.js, envValidator.js                 │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Network Configuration                     │
│                       NetworkConfig.js                       │
└─────────────────────────────────────────────────────────────┘
```

The deployment system includes several key components:

- **High-Level Scripts**: Orchestrate the deployment process for each contract
- **Deployment Library**: Handles contract deployment, verification, and environment updates
- **Environment Management**: Validates configuration and prevents deployment errors
- **Network Configuration**: Provides network-specific settings and explorer integration

## Deployment Features ✨

- **Multi-Network Support**: Seamlessly deploy to private testnets, public testnets, or mainnet
- **Automatic Contract Verification**: Integrates with Etherscan and Blockscout APIs
- **Environment Validation**: Prevents deployment failures with comprehensive pre-checks
- **Chainable Deployments**: Properly connects contracts with dependencies (Factory → Router)
- **InitCode Hash Computation**: Automatically calculates and verifies pair contract creation codes
- **Unified Console Output**: Color-coded, structured logging for deployment monitoring
- **Environment Auto-Updates**: Dynamically updates .env file with deployed contract addresses
- **Clickable Explorer Links**: Terminal-friendly links to deployed contracts

## Prerequisites ⚔️

Before you embark on this journey, ensure you have:

- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- [Node.js](https://nodejs.org/en/) (for deployment scripts)

## Installation 🛠️

```bash
# Clone this repository
git clone https://github.com/YourUsername/UniswapV2Clone
cd UniswapV2Clone

# Install the dependencies
forge install
```

### Technical note: 
You need to modify the line 24 in the UniswapV2Library.sol for the smart contract to work properly.
`You must replace the hardcoded initCodeHash with the one corresponding to your deployment.`

```solidity
 17     // calculates the CREATE2 address for a pair without making any external calls
 18     function pairFor(address factory, address tokenA, address tokenB) internal pure returns (address pair) {
 19         (address token0, address token1) = sortTokens(tokenA, tokenB);
 20         pair = address(uint(keccak256(abi.encodePacked(
 21                 hex'ff',
 22                 factory,
 23                 keccak256(abi.encodePacked(token0, token1)),
 24                 hex'0x0' // init code hash
 25             ))));
 26     }
```

### Getting the InitCode Hash

Run the test file to calculate the proper initCode hash for your deployment:

```bash
forge test --match-path test/Basic.t.sol -vvv
```

This will output the correct hash to use in your UniswapV2Library.sol implementation.

## Environment Setup 🌍

The deployment system uses a sophisticated environment validation framework to prevent common deployment pitfalls:

```bash
# Create a .env file with required parameters
cp .env.example .env
```

Required environment variables:
```env
# Deployment essentials
PRIVATE_KEY=your_private_key_here
RPC_URL=your_rpc_url  # Detects network type automatically from URL

# Verification settings (optional)
FLAG_VERIFIER_ENABLED=true  # Enable contract verification
ETHERSCAN_API_KEY=your_api_key  # Required for public network verification

# Optional network-specific configurations
HOLESKY_EXPLORER_ROOT=https://holesky.etherscan.io/
HOLESKY_CHAIN_ID=17000
```

The system automatically:
1. Validates all required variables before deployment
2. Detects network type from RPC URL (private, Holesky, Sepolia)
3. Applies appropriate verification strategy based on explorer type
4. Updates .env with deployed contract addresses for dependency management

## Deployment Scripts 🚀

The repository includes specialized scripts for deploying each component:

### Full Deployment Sequence

```bash
# Install dependencies
npm install

# Deploy all components in the correct order
node script/deployAll.js
```

The `deployAll.js` script orchestrates the entire deployment process with proper sequencing and dependency management:

```javascript
// Simplified snippet from deployAll.js
async function deployAll() {
    // Step 1: Deploy WETH - The Foundation
    const wethSuccess = await executeDeployment(
        'deployWETH9.js', 
        'WETH Deployment'
    );
    
    // Step 2: Deploy Factory - The Core
    const factorySuccess = await executeDeployment(
        'deployCORE.js', 
        'Factory Deployment'
    );
    
    // Step 3: Deploy Router - The Gateway
    const routerSuccess = await executeDeployment(
        'deployROUTER.js', 
        'Router Deployment'
    );
}
```

### Individual Component Deployment

For greater control, you can deploy components individually:

```bash
# Deploy WETH token
node script/deployWETH9.js

# Deploy Factory contract
node script/deployCORE.js

# Deploy Router with automatic dependency resolution
node script/deployROUTER.js

# Deploy Multicall utility
node script/deployMulticall.js
```

Each script leverages the core deployment utilities while handling component-specific requirements.

### Environment Validation

The system includes robust error handling for deployment prerequisites:

```javascript
// From envValidator.js
validateAndExit() {
    console.log('\n=== ENVIRONMENT VALIDATION ===');
    
    try {
        const { isValid, missingVars, warnings, network } = this.validate();
        
        console.log(`🌐 Network detected: ${network}`);
        
        if (warnings.length > 0) {
            console.log('\n⚠️ Warnings:');
            warnings.forEach(warning => console.log(`- ${warning}`));
        }

        if (!isValid) {
            console.error('\n❌ Missing required environment variables:');
            missingVars.forEach(variable => console.log(`- ${variable}`));
            console.log('\nPlease check your .env file and try again.');
            process.exit(1);
        }

        return { network };
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}
```

## Contract Verification 🔍

The deployment system includes a versatile verification module supporting multiple explorers:

```javascript
// From verification.js
function getVerificationCommand(params) {
    const { 
        address, 
        contractPath, 
        network, 
        constructorArgs = '', 
        compilerVersion = '' 
    } = params;

    if (network.isBlockscout) {
        // Blockscout verification (private networks)
        return `forge verify-contract \
            ${compilerVersion ? `--compiler-version ${compilerVersion}` : ''} \
            --rpc-url ${process.env.RPC_URL} \
            ${address} \
            ${contractPath} \
            --verifier blockscout \
            --verifier-url ${network.explorerRoot}api/ \
            ${constructorArgs}`;
    }

    // Etherscan verification (public networks)
    return `forge verify-contract \
        ${address} \
        ${contractPath} \
        --chain-id ${network.chainId} \
        ${constructorArgs} \
        --etherscan-api-key ${process.env.ETHERSCAN_API_KEY}`;
}
```

This system automatically:
- Selects the appropriate verification API based on network
- Handles different parameter formats for various explorers
- Supports older Solidity versions with compiler specification
- Properly encodes constructor arguments for verification

## InitCode Hash Management ⚙️

A critical aspect of deploying Uniswap V2 is calculating the correct initCode hash for the UniswapV2Library:

```solidity
// UniswapV2Library.sol (requires modification)
function pairFor(address factory, address tokenA, address tokenB) internal pure returns (address pair) {
    (address token0, address token1) = sortTokens(tokenA, tokenB);
    pair = address(uint(keccak256(abi.encodePacked(
            hex'ff',
            factory,
            keccak256(abi.encodePacked(token0, token1)),
            hex'0x0' // init code hash - MUST BE REPLACED
        ))));
}
```

The repository includes a specialized test to calculate this hash:

```bash
# Generate the correct initCode hash for your deployment
forge test --match-path test/Basic.t.sol -vvv
```

This will output the creation bytecode hash needed for proper pair address calculation.

## Integration with Forge and Modern Tools 🛠️

Despite working with legacy Solidity code, this implementation takes full advantage of Foundry tools:

```bash
# Build the entire project
forge build

# Manually deploy contracts with forge
forge create src/UniswapV2Factory.sol:UniswapV2Factory \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --constructor-args $DEPLOYER_ADDRESS \
    --legacy
```

The `--legacy` flag ensures compatibility with older Solidity versions, while the deployment scripts handle many additional complexities automatically.

## Prerequisites ⚔️

Before you embark on this journey, ensure you have:

- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- [Node.js](https://nodejs.org/en/) (for deployment scripts)

## Installation 🛠️

```bash
# Clone this repository
git clone https://github.com/0xheartcode/UniswapV2-Contracts-Foundry
cd UniswapV2-Contracts-Foundry

# Install the dependencies
forge install
npm install
```

## Testing 🧪

The repository includes tests for contract functionality and deployment utilities:

```bash
# Run the initCode hash calculator
forge test --match-path test/Basic.t.sol -vvv

# Run all contract tests
forge test
```

## Development Journey 🛣️

Building this deployment infrastructure for Uniswap V2 presented several unique challenges:

1. **Solidity Version Compatibility**: Creating a modern deployment system for contracts written in Solidity 0.5.16/0.6.6 required careful handling of compiler options and flags.

2. **Cross-Explorer Verification**: Developing a unified verification system that works across Etherscan and Blockscout explorers eliminated repetitive manual verification.

3. **InitCode Hash Calculation**: Automating the creation and verification of the critical bytecode hash ensures proper pair contract addressing.

4. **Dependency Management**: Building a deployment sequence that automatically captures contract dependencies reduced deployment errors and simplified the process.

The most significant technical achievement was creating a robust deployment system that bridges the gap between legacy DeFi protocols and modern development tools. 

## Acknowledgements and Sources 🙏

- [Uniswap V2 Core](https://github.com/Uniswap/v2-core/tree/ee547b17853e71ed4e0101ccfd52e70d5acded58)
- [Uniswap V2 Periphery](https://github.com/Uniswap/v2-periphery/tree/0335e8f7e1bd1e8d8329fd300aea2ef2f36dd19f)
- [Canonical WETH](https://github.com/gnosis/canonical-weth/tree/0dd1ea3e295eef916d0c6223ec63141137d22d67)
- [Foundry](https://book.getfoundry.sh/)

