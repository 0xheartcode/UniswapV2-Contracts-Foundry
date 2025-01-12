require('dotenv').config();
const { initializeDeployment } = require('./lib/baseDeployment');
const { deployContract } = require('./lib/deployment');
const { verifyContract } = require('./lib/verification');

async function deployWETH() {
    await initializeDeployment();

    const deployment = await deployContract({
        contractPath: 'src/canonical-weth/WETH9.sol:WETH9',
        description: 'WETH',
        envKey: 'WETH_CA'
    });

    if (!deployment) return;

    if (process.env.FLAG_VERIFIER_ENABLED === 'true') {
        await verifyContract({
            address: deployment.address,
            contractPath: 'src/canonical-weth/WETH9.sol:WETH9',
            network: deployment.network,
            compilerVersion: '0.5.17'
        });
    }
}

// THIS LINE IS CRUCIAL!
deployWETH().catch(console.error);
