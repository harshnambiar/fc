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
                     "0xaAAcF0A44cfe45ad7eE80a39597A98184D611b62");

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
                     "0xaAAcF0A44cfe45ad7eE80a39597A98184D611b62");
  
  const myAddress = localStorage.getItem("acc");
  const pay = web3.utils.toWei('0.01', 'ether');
  const factor = 2;
  try {
    const res = await contract.methods.storeAmount("0xB1dfA879a8273bC25946AA14598cB96BFEce2D49", 2, factor, "1st").send({from: myAddress, value: factor * pay, gas: 100000, gasLimit: 1000000});
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
                     "0xaAAcF0A44cfe45ad7eE80a39597A98184D611b62");


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
    const e = "The function has already been called today";
    document.getElementById("res").innerHTML = `
    Result:
    <br/>
    `.concat(e).concat(`
  `);
  }

}
window.distributeCapsules = distributeCapsules;


async function to_about(){
  window.location.href = "./about.html";
}
window.to_about = to_about;

async function to_home(){
  window.location.href = "./";
}
window.to_home = to_home;

async function to_capsules(){
  window.location.href = "./capsules.html";
}
window.to_capsules = to_capsules;

async function to_create(){
  window.location.href = "./create.html";
}
window.to_create = to_create;

async function load_create(){
  var el = document.getElementById("crt_conf");
  const cur_width = Number((el.style.width).replace("%", ""));
  const factor = (1600 / screen.width);
  el.style.width = (cur_width * factor).toString().concat("%");
  const add = localStorage.getItem("acc");
  if (add == null){
    window.location.href = "./";
  }
}
window.load_create = load_create;

function isLegalStr(s){
  if (s == ""){
    return true;
  }
  else {
    return /^[a-zA-Z0-9?!\.]+$/.test(s);
  }

}

async function confirm_create(){
  const b = document.getElementById("pben").value;
  const a = document.getElementById("pamt").value;
  const ma = document.getElementById("pmat").value;
  const ms = document.getElementById("pmes").value;
  var el = document.getElementById("res_box");
  if (b == ""){
    el.textContent = "Beneficiary must be a valid address";
    return;
  }
  if (isNaN(parseInt(a)) || parseInt(a) != parseFloat(a)){
    el.textContent = "Amount needs to be a whole number";
    return;
  }
  else {
    if (parseInt(a) > 10000){
      el.textContent = "Amount needs to be smaller than 10000";
      return;
    }
  }
  if (isNaN(parseInt(ma)) || parseInt(ma) != parseFloat(ma)){
    el.textContent = "Maturity needs to be a whole number";
    return;
  }
  else {
    if (parseInt(ma) > 3000){
      el.textContent = "Maturity must be lesser than 3000 days";
      return;
    }
  }
  if (!isLegalStr(ms)){
    el.textContent = "Message can be blank or must be made of letters, numbers and .!?";
    return;
  }
  if (ms.length > 50){
    el.textContent = "Message cannot be longer than 50 characters";
    return;
  }

  const web3 = new Web3(window.ethereum);
  const abiInstance = ABI.abi;
  const contract = new web3.eth.Contract(
                                    abiInstance,
                     "0xaAAcF0A44cfe45ad7eE80a39597A98184D611b62");

  const myAddress = localStorage.getItem("acc");
  if (myAddress == null){
    el.textContent = "You are not logged in!";
    return;
  }

  const pay = web3.utils.toWei('0.01', 'ether');

  try {
    const res = await contract.methods.storeAmount(b, ma, a, ms).send({from: myAddress, value: a * pay, gas: 100000, gasLimit: 1000000});
    el.textContent = "Capsule Created successfully! Create another if you want using the same form";
    document.getElementById("pben").value = "";
    document.getElementById("pamt").value = "";
    document.getElementById("pmat").value = "";
    document.getElementById("pmes").value = "";
  }
  catch (err){
    console.log(err);
    el.textContent = "Capsule Creation failed! Make sure the address is real and you have the funds.";
  }

}
window.confirm_create = confirm_create;

