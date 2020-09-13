$(async function() {
    prepare_data();
    prepare_page();
    addMenu();
    update_trades();
    main();
    flash_list_coins()
    setInterval(function () {   document.getElementById('Refresh').click();
                                document.getElementById('list_Refresh').click();}, 50000); 
});


function update_trades() {
    
    for (coin of window.coins) {
        if (!balances[coin]) {
            balances[coin] = 0; 
        }
    }

    for (trade of window.trades) {
        for (key of Object.keys(trade)) {
            balances[key] += trade[key]; 
        }
    }
}

function prepare_page() {
    document.getElementById("body").innerHTML = 
    `
    <div id="menu">
    </div>
    <div class="block" id="portfolio_table">
        <h2>Portfolio</h2>
        <table id="portfolio"></table>
        <div id="total-value"></div>
        <button id="Refresh">Refresh</button>
    </div>
    <div class="block" id="list_table">
        <table id="list"></table>
        <button id="list_Refresh">Refresh</button><br><br>
    </div>
    <div>
        <button id="Ren">Ren</button><button id="sushi">sushi</button><br><br>
    </div>
    <textarea id="textarea" cols="50" rows="5">
        </textarea>` + document.getElementById("body").innerHTML;
        

    document.getElementById("Refresh").onclick = async function () {
        let button = document.getElementById("Refresh");
        button.setAttribute("disabled", "disabled");
        main();
        button.removeAttribute("disabled");
    }

    document.getElementById("sushi").onclick = async function () {
        let button = document.getElementById("sushi");
        button.setAttribute("disabled", "disabled");
        const App = await init_ethers();    
        let sushi_susd_poll_add = "0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd"
        let LP_token_add = "0xf80758ab42c3b07da84053fd88804bcb6baa4b5c"
        const sushi_susd_poll_contract = new ethers.Contract(LP_token_add, ERC20_ABI, App.provider);
        let total_lp = await sushi_susd_poll_contract.balanceOf(sushi_susd_poll_add) / 1e18;
        let sushi_contract = new ethers.Contract(sushi_susd_poll_add, sushi_abi, App.provider);
        let my_lp = 2015;
        let pendingsushi = await sushi_contract.pendingSushi(3, "0x102e99D7aD45ED83484Dc986CD1c78648BD79850") / 1e18;
        pendingsushi += await sushi_contract.pendingSushi(13, "0x102e99D7aD45ED83484Dc986CD1c78648BD79850") / 1e18;
        document.getElementById("textarea").value = 
    `Total LP: ${total_lp.toFixed(2)},  My: ${my_lp},  Percent: ${(my_lp / total_lp.toFixed(2))}
    PendingSushi: ${pendingsushi.toFixed(2)}
    `;
        button.removeAttribute("disabled");
    }

    document.getElementById("Ren").onclick = async function () {
        let button = document.getElementById("Ren");
        button.setAttribute("disabled", "disabled");
        const App = await init_ethers();
        const RENBTC_CONTRACT = new ethers.Contract(RENBTC_TOKEN_ADDR, ERC20_ABI, App.provider);
        let renBtc = await RENBTC_CONTRACT.totalSupply() / 1e8;
        const WBTC_CONTRACT = new ethers.Contract(WBTC_TOKEN_ADDR, ERC20_ABI, App.provider);
        let wBtc = await WBTC_CONTRACT.totalSupply() / 1e8;
        document.getElementById("textarea").value = `${renBtc.toFixed(2)}\n${wBtc.toFixed(2)}\n${renBtc / wBtc}`;
        button.removeAttribute("disabled");
    }

    document.getElementById("list_Refresh").onclick = async function () {
        let button = document.getElementById("list_Refresh");
        button.setAttribute("disabled", "disabled");
        flash_list_coins();
        button.removeAttribute("disabled");
    }
}

