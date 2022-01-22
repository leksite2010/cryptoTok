import contract from '../contract/contract.json';
import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Web3 from 'web3';
import { useForm } from 'react-hook-form';
import {useState,useEffect} from 'react';
import "../styles/styles.css";
const pinataSDK = require('@pinata/sdk');
const pinata = pinataSDK('2a087ba8b3e15c052d26', 'e3564d468627e88ec30048bec3c1fddfdb4f0302aac3e38784089f555e2e6552');

const initialInfo = {
    connected: false,
    status: null,
    account: null,
    contract: null,
}

const initialDrop = {
   loading: false,
    list: "",
}

const Tresche = () => {
     const [info, setInfo] = useState(initialInfo);
     const [drops, setDrops] = useState({initialDrop});
const dropReport = {
    trxHash: "",
    status:false,
    msg:"",
}
     const {
        register,
        handleSubmit,
        formState: { errors },
      } = useForm();

const onSubmit = (data) => {
    let newData = {
        imageUri: data.imageUri,
        name: data.name,
        description: data.description,
        websiteUri: data.websiteUri,
        to: data.to,
        _tokenId: data._tokenId,
        price: data.price,
        supply: Number(data.supply),
        presales: Number(data.presales),
        sale: Number(data.sale),
        chain: Number(data.chain),
        approved: false,

    }
    //console.log(Object.values(newData));
    info.contract.methods
        .addDrop(Object.values(newData))
        .send({from: info.account})
        .then((res)=>{
        //    console.log(res); 
            dropReport.status =res.status;
            dropReport.trxHash=res.transactionHash
            dropReport.msg ="Transaction in progress..."

         }).catch((err)=>{
          //  console.log(err);
            dropReport.msg ="Transaction Failed"
        });
        //end sending data to contract
};

     const init = async ()=>{
        if(window.ethereum?.isMetaMask){
            //console.log("Metamask connected");
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
       
            const networkId = await window.ethereum.request({
                method: "net_version",
            });
        
           // if(networkId == 3){
               let web3 = new Web3(window.ethereum);
               setInfo({
                ...initialInfo,
                connected: true,
                account: accounts[0],
                contract: new web3.eth.Contract(contract.newAbi,contract.newAddress),
               }) ;

            // }else{
            //     setInfo({
            //         ...initialInfo,
            //         status: "You need to be on ethereum testnet network",
            //     });
            // }

        }
        else{
            setInfo({ ...initialInfo,status:"You need metamask"});
          //  console.log("You need to install metamask");
        }
     };

     //console.log(info);

     const getDrops = async ()=>{
        setDrops((prevState)=>({
            ...prevState,
            loading:true,
        }));

        info.contract.methods
        .getDrops()
        .call()
        .then((res)=>{
            console.log(res);
            setDrops({
                loading: false,
                list: res,

            });
        }).catch((err)=>{
            console.log(err);
            setDrops(initialDrop);
        });
     };

     const initOnChange = ()=>{
        if(window.ethereum){
            window.ethereum.on("accountsChanged",()=>{
               window.location.reload();
            });

            window.ethereum.on("chainChanged", ()=>{
                window.location.reload();
            });
        }
     };

     useEffect(()=>{
         init();
         initOnChange();
     },[]);

  

    return (
       <div>
           <div class="header">
            <h1>TRESLECHESCAKE NFT</h1>
           
           <button id="walletButton">
        {info.account ? (
          "Connected: " +
          String(info.account).substring(0, 6) +
          "..." +
          String(info.account).substring(38)
        ) : (
          <span>Connect Wallet</span>
        )}
      </button>
      </div>
      
        <Tabs>
        <TabList>
          <Tab>Display NFT</Tab>
          <Tab>Mint NFT</Tab>
        </TabList>
    
        <TabPanel>      
            <button onClick={()=>getDrops()}>Get Drops</button>
            {drops.loading ? <p>Loading...</p> : null}

            {
                drops.list ?
                drops.list.map((items)=>{
                    return(
                        <div className={"dropContainer"}>
                            <div>
                            
                            <p className={"dropText"}>Name: {items.name}</p>
                            <p className={"dropText"}>Description: {items.description} </p>
                            <img alt={"dropimage"} src={items.imageUri} class="dropImage"/>
                            </div>
                          
                            <div>
                            <p className={"dropText"}>Twitter Link: {items._tokenId}</p>
                            <p className={"dropText"}>Discord: {items._tokenId}</p>
                            </div>
                          
                            <div>
                            <p className={"dropText"}>Supply: {items.supply}</p>
                            <p className={"dropText"}>Sale: {items.sale}</p>
                            <p className={"dropText"}>Presales: {items.presales}</p>
                            </div>
                          
                        </div>
                    );
                }) : null
            } 
        </TabPanel>
        <TabPanel>
            <div class="Minter">
         
        <form onSubmit={handleSubmit(onSubmit)}>
            <p id="title">Please, fill the NFT DATA</p>
            {
            <div id="status">{dropReport.msg} </div>}
        <input {...register('imageUri')} placeholder='imageUri'/> {/* register an input */}
        <br/>
        <input {...register('name')}  placeholder='NFT name'/> {/* register an input */}
         <br/>
         <input {...register('description', { required: true })}  placeholder='Description'/>
       
        <br/>
        <input {...register('to')}  placeholder='Social 1'/>
        <br/>
        <input {...register('_tokenId')}  placeholder='Social 2'/>
        <br/>
        <input {...register('websiteUri')}  placeholder='websiteUri'/>
        <br/>
        {/* <input {...register('price')}  placeholder='price'/>
        <br/>
        <input {...register('supply')}  placeholder='supply'/>
        <br/>
        <input {...register('sale')}  placeholder='sales'/>
        <br/>
        <input {...register('presales')}  placeholder='presales'/>
        <br/>
        <input {...register('chain')} placeholder='chain'/>

        {errors.age && <p>Please enter number for age.</p>}
        <br/> */}
        <button type="submit" id="mintButton"> Mint NFT</button>
        </form>
        </div>
        </TabPanel>
      </Tabs>  
      </div> 
    );
};

export default Tresche;
// // "https://testtest.com/3.png",
// approved: false
// chain: "1"
// description: "This is my drop for the month"
// imageUri: "https://testtest.com/3.png"
// name: "Test Collection"
// presale: "1635790237"
// price: "0.03"
// sale: "1635790237"
// to: "twitter"
// _tokenId: "https://testtest.com"
// supply: "22"
// websiteUri: "fasfas"

// name: "Test Collection"
// presale: "1635790237"
// price: "0.03"
// sale: "1635790237"
// to: "twitter"
// _tokenId: "https://testtest.com"
// supply: "22"
// websiteUri: "fasfas"