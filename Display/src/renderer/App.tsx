import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useCallback, useEffect, useState, useRef } from 'react'
import icon from '../../assets/icon.svg';
import backGif from '../../assets/Lefter.png'
import './App.css';
const backEndAddr = "http://localhost:5000/api/fetch?param=closest"
const controlPanelAddr = "ws://localhost:5829"
function MainMenu(props) {
  return (
    <div>
      <img id="idle-gif" src={backGif}/>
      <span id="tSpan">{props.systime}</span>
      <div id="MenuButtons">
	<button onClick={props.dashFunc}>Dashboard</button>
	<button onClick={props.apFunc}>Nearest Access Points</button>
	<button onClick={props.hostFunc}>Nearest Hosts</button>
	<button onClick={props.btFunc}>Nearest Bluetooth </button>
	<button onClick={props.dbFunc}>Database Menu</button>
	<button onClick={props.ctrlFunc}>Control Menu</button>
      </div>
    </div>
  );
}

function DBMenu(props) {
  return (
    <div>
      <img id="idle-gif" src={backGif}/>
      <span id="tSpan">{props.systime}</span>
      <div id = "APInfo">
        <span id="iSpan">APS: {props.apCount} | HOSTS: {props.hostCount} | BT Devices: {props.btCount}</span>
      </div>
      <div id="MenuButtons">
	<button onClick={props.exportdb}>Export Database Menu</button>
	<button onClick={props.clearAll}>{props.clearAllMesg}</button>
	<button onClick={props.clearWifi}>{props.clearWifiMesg}</button>
	<button onClick={props.clearBT}>{props.clearBTMesg}</button>
	<button onClick={props.mainFunc}>Main Menu</button>
      </div>
    </div>
  );
}

function ExportMenu(props) {
  return (
    <div>
      <img id="idle-gif" src={backGif}/>
      <span id="tSpan">{props.systime}</span>
      <div id = "APInfo">
        <span id="iSpan">Run the following command on a device on the same subnet:</span>
	<span id="rssiSpan">{props.execCmd}</span>
      </div>
      <div id="MenuButtons">
	<button onClick={props.exportdb}>Export Database</button>
	<button onClick={props.dbFunc}>Back to Database Menu</button>
	<button onClick={props.mainFunc}>Main Menu</button>
      </div>
    </div>
  );
}

function CTRLMenu(props) {
  return (
    <div>
      <img id="idle-gif" src={backGif}/>
      <span id="tSpan">{props.systime}</span>
      <div id="MenuButtons">
      <button onClick={props.beaconFunc}>{props.beaconMesg}</button>
      <button onClick={props.scanFunc}>{props.scannerMesg}</button>
      <button onClick={props.btScanFunc}>{props.btScannerMesg}</button>
      <button onClick={props.ctrlFunc}>{props.controlPanelMesg}</button>
      <button onClick={props.killFunc}>Close SkipSkap</button>
      <button onClick={props.mainFunc}>Main Menu</button>
      </div>
    </div>
  );
}

