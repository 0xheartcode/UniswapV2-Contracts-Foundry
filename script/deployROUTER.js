require('dotenv').config();
const { initializeDeployment } = require('./lib/baseDeployment');
const { deployContract } = require('./lib/deployment');
const { verifyContract } = require('./lib/verification');

async function deployRouter() {
    await initializeDeployment();

    if (!process.env.UNISWAPV2_FACTORY_CA || !process.env.WETH_CA) {
        console.error('❌ Factory or WETH address not found! Have you deployed the prerequisites?');
        return;
    }

    const deployment = await deployContract({
        contractPath: 'src/periphery/UniswapV2Router02.sol:UniswapV2Router02',
        constructorArgs: `--constructor-args ${process.env.UNISWAPV2_FACTORY_CA} ${process.env.WETH_CA}`,
        description: 'Router',
        envKey: 'UNISWAPV2_ROUTER_CA'
    });

    if (!deployment) return;

    if (process.env.FLAG_VERIFIER_ENABLED === 'true') {
        await verifyContract({
            address: deployment.address,
            contractPath: 'src/periphery/UniswapV2Router02.sol:UniswapV2Router02',
            network: deployment.network,
            constructorArgs: `--constructor-args $(cast abi-encode "constructor(address,address)" ${process.env.UNISWAPV2_FACTORY_CA} ${process.env.WETH_CA})`
        });
    }
}

deployRouter().catch(console.error);
