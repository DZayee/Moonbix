const { countdown } = require('./helpers/helpers');
const logger = require('./helpers/logger');
const Binance = require('./services/Binance');
const client = new Binance();
const path = require('path');
const fs = require('fs');

const main = async () => {
    const dataFile = path.join(__dirname, 'data.txt');
    const proxyFile = path.join(__dirname, 'proxy.txt');
    if (!fs.existsSync(dataFile)) {
        logger.error('File data.txt does not exists! Please provider ...');
        return;
    };
    const data = fs.readFileSync(dataFile, 'utf8')
        .replace(/\r/g, '')
        .split('\n')
        .filter(Boolean);

    let proxies = [];
    
    if (fs.existsSync(proxyFile)) {
        proxies = fs.readFileSync(proxyFile, 'utf8')
            .replace(/\r/g, '')
            .split('\n')
            .filter(Boolean);
        if (data.length !== proxies.length) {
            logger.error('Number of accounts does not match number of proxies!');
            return;
        }
    }

    while (true) {
        logger.info('Starting to process accounts...');
        await data.reduce(async (promise, item, index) => {
            await promise;
            await client.processing(item, index + 1, proxies[index] || null);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }, Promise.resolve());

        // await client.gameData();

        logger.info('All accounts are complete !!!'.green);
        await countdown(12 * 60);
    }
}

main().catch(err => {
    logger.log(err.message, 'error');
    process.exit(1);
});
