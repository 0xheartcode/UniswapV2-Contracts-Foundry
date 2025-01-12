// script/lib/envValidator.js

/**
 * Validates environment variables based on deployment configuration
 */
class EnvValidator {
    constructor() {
        // Basic requirements for all deployments
        this.baseRequirements = {
            RPC_URL: 'RPC endpoint for deployment',
            PRIVATE_KEY: 'Private key for deployment wallet'
        };

        // Additional requirements when verification is enabled
        this.verificationRequirements = {
            'private': {
                PRIVATE_TESTNET_EXPLORER_ROOT: 'Explorer root URL for Private Testnet',
                PRIVATE_CHAIN_ID: 'Chain ID for Private Testnet'
            },
            'public': {
                PUBLIC_TESTNET_EXPLORER_ROOT: 'Explorer root URL for Public Testnet',
                PUBLIC_CHAIN_ID: 'Chain ID for Public Testnet'
            },
            'holesky': {
                ETHERSCAN_API_KEY: 'Etherscan API key for verification',
                HOLESKY_EXPLORER_ROOT: 'Explorer root URL for Holesky',
                HOLESKY_CHAIN_ID: 'Chain ID for Holesky'
            },
            'sepolia': {
                ETHERSCAN_API_KEY: 'Etherscan API key for verification',
                SEPOLIA_EXPLORER_ROOT: 'Explorer root URL for Sepolia',
                SEPOLIA_CHAIN_ID: 'Chain ID for Sepolia'
            }
        };
    }

    /**
     * Determines the network from RPC_URL
     * @returns {string} Network identifier
     * @throws {Error} If network cannot be determined
     */
    determineNetwork() {
        const rpcUrl = process.env.RPC_URL?.toLowerCase();
        if (!rpcUrl) {
            throw new Error('RPC_URL is not set in environment!');
        }

        if (rpcUrl.includes('localhost')) return 'localhost';
        if (rpcUrl.includes('private-testnet')) return 'private';
        if (rpcUrl.includes('public-testnet')) return 'public';
        if (rpcUrl.includes('holesky')) return 'holesky';
        if (rpcUrl.includes('sepolia')) return 'sepolia';
        
        throw new Error(
            '\n❌ Invalid or unsupported RPC_URL!' +
            '\n\nSupported networks in RPC_URL:' +
            '\n- Private Testnet (contains "private-testnet")' +
            '\n- Public Testnet (contains "public-testnet")' +
            '\n- Holesky Testnet (contains "holesky")' +
            '\n- Sepolia Testnet (contains "sepolia")' +
            '\n- Localhost (contains "localhost")' +
            '\n\nPlease update your .env file with a supported RPC_URL'
        );
    }

    /**
     * Validates environment variables
     * @returns {Object} Validation result
     */
    validate() {
        const missingVars = [];
        const warnings = [];
        
        // Check base requirements first
        Object.entries(this.baseRequirements).forEach(([key, description]) => {
            if (!process.env[key]) {
                missingVars.push(`${key}: ${description}`);
            }
        });

        // Early exit if base requirements aren't met
        if (missingVars.length > 0) {
            return { isValid: false, missingVars, warnings, network: null };
        }

        // Validate RPC_URL format
        if (process.env.RPC_URL.endsWith('/')) {
            missingVars.push('RPC_URL should not end with a slash');
        }

        // Now determine network - this will throw if network is invalid
        const network = this.determineNetwork();

        // Check verification-specific requirements if enabled
        if (process.env.FLAG_VERIFIER_ENABLED === 'true') {
            if (this.verificationRequirements[network]) {
                Object.entries(this.verificationRequirements[network]).forEach(([key, description]) => {
                    if (!process.env[key]) {
                        missingVars.push(`${key}: ${description}`);
                    } else {
                        // Add format validations
                        if (key.includes('EXPLORER_ROOT') && !process.env[key].endsWith('/')) {
                            missingVars.push(`${key} should end with a slash`);
                        }
                        if (key.includes('CHAIN_ID')) {
                                if (!/^\d+$/.test(process.env[key])) {
                                    missingVars.push(`${key} must be a number without any other characters`);
                                }
                        }
                    }
                });
            }
        }

        return {
            isValid: missingVars.length === 0,
            missingVars,
            warnings,
            network
        };
    }

    /**
     * Prints validation results and exits if there are errors
     * @returns {Object} Network information if validation succeeds
     */
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

            if (warnings.length === 0) {
                console.log('✅ Environment validation successful!');
            }

            return { network };
            
        } catch (error) {
            console.error(error.message);
            process.exit(1);
        }
    }

    /**
     * Utility method to list all supported networks and their requirements
     */
    static listNetworkRequirements() {
        const validator = new EnvValidator();
        console.log('\n=== Supported Networks and Requirements ===');
        
        Object.entries(validator.verificationRequirements).forEach(([network, requirements]) => {
            console.log(`\n${network}:`);
            Object.entries(requirements).forEach(([key, description]) => {
                console.log(`  ${key}: ${description}`);
            });
        });
    }
}

module.exports = EnvValidator;
