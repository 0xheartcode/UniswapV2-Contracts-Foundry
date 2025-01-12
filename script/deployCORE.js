require('dotenv').config();
const { initializeDeployment } = require('./lib/baseDeployment');
const { deployContract } = require('./lib/deployment');
const { verifyContract } = require('./lib/verification');

async function deployFactory() {
    await initializeDeployment();

    const deployment = await deployContract({
        contractPath: 'src/UniswapV2Factory.sol:UniswapV2Factory',
        constructorArgs: `--constructor-args $(cast wallet address ${process.env.PRIVATE_KEY})`,
        description: 'Factory',
        envKey: 'UNISWAPV2_FACTORY_CA'
    });

    if (!deployment) return;

    if (process.env.FLAG_VERIFIER_ENABLED === 'true') {
        await verifyContract({
            address: deployment.address,
            contractPath: 'src/UniswapV2Factory.sol:UniswapV2Factory',
            network: deployment.network,
            constructorArgs: `--constructor-args $(cast abi-encode "constructor(address)" $(cast wallet address ${process.env.PRIVATE_KEY}))`
        });
    }
}

deployFactory().catch(console.error);
