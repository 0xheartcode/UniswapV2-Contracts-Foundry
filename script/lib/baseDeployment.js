// script/lib/baseDeployment.js
const EnvValidator = require('./envValidator');

function initializeDeployment() {
    // Skip validation if it's already been done
    if (process.env.DEPLOYMENT_VALIDATED === 'true') {
        return { network: process.env.DEPLOYMENT_NETWORK };
    }

    const validator = new EnvValidator();
    const result = validator.validateAndExit();
    
    // Set flags to prevent re-validation
    process.env.DEPLOYMENT_VALIDATED = 'true';
    process.env.DEPLOYMENT_NETWORK = result.network;
    
    return result;
}

module.exports = { initializeDeployment };
