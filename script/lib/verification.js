const { execSync } = require('child_process');

function getVerificationCommand(params) {
    const { 
        address, 
        contractPath, 
        network, 
        constructorArgs = '', 
        compilerVersion = '' 
    } = params;

    if (network.isBlockscout) {
        if (!network.explorerRoot) {
            throw new Error('Explorer root URL is not defined for the network');
        }
        return `forge verify-contract \
            ${compilerVersion ? `--compiler-version ${compilerVersion}` : ''} \
            --rpc-url ${process.env.RPC_URL} \
            ${address} \
            ${contractPath} \
            --verifier blockscout \
            --verifier-url ${network.explorerRoot}api/ \
            ${constructorArgs}`;
    }

    return `forge verify-contract \
        ${address} \
        ${contractPath} \
        --chain-id ${network.chainId} \
        ${constructorArgs} \
        --etherscan-api-key ${process.env.ETHERSCAN_API_KEY}`;
}

async function verifyContract(params) {
    console.log('\n🔍 Starting contract verification...');
    try {
        const command = getVerificationCommand(params);
        execSync(command, { stdio: 'inherit' });
        console.log('✅ Contract verification successful!');
    } catch (error) {
        console.error('❌ Contract verification failed:', error.message);
        console.log('You can try verifying manually later.');
    }
}

module.exports = { verifyContract };
