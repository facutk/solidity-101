import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import StorageContractABI from './abis/Storage.json';

// Very important! this address is dependant on the network!
// When you deploy to ganache or testnet, change this!
// const STORAGE_CONTRACT_ADDRESS = '0xe99038d7fF66a8152a5b0a8087Bb0223A9C55839'; // testnet https://testnet.bscscan.com/address/0xe99038d7fF66a8152a5b0a8087Bb0223A9C55839
const STORAGE_CONTRACT_ADDRESS = '0xc4d2baa542e934bc60834485321acf253402e513'; // mainnet https://bscscan.com/address/0xc4d2baa542e934bc60834485321acf253402e513

const loadWeb3 = async () => {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum)
    await window.ethereum.enable()
  }
  else if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider)
  }
  else {
    window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
  }
}
const App = () => {
  const [address, setAddress] = useState('0x');
  const [isLoading, setIsLoading] = useState(false);
  const [number, setNumber] = useState('');

  useEffect(() => {
    async function init() {
      await loadWeb3()
      const accounts = await window.web3.eth.getAccounts();
      setAddress(accounts[0]);

      const storageContract = new window.web3.eth.Contract(StorageContractABI.abi, STORAGE_CONTRACT_ADDRESS);

      let storedNumber = await storageContract.methods.retrieve().call()
      setNumber(storedNumber);
    }
    init();
  }, []);

  const storeNumber = async (newNumber) => {
    setIsLoading(true);
    const storageContract = new window.web3.eth.Contract(StorageContractABI.abi, STORAGE_CONTRACT_ADDRESS);
    storageContract.methods.store(newNumber).send({ from: address }).on('transactionHash', (hash) => {
      setIsLoading(false);
    })
  }

  const handleChange = (e) => {
    setNumber(e.target.value);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    storeNumber(number);
  }

  return (
    <div>
      <a href="https://github.com/facutk/solidity-101">view on github</a>
      <h1>{address}</h1>
      <form onSubmit={handleSubmit}>
        <input type="number" value={number} onChange={handleChange} disabled={isLoading} />
        <button type="submit" disabled={isLoading}>Save</button>
      </form>
    </div>
  );
}

export default App;
