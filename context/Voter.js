import React, { useState, useEffect } from 'react';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import axios from 'axios';
import { useRouter } from 'next/router';

// INTERNAL IMPORT
import { VotingAddress, VotingAddressABI } from './constants';
const fetchContract = (signerOrProvider) => 
  new ethers.Contract(VotingAddress, VotingAddressABI, signerOrProvider);

export const VotingContext = React.createContext();

export const VotingProvider = ({ children }) => {
  const votingTitle = 'My first smart contract app'; 
  const router = useRouter();
  const [currentAccount, setCurrentAccount] = useState('');
  const [candidateLength, setCandidateLength] = useState('');
  const pushCandidte =  [];
  const candidateIndex =[];
  const [candidateArray, setCandidateArray] = useState(pushCandidte); 

////////////////////////END OF CANDIDATE DATA SECTION/////////////////////////////////////

  const [error, setError] = useState('');
  const higestVote = []

  ///////////////////////////VOTER SECTION///////////////////////////////////////////////////
const pushVoter = [];
const [voterArray, setVoterArray] = useState(pushVoter);
const [voterLength, setVoterLength] = useState('');
const [voterAddress, setVoterAddress] = useState([]);


//----------------------------CONNECTING METAMASK--------------------------------///
const checkIfWalletIsConnected = async()=> {
  if (!window.ethereum) return setError("Please Install MetaMask")

    const account = await window.ethereum.request({method: "eth_account"})

    if(account.length) {
      setCurrentAccount(account[0]);
    } else{
        setError("PLEASE INSTALL METAMASK & CONNECT OR RELOAD")
    }
  };

  ////-----------------------CONNECT WALLET------------------------------------------------//

  const connectWallet = async () => {
    if (!window.ethereum) return setError("Please Install MetaMask");

      const account = await window.ethereum.request({
        method: "eth_requestAccounts"
      });
        setCurrentAccount(account[0]);
  };

  ///-------------------------UPLOAD TO IPFS VOTER MAGE----------------------------------//

  const uploadToIPFS = async (file) => {
    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);
  
        const response = await axios.post(
          "https://api.pinata.cloud/pinning/pinFileToIPFS",
          formData,
          {
            headers: {
              pinata_api_key: "e7d4bc9fd1787df4fdf2",
              pinata_secret_api_key: 
              "f086ed48962d1dde43e64477cca65c02a136831c2cfe70c03ee26e414aee46bf",
              "Content-Type": "multipart/form-data",
            },
          });
        const ImgHash = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
        return ImgHash;
      } catch (error) {
        setError("Unable to upload image to Pinata:");
      }
    }
  };

  ///-------------------------UPLOAD TO IPFS CANDIDATE MAGE----------------------------------//

  const uploadToIPFSCandidate = async (file) => {
    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);
  
        const response = await axios.post(
          "https://api.pinata.cloud/pinning/pinFileToIPFS",
          formData,
          {
            headers: {
              pinata_api_key: "e7d4bc9fd1787df4fdf2",
              pinata_secret_api_key: 
              "f086ed48962d1dde43e64477cca65c02a136831c2cfe70c03ee26e414aee46bf",
              "Content-Type": "multipart/form-data",
            },
          });
        const ImgHash = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
        return ImgHash;
      } catch (error) {
        setError("Unable to upload image to Pinata:");
      }
    }
  };


  ///----------------------------------------CREATE VOTER-------------------------------------------------//

  const createVoter = async (formInput, fileUrl, router) => {
    try {
      const { name, address, position } = formInput;
  
      if (!name || !address || !position) 
        return console.log("Input data is missing");

      console.log(name, address, position, fileUrl);
    ////----------------------------------------CONNECTING SMART CONTRACT----------------------------------------------///
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(signer);

    const data = JSON.stringify({ name, address, position, image: fileUrl });
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      data,
      {
        headers: {
          pinata_api_key: "e7d4bc9fd1787df4fdf2",
          pinata_secret_api_key: 
          "f086ed48962d1dde43e64477cca65c02a136831c2cfe70c03ee26e414aee46bf",
          "Content-Type": "application/json",
        },
      });

    const url = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
    const voter = await contract.voterRight(address, name, url, fileUrl);
    voter.wait();

    console.log( voter);

      router.push("/voterList");
    } catch (error) {
      setError("something wrong creating voter")
    }
  }

  /////-----------------------------------------GET VOTER DATA----------------------------------------------------//
      const getAllVoterData = async() => {
        try{
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const contract = fetchContract(signer);
      
      //-----------VOTER LIST----------------///
        const voterListData = await contract.getVoterList();
        setVoterAddress(voterListData);
        
        voterListData.map(async (el) => {
          const singleVoterData = await contract.getVoterdata(el);
          pushVoter.push(singleVoterData);
        });
    
        //-----------VOTER.LENGTH------------///
        const voterList = await contract.getVoterLength();
        setVoterLength(voterList.toNumber());
        
      } catch (error) {
        console.error("Error:", error);
        setError("Something went wrong while creating voter");
      }
    };

  /////-------------------GIVE VOTE---------------///
  const giveVote = async (id) => {
    try{
      const voterAddress = id.address;
      const voterId = id.id;
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer); 

      const voteredList = await contract.vote(voterAddress, voterId);
      console.log(voteredList)

      voteredList.wait
    } catch (error){
      console.log(error);
    }
  };

  //useEffect(() => {
  //   getAllVoterData();
  //  console.log(voterArray);
  //}, []);

  /////-----------------------------------------------CANDIDATE SECTION---------------------------------------------///
  const setCandidate = async(candidateForm, fileUrl, router) => {
    try {
      const { name, address, age } = candidateForm;
  
      if (!name || !address || !age) 
        return setError("Input data is missing");

      console.log(name, address,age, fileUrl);

    ////----------------------------------------CONNECTING SMART CONTRACT----------------------------------------------///
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(signer);

    const data = JSON.stringify({ name, address, image: fileUrl, age });
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      data,
      {
        headers: {
          pinata_api_key: "e7d4bc9fd1787df4fdf2",
          pinata_secret_api_key: 
          "f086ed48962d1dde43e64477cca65c02a136831c2cfe70c03ee26e414aee46bf",
          "Content-Type": "application/json",
        },
      });

    const ipfs = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
    const candidate = await contract.setCandidate(
      address, 
      age, 
      name, 
      fileUrl, 
      ipfs
    );
    candidate.wait();

    console.log(candidate);

      router.push("/")
    } catch (error) {
      setError("something wrong creating candidate");
    }
  };



  ////-----------------GET CANDIDATE DATA--------------------//////
  const getNewCandidate = async() => {
    try {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(signer);

    //////-------------------ALL CANDIDATE------------------------//////
    const allCandidate = await contract.getCandidate();
    

    allCandidate.map(async (el) => {
      const singleCandidateData = await contract.getCandidatedata(el);

      pushCandidte.push(singleCandidateData)
      candidateIndex.push(singleCandidateData[2].toNumber());
      
    });
    
    ////////////----------------------------CANDIDATE LEANGTH---------------//////////
    const allCandidateLength = await contract.getCandidateLength();
    setCandidateLength(allCandidateLength.toNumber());
    }catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getNewCandidate();
    console.log(voterArray);
  }, []);

  return (
    <VotingContext.Provider value={{ 
      votingTitle,
      checkIfWalletIsConnected,
      connectWallet,
      uploadToIPFS,
      createVoter,
      getAllVoterData,
      giveVote,
      setCandidate,
      getNewCandidate,
      error,
      voterArray,
      voterLength,
      voterAddress,
      currentAccount,
      candidateLength,
      candidateArray,
      uploadToIPFSCandidate,
      }}>
      {children}
    </VotingContext.Provider>
  );
};