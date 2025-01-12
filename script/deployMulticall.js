require('dotenv').config();
const {initializeDeployment} = require('./lib/baseDeployment');
const {deployContract} = require('./lib/deployment');
const {verifyContract} = require('./lib/verification');

async function deployMulticall() {
    await initializeDeployment();

    const deployment = await deployContract({
        contractPath: 'src/Multicall.sol:Multicall',
        description: 'Multicall',
        envKey: 'MUTICALL_CA'
    });

    if (!deployment) return;

    if (process.env.FLAG_VERIFIER_ENABLED === 'true') {
        await verifyContract({
            address: deployment.address,
            contractPath: 'src/Multicall.sol:Multicall',
            network: deployment.network,
            compilerVersion: '0.5.17'
        });
    }
}

// THIS LINE IS CRUCIAL!
deployMulticall().catch(console.error);
