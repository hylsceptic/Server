$(async function() {
    addMenu();
    consoleInit();
    start(main);
});


async function main() {
    const App = await init_ethers();
    const SUSD_CONTRACT = new ethers.Contract(SUSD_ADDRESS, ERC20_ABI, App.provider);
    const SNX_CONTRACT = new ethers.Contract(SNX_TOKEN_ADDRESS, ERC20_ABI, App.provider);
    
    promises = [lookUpPrices(["havven", 'ethereum']), 
                SUSD_CONTRACT.totalSupply(),
                SNX_CONTRACT.balanceOf(SNX_UNISWAPV1_POOL_ADDRESS), 
                App.provider.getBalance(SNX_UNISWAPV1_POOL_ADDRESS),
                SNX_CONTRACT.balanceOf(MAIN_ADDRESS)]
    
    results = await Promise.all(promises)
    const prices = results[0];
    susd_supply = results[1] / 1e18;
    uniswap_snx_balance = results[2] / 1e18;
    uniswap_snx_eth_balance = results[3] / 1e18;
    my_snx_balance = results[4] / 1e18;
    _print(`SUSD Supply: ${susd_supply}`)
    _print(`Ether Prince: ${prices.ethereum.usd}`)
    _print(`Snx Prince: ${prices.havven.usd}`)
    snx_uniswap_price = uniswap_snx_eth_balance * prices.ethereum.usd / uniswap_snx_balance
    _print(`Snx uniswap price: ${snx_uniswap_price}`)
    _print(`Hold Snx: ${my_snx_balance}  Usd value: ${my_snx_balance * snx_uniswap_price}`)
}


document.getElementById("Refresh").onclick = async function () { 
    const App = await init_ethers();
    const SUSD_CONTRACT = new ethers.Contract(SUSD_ADDRESS, ERC20_ABI, App.provider);
    const SNX_CONTRACT = new ethers.Contract(SNX_TOKEN_ADDRESS, ERC20_ABI, App.provider);
    
    promises = [lookUpPrices(["havven", 'ethereum']), 
                SUSD_CONTRACT.totalSupply(),
                SNX_CONTRACT.balanceOf(SNX_UNISWAPV1_POOL_ADDRESS), 
                App.provider.getBalance(SNX_UNISWAPV1_POOL_ADDRESS),
                SNX_CONTRACT.balanceOf(MAIN_ADDRESS)]
    
    results = await Promise.all(promises)
    const prices = results[0];
    susd_supply = results[1] / 1e18;
    uniswap_snx_balance = results[2] / 1e18;
    uniswap_snx_eth_balance = results[3] / 1e18;
    my_snx_balance = results[4] / 1e18;
    document.getElementById('log').innerHTML = "";
    _print(`SUSD Supply: ${susd_supply}`)
    _print(`Ether Prince: ${prices.ethereum.usd}`)
    _print(`Snx Prince: ${prices.havven.usd}`)
    snx_uniswap_price = uniswap_snx_eth_balance * prices.ethereum.usd / uniswap_snx_balance
    _print(`Snx uniswap price: ${snx_uniswap_price}`)
    _print(`Hold Snx: ${my_snx_balance}  Usd value: ${my_snx_balance * snx_uniswap_price}`)
};


document.getElementById("Add").onclick = async function () {
    let button = document.getElementById("Add");
    button.setAttribute("disabled", "disabled");
    let sell_token = document.getElementById("sell_coin").value;
    let sell_amount = document.getElementById("sell_amount").value;
    let buy_token = document.getElementById("buy_coin").value;
    let buy_amount = document.getElementById("buy_amount").value;
    $.post("http://localhost:3000/test", {sell_token: sell_token, sell_amount: sell_amount, buy_token: buy_token, buy_amount: buy_amount}, function(data){
        if(data==='yes') {
            console.log("test success");
        }
    });
    button.removeAttribute("disabled");
}