function MainDash(props) {
  //console.log(props.hostEntries);
  const hostElements = [];
  const apElements = [];
  const btElements = [];
  if (props.hostEntries.length > 0 && props.apEntries.length > 0){
    for (let i = 0; i <= props.maxEntries-1; i++){
      if(!props.hostEntries[i]) break;
      hostElements.push(<span id="rssiSpan">{props.hostEntries[i][0]} | {props.hostEntries[i][4]} | {props.hostEntries[i][5]} | {props.hostEntries[i][1]} | {props.hostEntries[i][2]} | {props.hostEntries[i][3]} | {Math.round((Date.now() / 1000) - props.hostEntries[i][6])}s</span>);
    }
    for (let i = 0; i <= props.maxEntries-1; i++){
      if(!props.apEntries[i]) break;
      apElements.push(<span id="rssiSpan">{props.apEntries[i][0]} | {props.apEntries[i][1]} | {props.apEntries[i][5]} | {props.apEntries[i][6]} | {props.apEntries[i][4]} | {props.apEntries[i][7]} | {Math.round((Date.now() / 1000) - props.apEntries[i][8])}s</span>);
    }
    for (let i = 0; i <= props.maxEntries-1; i++){
      if(!props.btEntries[i]) break;
      btElements.push(<span id="rssiSpan">{props.btEntries[i][0]} | {props.btEntries[i][4]} | {props.btEntries[i][1]} | {props.btEntries[i][2]} | {props.btEntries[i][7]} | {props.btEntries[i][3]} | {Math.round((Date.now() / 1000) - props.btEntries[i][5])}s</span>);
    } 
  }
  // SSLF stands for "Seconds Since Last Frame"
  // PC stands for "Probe Count"
  return (
    <div>
      <img id="idle-gif" src={backGif}/>
      <span id="tSpan">{props.systime}</span>
      <div id="HostInfo">
        <span id="iSpan">Nearest hosts (ID, ALIAS, RSSI, MAC, VENDOR, PC, SSLF):</span>
	{hostElements}
      </div>
      <div id="APInfo">
        <span id="iSpan">Nearest access points (ID, SSID, RSSI, BSSID, VENDOR, HOSTS, SSLF):</span>
	{apElements}
      </div>
      <div id="BTInfo">
        <span id="iSpan">Nearest Bluetooth devices (ID, RSSI, MAC, COMPANY, VENDOR, LOCALNAME, SSLF):</span>
	{btElements}
      </div>
      <div id="MenuButtons">
	<button onClick={props.mainMenuFunc}>Main Menu</button>
      </div>
      <div id="SysInfo">
        <span id="iSpan">HOTSPOT: {props.beaconMesg} | SCANNING: {props.scanMesg} | BLUETOOTH SCANNING: {props.btScanMesg}</span>
        <span id="iSpan">Hotspot SSID: BeautifulWorld</span>
        <span id="iSpan">Node Graph Address: http://10.22.10.1:5173</span>
      </div>
    </div>
  );
}

function HostDash(props) {
  //console.log(props.hostEntries);
  const hostElements = [];
  if (props.hostEntries.length > 0){
    for (let i = 0; i <= props.maxEntries-1; i++){
      if(!props.hostEntries[i]) break;
      hostElements.push(<span id="rssiSpan">{props.hostEntries[i][0]} | {props.hostEntries[i][4]} | {props.hostEntries[i][5]} | {props.hostEntries[i][1]} | {props.hostEntries[i][2]} | {props.hostEntries[i][3]} | {Math.round((Date.now() / 1000) - props.hostEntries[i][6])}s</span>);
    } 
  }
  return (
    <div>
      <img id="idle-gif" src={backGif}/>
      <span id="tSpan">{props.systime}</span>
      <div id="HostInfo">
        <span id="iSpan">Nearest hosts (ID, ALIAS, RSSI, MAC, VENDOR, PC, SSLF):</span>
	{hostElements}
      </div>
      <div id="MenuButtons">
	<button onClick={props.mainMenuFunc}>Main Menu</button>
      </div>
    </div>
  );
}

function APDash(props) {
  //console.log(props.hostEntries);
  const apElements = [];
  if (props.apEntries.length > 0){
    for (let i = 0; i <= props.maxEntries-1; i++){
      if(!props.apEntries[i]) break;
      apElements.push(<span id="rssiSpan">{props.apEntries[i][0]} | {props.apEntries[i][1]} | {props.apEntries[i][5]} | {props.apEntries[i][6]} | {props.apEntries[i][4]} | {props.apEntries[i][7]} | {Math.round((Date.now() / 1000) - props.apEntries[i][8])}s</span>);
    }
  }
  return (
    <div>
      <img id="idle-gif" src={backGif}/>
      <span id="tSpan">{props.systime}</span>
      <div id="HostInfo">
        <span id="iSpan">Nearest access points (ID, SSID, RSSI, BSSID, VENDOR, HOSTS, SSLF):</span>
	{apElements}
      </div>
      <div id="MenuButtons">
	<button onClick={props.mainMenuFunc}>Main Menu</button>
      </div>
    </div>
  );
}

