const { execSync } = require('child_process');
const NetworkConfig = require('./NetworkConfig');
const { createClickableLink, updateEnvFile } = require('./utils');
const { verifyContract } = require('./verification');

async function deployContract(params) {
    const {
        contractPath,
        constructorArgs = '',
        envKey = null,
        description = 'Contract'
    } = params;

    console.log(`\n=== INITIATING ${description.toUpperCase()} DEPLOYMENT ===`);
    
    if (!process.env.PRIVATE_KEY || !process.env.RPC_URL) {
        console.error('❌ Required environment variables missing!');
        return null;
    }

    const network = new NetworkConfig();
    
    console.log(`\n🔨 Preparing ${description} deployment...`);
    
    const deployCommand = `forge create ${contractPath} \
        --broadcast \
        --rpc-url ${process.env.RPC_URL} \
        --private-key ${process.env.PRIVATE_KEY} \
        ${constructorArgs} \
        --legacy`;

    try {
        console.log('Executing command:', deployCommand);
        console.log('\n✅ Deploying... ');
        const result = execSync(deployCommand).toString();

        console.log('\n✅ Deployment Successful!');
        
        const address = result.match(/Deployed to: (0x[a-fA-F0-9]{40})/)?.[1];
        const txHash = result.match(/Transaction hash: (0x[a-fA-F0-9]{64})/)?.[1];

        if (!address || !txHash) {
            throw new Error('Failed to extract deployment details');
        }

        console.log('\n=== DEPLOYMENT DETAILS ===');
        console.log(`Contract Address: ${createClickableLink(address, `${network.explorerRoot}address/${address}`)}`);
        console.log(`Transaction: ${createClickableLink(txHash, `${network.explorerRoot}tx/${txHash}`)}`);

        if (envKey) {
            await updateEnvFile(envKey, address);
        }

        return { address, txHash, network };
    } catch (error) {
        console.error(`❌ ${description} deployment failed:`, error.stderr ? error.stderr.toString() : error);
        return null;
    }
}

module.exports = { deployContract };
