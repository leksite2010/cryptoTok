import axios from 'axios';
import contract from '../contract/cryptoTokContractAbi.json';
import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Web3 from 'web3';
import { useForm } from 'react-hook-form';
import {useState,useEffect} from 'react';
import "../styles/styles.css";

const initialInfo = {
    connected: false,
    status: null,
    account: null,
    contract: null,
}



const initialVideo = {
    trxHash: "",
    status:false,
    msg:"",
}
const videoReport = {
    trxHash: "",
    status:false,
    msg:"",
}
const VideoList = () => {
     const [info, setInfo] = useState(initialInfo);
     const [videos, setVideos] = useState({initialVideo});
     const [reports, setReports] = useState({videoReport});
     const [responses] = useState([]);


     
     const {
        register,
        handleSubmit,
        formState: { errors },
      } = useForm();

const onSubmit = (data) => {
    let newData = {
        videosUri: data.videosUri,
        advertiser: data.advertiser,
        approved: false,

    }
    //console.log(Object.values(newData));
    info.contract.methods
        .addVideo(Object.values(newData))
        .send({from: info.account})
        .then((res)=>{
        //    console.log(res); 
        setReports({
            ...initialVideo,
            status: true,
            trxHash: res.transactionHash,
            msg: "Transaction in progress... <a href='https://ropsten.etherscan.io/tx/"+videoReport.trxHash+"' target='_blank'>Click here to check </a>",
        });

        }).catch((err)=>{
            setReports({
                ...initialVideo,
                status: false,
                msg: "Transaction Failed!",
            });
        });
        //end sending data to contract
};

     const init = async ()=>{
        if(window.ethereum?.isMetaMask){
            //console.log("Metamask connected");
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
       
           // const networkId = await window.ethereum.request({
           //     method: "net_version",
           // });
        
           // if(networkId == 3){
               let web3 = new Web3(window.ethereum);
               setInfo({
                ...initialInfo,
                connected: true,
                account: accounts[0],
                contract: new web3.eth.Contract(contract.abi,contract.address),
               }) ;

        }
        else{
            setInfo({ ...initialInfo,status:"You need metamask"});
          //  console.log("You need to install metamask");
        }
     };

     //console.log(info);
     const getWatchHistory = ((arrayOfAddress)=>{
     
    });
    const getEarnHistory = async ()=>{

    };
     const getVideos = async ()=>{
        setVideos((prevState)=>({
            ...prevState,
            loading:true,
        }));

        info.contract.methods
        .getVideos()
        .call()
        .then((res)=>{
            
            res.map((item)=>{
                if (item.videoUri.toLowerCase().indexOf("https") > -1 ) {
                    const getResponse = axios.get(item.videoUri);
                    responses.push(getResponse);
                   }
                
                
            });
           const newArray = [];
            axios.all(responses).then(
                axios.spread((...allData)=>{

                    for(let i= 0; i < allData.length; i++){
                        let sdata = allData[i];
                        newArray.push(sdata.data);
                    }
                    console.log(newArray);
                    setVideos({
                        loading: false,
                        list: newArray,
        
                    });
                })
            )
        }).catch((err)=>{
            console.log(err);
            setVideos(initialVideo);
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
            <h1>CryptoTok Video App</h1>
           
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
          <Tab>Watch Video</Tab>
          <Tab> Upload Video</Tab>
          <Tab> Watch History</Tab>
          <Tab> Earnings </Tab>
        </TabList>
    
        <TabPanel>      
            <button onClick={()=>getVideos()}>Fetch All Videos</button>
            {videos.loading ? <p>Loading...</p> : null}

            {
                videos.list ?
                videos.list.map((items)=>{
                    return(
                   
                        <div class="videosContainer">
                            <div>
                            <p className={"videosText"}>Advertiser Data Link: {items.name} </p>
                            
                            <p className={"videosText"}>Advertiser Address: {items.description} </p>
                            <video alt={"videosImage"} src={items.imageUri} class="VideoImage" controls/>
                            </div>
                          
                            <div>
                            <p className={"videosText"}>Likes: {items.tokenId}</p>
                            <p className={"videosText"}>Comments: {items.tokenId}</p>
                            </div>
                          
                          
                        </div>
                     );
                    }) : null
                } 
        </TabPanel>
        <TabPanel>
        <div class="Minter">
            <h1>CryptoTok Video Upload</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
            <p id="title">Please, fill the Video Details Url</p>
            
            <div id="status"> {  reports.msg }</div> 
       
        <input {...register('videosUri')} placeholder='video Uri'/> {/* register an input */}
        <br/>
        
        <input {...register('advertiser')}  placeholder='Advertiser Address'/>
      
        <br/>
        <button type="submit" id="mintButton"> Upload Video</button>
        </form>
        </div>
        </TabPanel>
        <TabPanel>      
            <button onClick={()=>getWatchHistory()}> Fetch Watched Videos</button>
            {videos.loading ? <p>Loading...</p> : null}
            <p>History of watch video display here</p>
        </TabPanel>
        <TabPanel>      
            <button onClick={()=>getEarnHistory()}> Fetch Earnings</button>
            {videos.loading ? <p>Loading...</p> : null}
            <p>History of watch video display here</p>
        </TabPanel>
      </Tabs>  
      </div> 
    );
};

export default VideoList;
