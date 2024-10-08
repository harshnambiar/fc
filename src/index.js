import detectEthereumProvider from "@metamask/detect-provider"
import Web3 from "web3"; 
import ABI from './abi.json'


// connects metamask to the flare testnet (coston2)
async function connect(code) {
    
  const provider = await detectEthereumProvider()

  if (provider && provider === window.ethereum) {
    console.log("MetaMask is available!");
    const chainId = 114;
    console.log(window.ethereum.networkVersion);
    if (window.ethereum.networkVersion !== chainId) {
        const cid = '0x72';
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: cid }]
        });
        console.log("changed to flare testnet successfully");
        
      } catch (err) {
          // This error code indicates that the chain has not been added to MetaMask
        if (err.code === 4902) {
        console.log("please add Flare Coston Testnet as a network");
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainName: 'Flare Testnet Coston2',
                chainId: cid,
                nativeCurrency: { name: 'FLARE', decimals: 18, symbol: 'C2FLR' },
                rpcUrls: ['https://coston2.enosys.global/ext/C/rpc']
              }
            ]
          });
        }
        else {
            console.log(err);
        }
      }
    }
    await startApp(provider);
  } else {
    console.log("Please install MetaMask!")
  }



}
window.connect = connect;


async function startApp(provider) {
  if (provider !== window.ethereum) {
    console.error("Do you have multiple wallets installed?")
  }
  else {
    const accounts = await window.ethereum
    .request({ method: "eth_requestAccounts" })
    .catch((err) => {
      if (err.code === 4001) {
        console.log("Please connect to MetaMask.")
      } else {
        console.error(err)
      }
    })
    console.log("hi");
  const account = accounts[0];
  var web3 = new Web3(window.ethereum);
  const bal = await web3.eth.getBalance(account);
  //console.log("hi");
  console.log(bal);
  console.log(account);
  localStorage.setItem("acc",account.toString());
  }
}

async function getFutures() {
  const web3 = new Web3(window.ethereum);
  const abiInstance = ABI.abi;
  const contract = new web3.eth.Contract(
                                    abiInstance,
                     "0xd724613c90224c502D4b2cD5742F56681039edaB");

  const myAddress = localStorage.getItem("acc");
  try {
    var res1 = await contract.methods.fetchFutureSenders().call({from: myAddress});
    var res2 = await contract.methods.fetchFutureAmounts().call({from: myAddress});
    var res3 = await contract.methods.fetchFutureMaturities().call({from: myAddress});
    var res4 = await contract.methods.fetchFutureMessages().call({from: myAddress});
    var i = 0;
    if ((res1.length != res3.length) || (res1.length != res2.length) || (res3.length != res4.length)){
      throw "data corruption error";
      return;
    }
    var arr = [];
    while (i < res1.length){
      arr.push([res1[i], res2[i], res3[i], res4[i]]);
      i++;
    }
    console.log(arr);
  }
  catch (err){
    console.log(err);
  }


}
window.getFutures = getFutures;


// increments the counter by 1
async function createCapsule() {
  const web3 = new Web3(window.ethereum);
  const abiInstance = ABI.abi;
  const contract = new web3.eth.Contract(
                                    abiInstance,
                     "0xd724613c90224c502D4b2cD5742F56681039edaB");
  
  const myAddress = localStorage.getItem("acc");
  const pay = web3.utils.toWei('0.01', 'ether');
  const factor = 3;
  try {
    const res = await contract.methods.storeAmount("0xD0dC8A261Ad1B75A92C5e502AE10c3Fde042b879", 3, factor, "welcome").send({from: myAddress, value: factor * pay, gas: 100000, gasLimit: 1000000});
    document.getElementById("res").innerHTML = `
    Result:
    <br/>
    `.concat('New Capsule Created!').concat(`
  `);
  }
  catch (err){
    console.log(err);
    document.getElementById("res").innerHTML = `
    Result:
    <br/>
    `.concat(err.toString()).concat(`
  `);
  }




}
window.createCapsule = createCapsule;


// resets the counter to 0, but requires a payment of 0.01 C2FLR to do so (excluding gas)
async function distributeCapsules() {
  const web3 = new Web3(window.ethereum);
  const abiInstance = ABI.abi;
    const myAddress = localStorage.getItem("acc");
  //const abiInstance = ABI.abi;
  const contract = new web3.eth.Contract(
                                    abiInstance,
                     "0xd724613c90224c502D4b2cD5742F56681039edaB");


  //const hundredth_eth = BigInt(10000000000000000);
  //const pay = web3.utils.toWei('0.01', 'ether');
  try {
    const res3 = await contract.methods.distribute()
                .send({from: myAddress, gas: 100000, gasLimit: 1000000});
                document.getElementById("res").innerHTML = `
    Result:
    <br/>
    `.concat('Todays maturing capsules distributed!!').concat(`
  `);
  }
  catch (err){
    console.log(err);
    document.getElementById("res").innerHTML = `
    Result:
    <br/>
    `.concat(err.toString()).concat(`
  `);
  }

}
window.distributeCapsules = distributeCapsules;


// fetches a registered smart contract ABI from the flare explorer
// doesn't require a metamask connection
async function fetchAbi(){
  const base_url = "https://coston2-explorer.flare.network/api";
  const params =
    "?module=contract&action=getabi&address=0x24A99A6dcFC3332443037C5a09505731312fD154";
  const response = await fetch(base_url + params);
  const abi = JSON.parse((await response.json())["result"]);
  return abi;
}