async function load_capsules(){
  const web3 = new Web3(window.ethereum);
  const abiInstance = ABI.abi;
  const contract = new web3.eth.Contract(
                                    abiInstance,
                     "0xaAAcF0A44cfe45ad7eE80a39597A98184D611b62");

  const myAddress = localStorage.getItem("acc");
  console.log(myAddress);
  var arr = [];

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

    while (i < res1.length){
      arr.push([res1[i], res2[i], res3[i], res4[i]]);
      i++;
    }

  }
  catch (err){
    console.log(err);
    return;
  }

  const dnow = Math.floor(Date.now() / (60*60*24*1000));
  var el = document.getElementById("cap_cont");


  var j = 0;
  while (j < arr.length){
    var el = document.getElementById("cap_cont");
    var tleft = (parseInt(arr[j][2]) - dnow).toString();
    var val = arr[j][0].concat(" ").concat(arr[j][1]).concat(" ").concat(tleft.concat(" days")).concat(" ").concat(arr[j][3]);
    if (j % 2 == 0){
      el.innerHTML = el.innerHTML + `
      <tr style="background-color: black;color: #ff8c00;">
          <td>`.concat(arr[j][0]).concat(`</td>
          <td>`.concat(arr[j][1]).concat(`</td>
          <td>`.concat(tleft.concat(" days")).concat(`</td>
          <td>`.concat(arr[j][3]).concat(`</td>
        </tr>`))));
    }
    else {
      el.innerHTML = el.innerHTML + `
      <tr style="color: black;background-color: #ff8c00;">
          <td>`.concat(arr[j][0]).concat(`</td>
          <td>`.concat(arr[j][1]).concat(`</td>
          <td>`.concat(tleft.concat(" days")).concat(`</td>
          <td>`.concat(arr[j][3]).concat(`</td>
        </tr>`))));
    }

    j++;
  }


  console.log(dnow);

}
window.load_capsules = load_capsules;


async function sort_capsules_amt(){
  const web3 = new Web3(window.ethereum);
  const abiInstance = ABI.abi;
  const contract = new web3.eth.Contract(
                                    abiInstance,
                     "0xaAAcF0A44cfe45ad7eE80a39597A98184D611b62");

  const myAddress = localStorage.getItem("acc");
  var arr = [];

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

    while (i < res1.length){
      arr.push([res1[i], res2[i], res3[i], res4[i]]);
      i++;
    }

  }
  catch (err){
    console.log(err);
    return;
  }

  const dnow = Math.floor(Date.now() / (60*60*24*1000));
  var el = document.getElementById("cap_cont");
  el.innerHTML = `
    <tr style="font-size:1.2em;">
      <td>Sender</td>
      <td>Amount in 0.01 FLR</td>
      <td>Time to Maturity</td>
      <td>Message</td>
    </tr>
  `;
  arr = arr.sort(sort_amount).reverse();
  var j = 0;
  while (j < arr.length){
    var el = document.getElementById("cap_cont");
    var tleft = (parseInt(arr[j][2]) - dnow).toString();
    var val = arr[j][0].concat(" ").concat(arr[j][1]).concat(" ").concat(tleft.concat(" days")).concat(" ").concat(arr[j][3]);
    if (j % 2 == 0){
      el.innerHTML = el.innerHTML + `
      <tr style="background-color: black;color: #ff8c00;">
          <td>`.concat(arr[j][0]).concat(`</td>
          <td>`.concat(arr[j][1]).concat(`</td>
          <td>`.concat(tleft.concat(" days")).concat(`</td>
          <td>`.concat(arr[j][3]).concat(`</td>
        </tr>`))));
    }
    else {
      el.innerHTML = el.innerHTML + `
      <tr style="color: black;background-color: #ff8c00;">
          <td>`.concat(arr[j][0]).concat(`</td>
          <td>`.concat(arr[j][1]).concat(`</td>
          <td>`.concat(tleft.concat(" days")).concat(`</td>
          <td>`.concat(arr[j][3]).concat(`</td>
        </tr>`))));
    }

    j++;
  }



}
window.sort_capsules_amt = sort_capsules_amt;