async function main() {
    let coins = window.coins
    let prices_data = await lookUpPrices(coins)
    let prices = {};
    for (let price of prices_data) {
        prices[price.id] = price
    }
    console.log(prices)

    let content = ""
    let total = 0
    let percentage = [];
    let dev = document.getElementById('portfolio')
    
    for (index = 0; index < coins.length; index++) {
        percentage.push(balances[coins[index]] * prices[coins[index]]['current_price'])
        total += balances[coins[index]] * prices[coins[index]]['current_price']
    }

    var len = percentage.length;
    var indices = new Array(len);
    for (var idx = 0; idx < len; ++idx) indices[idx] = idx;
    indices.sort(function (a, b) { return percentage[a] < percentage[b] ? 1 : percentage[a] > percentage[b] ? -1 : 0; });

    width_pct = 10
    content += `<tr>
                <th width=${width_pct}%">Token</th>
                <th width=${width_pct}%">Balance</th>
                <th width=${width_pct}%">Price</th>
                <th width=${width_pct}%">USD Value</th>
                <th width=${width_pct}%">Percentage</th>
                <th width=${width_pct}%">1h</th>
                <th width=${width_pct}%">24h</th>
                <th width=${width_pct}%">7d</th>
                <th width=${width_pct}%">C-Ratio</th>
                <th width=${width_pct}%">H-Ratio</th>
                </tr>`;
    let usd_line = ""
    for (i = 0; i < coins.length; i++) {
        index = indices[i]
        let usd_val = balances[coins[index]] * prices[coins[index]]['current_price']
        let tmp =  `<tr>
                    <th width="${width_pct}%"><a href="https://www.coingecko.com/en/coins/${prices[coins[index]]["id"]}">${prices[coins[index]]["symbol"]}</a></th>
                    <th width="${width_pct}%">${balances[coins[index]].toFixed(1)}</th>
                    <th width="${width_pct}%">${prices[coins[index]]['current_price'].toFixed(4)}</th>
                    <th width="${width_pct}%">${usd_val.toFixed(0)}</th>
                    <th width="${width_pct}%">${(usd_val / total * 100).toFixed(2)}%</th>
                    <th width="${width_pct}%" class=${prices[coins[index]]['price_change_percentage_1h_in_currency'] > 0 ? "price_up" : "price_down"}>
                    ${prices[coins[index]]['price_change_percentage_1h_in_currency'].toFixed(2)}%</th>
                    <th width="${width_pct}%" class=${prices[coins[index]]['price_change_percentage_24h_in_currency'] > 0 ? "price_up" : "price_down"}>
                    ${prices[coins[index]]['price_change_percentage_24h_in_currency'].toFixed(2)}%</th>
                    <th width="${width_pct}%" class=${prices[coins[index]]['price_change_percentage_7d_in_currency'] > 0 ? "price_up" : "price_down"}>
                    ${prices[coins[index]]['price_change_percentage_7d_in_currency'].toFixed(2)}%</th>
                    <th width="${width_pct}%">${(prices[coins[index]]['circulating_supply'] / balances[coins[index]]).toFixed(0)}</th>
                    <th width="${width_pct}%">${(prices[coins[index]]['fully_diluted_valuation'] / usd_val).toFixed(0)}</th>
                    </tr>`;
        if (prices[coins[index]]["symbol"] == "usdc") {
            usd_line += tmp;
        } else {
            content += tmp;
        }
    }
    
    content += usd_line;
    dev.innerHTML = content;
    document.getElementById('total-value').innerHTML = `<h3>Total:  ${total.toFixed(2)}</h3></div>`
    document.title = total.toFixed(2);
    console.log(total);
}


async function flash_list_coins() {
    let prices_data = await lookUpPrices(coin_list)
    let prices = {};
    for (let price of prices_data) {
        prices[price.id] = price
    }

    let content = ""
    let total = 0
    let percentage = [];
    let dev = document.getElementById('list')
    
    content += `<tr>
        <th width="25%">Token</th>
        <th width="25%">Price</th>
        <th width="25%">Token</th>
        <th width="25%">Price</th>
                </tr>`;
    content += '<tr>'
    for (i = 0; i < coin_list.length; i++) {
            content += `<th width="25%"><a href="https://www.coingecko.com/en/coins/${coin_list[i]}">${coin_list[i]}</a></th>
                        <th width="25%">${prices[coin_list[i]]['current_price']}</th>
                        `;
            if (i % 2 == 1) {
                content += '</tr><tr>'
            }
    }
    content += '</tr>'
    dev.innerHTML = content;
}

sushi_abi = [{"inputs":[{"internalType":"contract SushiToken","name":"_sushi","type":"address"},{"internalType":"address","name":"_devaddr","type":"address"},{"internalType":"uint256","name":"_sushiPerBlock","type":"uint256"},{"internalType":"uint256","name":"_startBlock","type":"uint256"},{"internalType":"uint256","name":"_bonusEndBlock","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint256","name":"pid","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint256","name":"pid","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"EmergencyWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint256","name":"pid","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdraw","type":"event"},{"inputs":[],"name":"BONUS_MULTIPLIER","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_allocPoint","type":"uint256"},{"internalType":"contract IERC20","name":"_lpToken","type":"address"},{"internalType":"bool","name":"_withUpdate","type":"bool"}],"name":"add","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"bonusEndBlock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"deposit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_devaddr","type":"address"}],"name":"dev","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"devaddr","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"}],"name":"emergencyWithdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_from","type":"uint256"},{"internalType":"uint256","name":"_to","type":"uint256"}],"name":"getMultiplier","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"massUpdatePools","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"}],"name":"migrate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"migrator","outputs":[{"internalType":"contract IMigratorChef","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"},{"internalType":"address","name":"_user","type":"address"}],"name":"pendingSushi","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"poolInfo","outputs":[{"internalType":"contract IERC20","name":"lpToken","type":"address"},{"internalType":"uint256","name":"allocPoint","type":"uint256"},{"internalType":"uint256","name":"lastRewardBlock","type":"uint256"},{"internalType":"uint256","name":"accSushiPerShare","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"poolLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"},{"internalType":"uint256","name":"_allocPoint","type":"uint256"},{"internalType":"bool","name":"_withUpdate","type":"bool"}],"name":"set","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IMigratorChef","name":"_migrator","type":"address"}],"name":"setMigrator","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"startBlock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"sushi","outputs":[{"internalType":"contract SushiToken","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"sushiPerBlock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalAllocPoint","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"}],"name":"updatePool","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"userInfo","outputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}]