function BTDash(props) {
  //console.log(props.hostEntries);
  const btElements = [];
  if (props.btEntries.length > 0){
    for (let i = 0; i <= props.maxEntries-1; i++){
      if(!props.btEntries[i]) break;
      btElements.push(<span id="rssiSpan">{props.btEntries[i][0]} | {props.btEntries[i][4]} | {props.btEntries[i][1]} | {props.btEntries[i][2]} | {props.btEntries[i][7]} | {props.btEntries[i][3]} | {Math.round((Date.now() / 1000) - props.btEntries[i][5])}s</span>);
    } 
  }
  return (
    <div>
      <img id="idle-gif" src={backGif}/>
      <span id="tSpan">{props.systime}</span>
      <div id="HostInfo">
        <span id="iSpan">Nearest Bluetooth devices (ID, RSSI, MAC, COMPANY, VENDOR, LOCALNAME, SSLF):</span>
	{btElements}
      </div>
      <div id="MenuButtons">
	<button onClick={props.mainMenuFunc}>Main Menu</button>
      </div>
    </div>
  );
}

export default function App() {
  const [menu, setMenuState] = useState(0);
  const [conn, setConn] = useState("disconnected");
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [response, setResponse] = useState("1");
  const [scanState, setScanState] = useState(false);
  const [btScanState, setBTScanState] = useState(false);
  const [beaconState, setBeaconState] = useState(false);
  //const [maxDisplays, setMaxDisplay] = useRef(3);
  // References
  const maxDisplays = useRef(3);
  const controlPanelSock = useRef(null);
  const hostArray = useRef([]);
  const apArray = useRef([]);
  const btArray = useRef([]);
  const hostCount = useRef(0);
  const apCount = useRef(0);
  const btCount = useRef(0);
  const menuRef = useRef(0);
  const clearAllRef = useRef(0); // For clearing entire db
  // Dictionary reference for easily settings values for modules!!
  const clearWifiRef = useRef(0); // For clearing wifi entries in db
  const clearBTRef = useRef(0); // For clearing bluetooth entires db
  const portRef = useRef(0); // For db export. Not finished
  // Dictionary reference for easily settings values for modules!!
  const modulesRef = {
	SCAN: [scanState, setScanState],
	BLUETOOTH: [btScanState, setBTScanState],
	BEACON: [beaconState, setBeaconState] 
  };
  const menuArray = [];
  useEffect(() => {
    async function fetchInfo(){
        try{
	    const res = await fetch(backEndAddr);
	    if (!res.ok) throw new Error('Failed to fetch');
	    const json = await res.json();
	    // Clear arrays
	    hostArray.current = [];
	    apArray.current = [];
	    btArray.current = [];
	    let iter = 0;
	    // For this part, remember that epoch time in Python is in seconds while epoch time in JS is in miliseconds
	    hostCount.current = json.HOSTS.length;
	    apCount.current = json.APS.length;
	    btCount.current = json.BTS.length;
	    json.HOSTS.forEach(HOST => { 
		// If host is not the PI and time since last probe is less than 30 seconds
	        if (iter == maxDisplays.current || HOST[1] == "2c:cf:67:ad:71:96" || ((Date.now() / 1000) - HOST[6]) > 120) return;
		hostArray.current[iter] = HOST;
		iter++;
	    });
	    iter = 0;
	    json.APS.forEach(AP => { 
		// If AP is not the PI and time since last beacon is less than 20 seconds
	        if (iter == maxDisplays.current || AP[6] == "2c:cf:67:ad:71:96" || ((Date.now() / 1000) - AP[8]) > 20) return;
		apArray.current[iter] = AP;
		iter++;
	    });
	    iter = 0;
	    json.BTS.forEach(BT => { 
	        if (iter == maxDisplays.current || ((Date.now() / 1000) - BT[5]) > 30) return;
		btArray.current[iter] = BT;
		iter++;
	    });
        } catch (err) {
            console.log(`Couldn't fetch database information: ${err.message}`); 
	}
    }
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
      fetchInfo();
    }, 1500);
    return () => clearInterval(timer);
  }, [menu]); // Menu added as a dependency for every time the user changes menu so it doesn't interfere with the timer.
  const connect = useCallback(() => {
      if(controlPanelSock.current){
          controlPanelSock.current.close();
	  controlPanelSock.current = null;
      }
      setConn("connecting");
      const sock = new WebSocket(controlPanelAddr);
      sock.binaryType = "arraybuffer";
      controlPanelSock.current = sock;
      sock.onopen = () =>  {setConn("connected")}
      sock.onmessage = (evt) => {
          try{
	      //alert("Received message from control panel!");
	      let jsonResp = JSON.parse(evt.data);
	      //alert(`Received message: ${jsonResp}`);
	      if(Object.values(jsonResp)[0] == "0"){ 
	          modulesRef[Object.keys(jsonResp)[0]][1](prev => !prev); 
	      }
          } catch(err) {console.log(`Couldn't parse JSON data: ${err.message}`);}
          sock.onerror = () => {setConn("error"); alert("Could not connect to control panel!")};
          sock.onclose = () => {
	      setConn("disconnected");
	      controlPanelSock.current = null;
          }
      }
  }, [controlPanelSock]);
  const disconnect = useCallback(() => {
      controlPanelSock.current?.close();
      controlPanelSock.current = null;
      setConn("disconnected");
  }, []);
  const toggleModule = (module) => {
      controlPanelSock.current?.send(JSON.stringify({MODULE: module}))
  }
  const exportCmdGen = () => { // Idk if I'm ever gonna finish this lol
      portRef.current = Math.floor(Math.random() * (10000-5000 + 1)) + 5000;
      return `nc -lvnp ${portRef.current} > <filename>.sql`
  }
  const exportDB = () => {
      controlPanelSock.current?.send(JSON.stringify({EXPORT: portRef.current}));
  }
  const clearDatabase = async (num) => {
	let param = "";
	switch(num){
	    case 0:
		param = "all";
	    	break;
	    case 1:
		param = "wifi";
	    	break;
	    case 2:
		param = "bt";
	    	break;
	}
        try{
	    const res = await fetch(`/api/clear?param=${param}`);
	    if (!res.ok) throw new Error('Failed to clear');
        } catch (err) {
            console.log(`Couldn't clear database: ${err.message}`); 
	}
  }
  const resetClearRefs = () => {
	clearAllRef.current=0; 
	clearWifiRef.current=0;
	clearBTRef.current=0;
  }
  const setMenu = (num) => {
	setMenuState(num);
	menuRef.current = num;
  }
  menuArray.push(
	  <MainMenu 
		systime={time} 
		apFunc={() => {maxDisplays.current = 12; setMenu(2)}}
		hostFunc={() => {maxDisplays.current = 12; setMenu(3)}}
		btFunc={() => {maxDisplays.current = 12; setMenu(7)}}
		dashFunc={() => {maxDisplays.current = 2; setMenu(1)}} 
		dbFunc={() => {setMenu(5)}}
		ctrlFunc={() => {setMenu(4)}}
	  />
  );
  menuArray.push(
	  <MainDash 
	  	systime={time} 
		hostEntries={hostArray.current} 
		apEntries={apArray.current} 
		btEntries={btArray.current}
		mainMenuFunc={() => {setMenu(0)}} 
		maxEntries={maxDisplays.current}
		beaconMesg={modulesRef["BEACON"][0] ? "ON" : "OFF"}
		scanMesg={modulesRef["SCAN"][0] ? "ON" : "OFF"}
		btScanMesg={modulesRef["BLUETOOTH"][0] ? "ON" : "OFF"}
	  />
  );
  menuArray.push(
	  <APDash 
	  	systime={time} 
		apEntries={apArray.current} 
		mainMenuFunc={() => {setMenu(0)}} 
		maxEntries={maxDisplays.current}
	  />
  );
  menuArray.push(
	  <HostDash 
	  	systime={time} 
		hostEntries={hostArray.current} 
		mainMenuFunc={() => {setMenu(0)}} 
		maxEntries={maxDisplays.current}
	  />
  );
  menuArray.push(
	  <CTRLMenu 
		systime={time} 
		beaconFunc={() => {toggleModule("BEACON")}}  
		beaconMesg={modulesRef["BEACON"][0] ? "Turn Off Hotspot" : "Turn On Hotspot"}
		scanFunc={() => {toggleModule("SCAN")}}  
		scannerMesg={modulesRef["SCAN"][0] ? "Turn Off Scanner" : "Turn On Scanner"}
		btScanFunc={() => {toggleModule("BLUETOOTH")}}  
		btScannerMesg={modulesRef["BLUETOOTH"][0] ? "Turn Off BT Scanner" : "Turn On BT Scanner"}
		ctrlFunc={conn==="connected" ? disconnect : connect} 
		controlPanelMesg={conn==="connected" ? "Disconnect From Control Panel" : "Connect To Control Panel"}
    		killFunc={() => {toggleModule("KILL")}}
		mainFunc={() => {setMenu(0)}}
	  />
  );
  menuArray.push(
	  <DBMenu 
		systime={time} 
		hostCount={hostCount.current}
		apCount={apCount.current}
		btCount={btCount.current}
		exportdb={() => {setMenu(6); resetClearRefs();}}
		clearAll={() => {	
		  if (clearAllRef.current==0){
		      clearAllRef.current=1;
	  	  }
		  else if (clearAllRef.current==1){
		      clearDatabase(0);
		      resetClearRefs();
		  }
		}}  
		clearAllMesg={clearAllRef.current==1 ? "Are you sure?" : "Clear All"} 
		clearWifi={() => {	
		  if (clearWifiRef.current==0){
		      clearWifiRef.current=1;
	  	  }
		  else if (clearWifiRef.current==1){
		      clearDatabase(1);
		      resetClearRefs();
		  }
		}}  
		clearWifiMesg={clearWifiRef.current==1 ? "Are you sure?" : "Clear Wifi Entries"} 
		clearBT={() => {	
		  if (clearBTRef.current==0){
		      clearBTRef.current=1;
	  	  }
		  else if (clearBTRef.current==1){
		      clearDatabase(2);
		      resetClearRefs();
		  }
		}}  
		clearBTMesg={clearBTRef.current==1 ? "Are you sure?" : "Clear Bluetooth Entries"} 
		mainFunc={() => {setMenu(0); resetClearRefs();}}
	  />
  );
  menuArray.push(
	  <ExportMenu 
		systime={time} 
		execCmd={`${exportCmdGen()}`}
		exportdb={exportDB}
		dbFunc={() => {setMenu(5)}}
		mainFunc={() => {setMenu(0)}}
	  />
  );
  menuArray.push( // Menu 7
	  <BTDash 
	  	systime={time} 
		btEntries={btArray.current} 
		mainMenuFunc={() => {setMenu(0)}} 
		maxEntries={maxDisplays.current}
	  />
  );
  return (
    <Router>
      <Routes>
        <Route path="/" element={menuArray[menuRef.current]} />
      </Routes>
    </Router>
  );
}
