// lib/NetworkConfig.js
class NetworkConfig {
    constructor() {
        // Network configurations
        this.networks = {
            'localhost': {
                name: 'localhost',
                rpcUrl: process.env.LOCALHOST_RPC_URL,
                explorerRoot: process.env.LOCALHOST_EXPLORER_ROOT,
                chainId: process.env.LOCALHOST_TESTNET_CHAIN_ID || '1',
                isBlockscout: true
            },
            'private': {
                name: 'Private Testnet',
                rpcUrl: process.env.PRIVATE_TESTNET_RPC_URL,
                explorerRoot: process.env.PRIVATE_TESTNET_EXPLORER_ROOT,
                chainId: process.env.PRIVATE_TESTNET_CHAIN_ID || '401',
                isBlockscout: true
            },
            'public': {
                name: 'Public Testnet',
                rpcUrl: process.env.PUBLIC_TESTNET_RPC_URL,
                explorerRoot: process.env.PUBLIC_TESTNET_EXPLORER_ROOT,
                chainId: process.env.PUBLIC_TESTNET_CHAIN_ID || '401',
                isBlockscout: true
            },
            'holesky': {
                name: 'Holesky Testnet',
                rpcUrl: process.env.HOLESKY_RPC_URL,
                explorerRoot: process.env.HOLESKY_EXPLORER_ROOT,
                chainId: process.env.HOLESKY_CHAIN_ID || '17000',
                isBlockscout: false
            },
            'sepolia': {
                name: 'Sepolia Testnet',
                rpcUrl: process.env.SEPOLIA_RPC_URL,
                explorerRoot: process.env.SEPOLIA_EXPLORER_ROOT,
                chainId: process.env.SEPOLIA_CHAIN_ID || '11155111',
                isBlockscout: false
            }
        };

        // Detect network from RPC_URL
        const network = this.detectNetwork();
        Object.assign(this, network);
    }

    detectNetwork() {
        if (!process.env.RPC_URL) {
            throw new Error('RPC_URL is not set in environment!');
        }

        const rpcUrl = process.env.RPC_URL.toLowerCase();

        if (rpcUrl.includes('localhost')) {
            console.log('🌐 Network detected: LOCALHOST');
            return this.networks['localhost'];
        }
        if (rpcUrl.includes('private-testnet')) {
            console.log('🌐 Network detected: Private Testnet');
            return this.networks['private'];
        }
        if (rpcUrl.includes('public-testnet')) {
            console.log('🌐 Network detected: Public Testnet');
            return this.networks['public'];
        }
        if (rpcUrl.includes('holesky')) {
            console.log('🌐 Network detected: Holesky');
            return this.networks['holesky'];
        }
        if (rpcUrl.includes('sepolia')) {
            console.log('🌐 Network detected: Sepolia');
            return this.networks['sepolia'];
        }

        console.warn('⚠️ Unknown network - defaulting to Private Testnet');
        return this.networks['private'];
    }

    // Utility method to list available networks
    static listNetworks() {
        console.log('\n=== Available Networks ===');
        Object.entries(new NetworkConfig().networks).forEach(([key, network]) => {
            console.log(`\n${network.name}:`);
            console.log(`  Key: ${key}`);
            console.log(`  Chain ID: ${network.chainId}`);
            console.log(`  Explorer: ${network.explorerRoot}`);
        });
    }
}


module.exports = NetworkConfig;
