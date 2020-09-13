$(async function() {
    prepare_data();
    addMenu();
    consoleInit();
    start(main);
});


async function main() {
    const App = await init_ethers();

    const WETH_CONTRACT = new ethers.Contract(WETH_ADDR, ERC20_ABI, App.provider);
    
    const forLoop = async addresses => {
        const balances = addresses.map( async address => {
        balance = await App.provider.getBalance(address) / 1e18
        // weth_balance = await WETH_CONTRACT.balanceOf(address) / 1e18
        return [address, balance]
        })
        return Promise.all(balances)
    }
    
    balances = await forLoop(addresses)
    // console.log(balances)
    var total = 0
    for (index = 0; index < balances.length; index++) {
        _print(`${balances[index][0]}:  ${balances[index][1].toFixed(2)}`)
        total += balances[index][1]
    }
    _print(`\ntotal:  ${total.toFixed(2)}\n`)
}

