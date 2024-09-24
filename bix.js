const fs = require('fs');
const axios = require('axios');
const path = require('path');
const chalk = require('chalk');
const colors = require('colors');
const { v4: uuidv4 } = require('uuid');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class Moonbix {
    constructor() {
        this.headers = {
            'authority': 'www.binance.com',
            'accept': '*/*',
            'accept-encoding': 'gzip, deflate, br, zstd',
            'accept-language': 'en-US,en;q=0.9,vi;q=0.8',
            'clienttype': 'web',
            'content-type': 'application/json',
            'csrftoken': 'd41d8cd98f00b204e9800998ecf8427e',
            'device-info': 'eyJzY3JlZW5fcmVzb2x1dGlvbiI6IjE5MjAsMTA4MCIsImF2YWlsYWJsZV9zY3JlZW5fcmVzb2x1dGlvbiI6IjE5MjAsMTA0MCIsInN5c3RlbV92ZXJzaW9uIjoiV2luZG93cyAxMCIsImJyYW5kX21vZGVsIjoidW5rbm93biIsInN5c3RlbV9sYW5nIjoiZW4tVVMiLCJ0aW1lem9uZSI6IkdNVCswNzowMCIsInRpbWV6b25lT2Zmc2V0IjotNDIwLCJ1c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEyOC4wLjAuMCBTYWZhcmkvNTM3LjM2IiwibGlzdF9wbHVnaW4iOiJQREYgVmlld2VyLENocm9tZSBQREYgVmlld2VyLENocm9taXVtIFBERiBWaWV3ZXIsTWljcm9zb2Z0IEVkZ2UgUERGIFZpZXdlcixXZWJLaXQgYnVpbHQtaW4gUERGIiwiY2FudmFzX2NvZGUiOiJhYmZmMmJiMSIsIndlYmdsX3ZlbmRvciI6Ikdvb2dsZSBJbmMuIChOVklESUEpIiwid2ViZ2xfcmVuZGVyZXIiOiJBTkdMRSAoTlZJRElBLCBOVklESUEgR2VGb3JjZSBHVFggMTY1MCAoMHgwMDAwMjE4OCkgRGlyZWN0M0QxMSB2c181XzAgcHNfNV8wLCBEM0QxMSkiLCJhdWRpbyI6IjEyNC4wNDM0NzUyNzUxNjA3NCIsInBsYXRmb3JtIjoiV2luMzIiLCJ3ZWJfdGltZXpvbmUiOiJBc2lhL1NhaWdvbiIsImRldmljZV9uYW1lIjoiQ2hyb21lIFYxMjguMC4wLjAgKFdpbmRvd3MpIiwiZmluZ2VycHJpbnQiOiI0NDI5YjU0MGJlMTVhOWE2NThkMzZlOWUzZjA1ZWVkMSIsImRldmljZV9pZCI6IiIsInJlbGF0ZWRfZGV2aWNlX2lkcyI6IiJ9',
            'lang': 'en',
            'origin': 'https://www.binance.com',
            'referer': 'https://www.binance.com/en/game/tg/moon-bix',
            'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'priority': "u=1, i",
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
            'x-passthrough-token': '',
        };
    }

    log(msg, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const colorMap = {
            'success': chalk.green,
            'error': chalk.red,
            'warning': chalk.yellow,
            'info': chalk.blue,
            'custom': chalk.magenta
        };
        const icons = {
            'success': '✔️ ',
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️',
            'custom': '🔔'
        };
        const color = colorMap[type] || chalk.blue;
        const icon = icons[type] || 'ℹ️';
        console.log(color(`[${timestamp}] ${icon} ${msg}`));
    }

    async countdown(t) {
        const timestamp = new Date().toLocaleTimeString();

        for (let i = t; i > 0; i--) {
            const hours = String(Math.floor(i / 3600)).padStart(2, '0');
            const minutes = String(Math.floor((i % 3600) / 60)).padStart(2, '0');
            const seconds = String(i % 60).padStart(2, '0');
            process.stdout.write(colors.magenta(`[${timestamp}] ⏳ Waiting ${hours}:${minutes}:${seconds}     \r`));
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        process.stdout.write('                                        \r');
    }

    extractUserData(queryId) {
        const urlParams = new URLSearchParams(queryId);
        const user = JSON.parse(decodeURIComponent(urlParams.get('user')));
        return {
            extUserId: user.id,
            extUserName: user.username
        };
    }

    async postRequest(url, data) {
        try {
            const response = await axios.post(url, data, { headers: this.headers });
            if (response.data.success) {
                return response.data.data;
            } else {
                // this.log(`API error: ${response.data.message}`, 'error');
                return null;
            }
        } catch (error) {
            this.log(`Request error: ${error.message}`, 'error');
            return null;
        }
    }

    async getResource(authorization) {
        const url = "https://www.binance.com/bapi/growth/v1/public/growth-paas/resource/single";
        const headers = { ...this.headers, "Device-Info": authorization };
        return await this.postRequest(url, {
            "code": "moon-bix",
            "type": "MINI_APP_ACTIVITY"
        }, headers);
    }

    async getUserInfo() {
        const url = "https://www.binance.com/bapi/growth/v1/friendly/growth-paas/mini-app-activity/third-party/user/user-info";
        const response = await this.postRequest(url, { resourceId: 2056 });
        if (!response) { this.log(`Failed to get user info`, 'error'); return false; }
        this.user_info = response;
        return true;
    }

    async login(queryString) {
        const url = "https://www.binance.com/bapi/growth/v1/friendly/growth-paas/third-party/access/accessToken";

        const response = await this.postRequest(url, {
            "queryString": queryString,
            "socialType": "telegram"
        });

        if (!response) { this.log(`Failed to login`, 'error'); return false }

        this.headers["x-growth-token"] = response.accessToken;
        return true
    }

    async getTasksList() {
        const url = "https://www.binance.com/bapi/growth/v1/friendly/growth-paas/mini-app-activity/third-party/task/list";

        const response = await this.postRequest(url, { resourceId: 2056 });
        if (!response) {
            this.log(`Failed to get tasks list`, 'error');
            return;
        }
        return response;
    }

    async completeTask(task) {
        const url = "https://www.binance.com/bapi/growth/v1/friendly/growth-paas/mini-app-activity/third-party/task/complete";

        return await this.postRequest(url, {
            referralCode: null,
            resourceIdList: [task.resourceId]
        });
    }

    async playGame() {
        const url = "https://www.binance.com/bapi/growth/v1/friendly/growth-paas/mini-app-activity/third-party/game/start"

        try {
            const response = await axios.post(url, { resourceId: 2056 }, { headers: this.headers });
            if (response.data.success) {
                this.game_response = response.data;
                return true;
            }
            this.log(`Faild to start game`, 'error');
        } catch (error) {
            this.log(`Faild to start game : ${error.message}`, 'error');
        }
        await sleep(5000);
        return false;
    }

    async gameData() {
        const url = "https://vemid42929.pythonanywhere.com/api/v1/moonbix/play";
        try {
            const response = await axios({
                'method': 'GET',
                url,
                data: url, 
                data: this.game_response
            });
            if (response.data.message === 'success') {
                this.game = response.data.game;
                this.log(`Load game data success !!!`, 'success');
                return true
            }
            this.log(`Faild to load game data !`, 'error');   
        } catch(error) {
            this.log(`Faild to load game data !`, 'error');   
        }
        await sleep(5000);
        return false;
    }

    async completeGame() {
        try {
            const url = "https://www.binance.com/bapi/growth/v1/friendly/growth-paas/mini-app-activity/third-party/game/complete";
            const response = await axios.post(url, {
                resourceId: 2056,
                payload: this.game.payload,
                log: this.game.log
            }, { headers: this.headers });
            if (response.data.success) {
                this.log(`Complete game you earn: ${this.game.log}`, 'success');
                return true;
            }
            this.log(`Faild to earn !`, 'error');
        } catch (error) {
            this.log(`Request complete game with error: ${error.message}`, 'error');
        }
        await sleep(5000);
        return false;
    }


    async handleTasks() {
        this.log(`Fetching tasks list ...`, 'info');
        const tasksData = await this.getTasksList();
        const tasks = tasksData.data[0].taskList.data;
        if (!tasks || !tasks.length) {
            this.log(`No tasks available`, 'info');
            return;
        }
        this.log(`Found ${tasks.length} tasks`, 'info');
        for (const task of tasks) {
            if (task.status !== 'COMPLETED') {
                this.log(`Completing task ${task.code}`, 'info');
                try {
                    await this.completeTask(task);
                    this.log(`Successfully completed task ${task.code}`, 'success');
                    await sleep(5000); // Sleep 5 seconds before handling the next task
                } catch (error) {
                    this.log(`Failed to complete task ${task.code}: ${error.message}`, 'error');
                }
            } else {
                this.log(`Task ${task.code} is already completed`, 'custom');
            }
        }
    }

    async processing(queryID, index) {
        const xtradeId = uuidv4();
        this.headers["bnc-location"] = uuidv4();
        this.headers["x-trace-id"] = xtradeId;
        this.headers["x-ui-request-trace"] = xtradeId;
        const user = JSON.parse(decodeURIComponent(queryID.split('user=')[1].split('&')[0]));
        const firstName = user.first_name;
        console.log(`========== Account ${index} | ${firstName.magenta} ==========`);

        this.log(`Login account `, 'info');
        const login = await this.login(queryID);
        if (!login) return;

        this.log(`Fetching info `, 'info');
        const infor = await this.getUserInfo();
        if (!infor) return
        this.log(`POINT: ${this.user_info.metaInfo.totalGrade  + this.user_info.metaInfo.referralTotalGrade?? `N/A`}`, 'info');

        await this.handleTasks();

        const totalAttempts = this.user_info.metaInfo.totalAttempts;
        const consumedAttempts = this.user_info.metaInfo.consumedAttempts;
        const remainingAttempts = totalAttempts - consumedAttempts;
        if (remainingAttempts > 0) {
            for (let i = 0; i < remainingAttempts; i++) {
                try {
                    this.log(`Play the game for time ${i + 1} `, 'info');
                    const play = await this.playGame();
                    if (!play) continue;

                    await sleep(30000);

                    this.log(`Load data game for time ${ i + 1}`, 'info');
                    const dataGame = await this.gameData();
                    if (!dataGame) continue;
                    
                    const completeGame = await this.completeGame();
                    if (!completeGame) continue;
                } catch (error) {
                    this.log(`${error.message}`, 'error');
                }
                await sleep(15000);
            }
        }
        this.log(`Tickets have been used up!`, 'success');
    }

    async main() {
        
        const dataFile = path.join(__dirname, 'data.txt');

        if (!fs.existsSync(dataFile)) {
            this.log('File data.txt does not exists! Please provider ...', 'error');
            return;
        };

        const data = fs.readFileSync(dataFile, 'utf8')
            .replace(/\r/g, '')
            .split('\n')
            .filter(Boolean);

        while (true) {
            this.log('Starting to process accounts...', 'info');

            for (let i = 0; i < data.length; i++) {
                await this.processing(data[i], i+1)
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            this.log('Processed all accounts', 'success');
            await this.countdown(30 * 60);
        }
    }
}

const client = new Moonbix();
client.main().catch(err => {
    client.log(err.message, 'error');
    process.exit(1);
});