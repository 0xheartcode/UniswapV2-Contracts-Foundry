// script/deployAll.js
const { spawn } = require('child_process');
const { setTimeout } = require('timers/promises');
require('dotenv').config();
const { initializeDeployment } = require('./lib/baseDeployment');

// ANSI color codes for our sacred ceremony
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

function executeDeployment(scriptName, description) {
    return new Promise((resolve, reject) => {
        console.log(`\n${YELLOW}=== INITIATING ${description.toUpperCase()} ===${RESET}`);
        
        const child = spawn('node', [`script/${scriptName}`], {
            stdio: 'inherit'
        });

        child.on('close', (code) => {
            if (code === 0) {
                console.log(`${GREEN}✅ ${description} completed successfully!${RESET}`);
                resolve(true);
            } else {
                console.error(`${RED}❌ ${description} failed with code ${code}${RESET}`);
                resolve(false);
            }
        });

        child.on('error', (error) => {
            console.error(`${RED}❌ ${description} failed:${RESET}`, error.toString());
            reject(error);
        });
    });
}

async function deployAll() {
    await initializeDeployment();


    console.log(`\n${YELLOW}🌟 BEGINNING THE GRAND DEPLOYMENT CEREMONY 🌟${RESET}`);
    console.log('\nPrepare yourself, for we shall forge the three pillars of your DEX!');

    try {
        // Step 1: Deploy WETH - The Foundation
        console.log(`\n${BLUE}📜 CHAPTER 1: THE FOUNDATION - WETH DEPLOYMENT${RESET}`);
        const wethSuccess = await executeDeployment('deployWETH9.js', 'WETH Deployment');
        if (!wethSuccess) {
            throw new Error('WETH deployment failed. We cannot proceed without our foundation!');
        }
        
        // Pause for environment variables to settle
        await setTimeout(2000);

        // Step 2: Deploy Factory - The Core
        console.log(`\n${BLUE}📜 CHAPTER 2: THE CORE - FACTORY DEPLOYMENT${RESET}`);
        const factorySuccess = await executeDeployment('deployCORE.js', 'Factory Deployment');
        if (!factorySuccess) {
            throw new Error('Factory deployment failed. We cannot proceed without our core!');
        }
        
        await setTimeout(2000);

        // Step 3: Deploy Router - The Gateway
        console.log(`\n${BLUE}📜 CHAPTER 3: THE GATEWAY - ROUTER DEPLOYMENT${RESET}`);
        const routerSuccess = await executeDeployment('deployROUTER.js', 'Router Deployment');
        if (!routerSuccess) {
            throw new Error('Router deployment failed at the final step!');
        }

        // Grand finale
        console.log(`\n${GREEN}=== THE GRAND DEPLOYMENT CEREMONY IS COMPLETE! ===${RESET}`);
        console.log(`\n${YELLOW}Your DEX now stands ready, built upon:${RESET}`);
        console.log(`${GREEN}✓${RESET} WETH: The foundation of wrapped ether`);
        console.log(`${GREEN}✓${RESET} Factory: The core of pair creation`);
        console.log(`${GREEN}✓${RESET} Router: The gateway to liquidity`);
        console.log('\nMay your liquidity pools be deep and your trades be swift! 🚀');

    } catch (error) {
        console.log(`\n${RED}=== THE DEPLOYMENT CEREMONY WAS INTERRUPTED ===${RESET}`);
        console.error(`${RED}Error:${RESET}`, error.message);
        console.log('\nReview the errors above and try again, young developer!');
        process.exit(1);
    }
}

// Environment validation before the ceremony begins
console.log(`\n${YELLOW}Preparing for deployment sequence...${RESET}`);
console.log('Checking environment variables...');

if (!process.env.RPC_URL || !process.env.PRIVATE_KEY) {
    console.error(`${RED}❌ Critical environment variables missing!${RESET}`);
    console.log('Please ensure your .env file contains:');
    console.log('- RPC_URL');
    console.log('- PRIVATE_KEY');
    if (process.env.FLAG_VERIFIER_ENABLED === 'true') {
        console.log('- ETHERSCAN_API_KEY (required for verification)');
    }
    process.exit(1);
}

deployAll().catch(console.error);