async function sort_capsules_mat(){
  const web3 = new Web3(window.ethereum);
  const abiInstance = ABI.abi;
  const contract = new web3.eth.Contract(
                                    abiInstance,
                     "0xaAAcF0A44cfe45ad7eE80a39597A98184D611b62");

  const myAddress = localStorage.getItem("acc");
  var arr = [];

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

    while (i < res1.length){
      arr.push([res1[i], res2[i], res3[i], res4[i]]);
      i++;
    }

  }
  catch (err){
    console.log(err);
    return;
  }

  const dnow = Math.floor(Date.now() / (60*60*24*1000));
  var el = document.getElementById("cap_cont");
  el.innerHTML = `
    <tr style="font-size:1.2em;">
      <td>Sender</td>
      <td>Amount in 0.01 FLR</td>
      <td>Time to Maturity</td>
      <td>Message</td>
    </tr>
  `;
  arr = arr.sort(sort_time);
  var j = 0;
  while (j < arr.length){
    var el = document.getElementById("cap_cont");
    var tleft = (parseInt(arr[j][2]) - dnow).toString();
    var val = arr[j][0].concat(" ").concat(arr[j][1]).concat(" ").concat(tleft.concat(" days")).concat(" ").concat(arr[j][3]);
    if (j % 2 == 0){
      el.innerHTML = el.innerHTML + `
      <tr style="background-color: black;color: #ff8c00;">
          <td>`.concat(arr[j][0]).concat(`</td>
          <td>`.concat(arr[j][1]).concat(`</td>
          <td>`.concat(tleft.concat(" days")).concat(`</td>
          <td>`.concat(arr[j][3]).concat(`</td>
        </tr>`))));
    }
    else {
      el.innerHTML = el.innerHTML + `
      <tr style="color: black;background-color: #ff8c00;">
          <td>`.concat(arr[j][0]).concat(`</td>
          <td>`.concat(arr[j][1]).concat(`</td>
          <td>`.concat(tleft.concat(" days")).concat(`</td>
          <td>`.concat(arr[j][3]).concat(`</td>
        </tr>`))));
    }

    j++;
  }



}
window.sort_capsules_mat = sort_capsules_mat;

// fetches a registered smart contract ABI from the flare explorer
// doesn't require a metamask connection
async function fetchAbi(){
  const base_url = "https://coston2-explorer.flare.network/api";
  const params =
    "?module=contract&action=getabi&address=0xaAAcF0A44cfe45ad7eE80a39597A98184D611b62";
  const response = await fetch(base_url + params);
  const abi = JSON.parse((await response.json())["result"]);
  return abi;
}

function sort_time(a, b) {
  var x;
  var y;
  const dnow = Math.floor(Date.now() / (60*60*24*1000));
  if (isNumeric(parseInt(a[2]))){
    x = parseInt(a[2]);
  }
  else {
    //console.log(parseInt(a[1]));
    x = 0
  }
  if (isNumeric(parseInt(b[2]))){
    y = parseInt(b[2]);
  }
  else {
    y = 0
  }
  console.log(x);
  console.log(y);
  if (x === y) {
      return 0;
  }
  else {
      return (x < y) ? -1 : 1;
  }
}

//pts = pts.sort(sorter).reverse();
function sort_amount(a, b) {
  var x;
  var y;
  if (isNumeric(parseInt(a[1]))){
    x = parseInt(a[1]);
  }
  else {
    x = 0
  }

  if (isNumeric(parseInt(b[1]))){
    y = parseInt(b[1]);
  }
  else {
    y = 0
  }
  if (x === y) {
      return 0;
  }
  else {
      return (x < y) ? -1 : 1;
  }
}


function isNumeric(str) {
  //console.log(typeof str);
  if (typeof str != "string" && typeof str != "number") return false // we only process strings!
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
         !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}
