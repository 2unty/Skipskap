from websockets.exceptions import ConnectionClosed
from websockets.server import serve
import multiprocessing
import subprocess
import asyncio 
import logging
import signal
import json
import time
import sys
import os
logging.basicConfig(level=logging.INFO)

# Get user home directory through environment variable
#homeDir = os.getenv("HOME")
homeDir = "/home/hope"

# Paths
monitorInit = f"{homeDir}/Skipskap/Shell/MonitorInit.sh"
btInit = f"{homeDir}/Skipskap/Shell/BTInit.sh"
nodeInit = f"{homeDir}/Skipskap/Shell/NodeInit.sh"
offIface = f"{homeDir}/Skipskap/Shell/OffIface.sh"
killAll = f"{homeDir}/Skipskap/Shell/KillProcs.sh"

operating = True

def initModule(module): 
    try:
        moduleDictionary[module][0] = subprocess.Popen([moduleDictionary[module][1]], preexec_fn=os.setsid)
    except subprocess.CalledProcessError as e:
        logging.info(f"{moduleDictionary[module][3]} {e}")
        return "1"
 
    return "0"
    
def killProcs():
    try:
        subprocess.run([killAll])
    except subprocess.CalledProcessError as e:
        logging.info(f"Couldn't kill all procs: {e}")
        return "1"

    return "0"

def turnOffIface():
    try:
        subprocess.run([offIface])
    except subprocess.CalledProcessError as e:
        logging.info(f"Couldn't turn off interface: {e}")
        return "1"

    return "0"

def turnOffHotspot():
    try:
        subprocess.run(["nmcli", "con", "down", "NHotspot"])
    except subprocess.CalledProcessError as e:
        logging.info(f"Couldn't turn hotspot off: {e}")
        return "1"

    return "0"

def btStopped():
    return "0"

interfaceCooldown = False
moduleDictionary = { # Live process, init script, turn off function, error string
    "SCAN" : [None, monitorInit, turnOffIface, "Couldn't initiate scan script: "],
    "BEACON" : [None, nodeInit, turnOffHotspot, "Couldn't initiate beacon: "],
    "BLUETOOTH" : [None, btInit, btStopped, "Couldn't initiate bluetooth scanner: "]
}

async def listener(websocket):
    global interfaceCooldown
    # TODO: ADD INIT DATA FOR WHEN FRONT END CONNECTS TO THIS
    initData = {
            "SCANNING": moduleDictionary["SCAN"][1] and "1" or "0", 
            "BEACONING": moduleDictionary["BEACON"][1] and "1" or "0",
            "BLUETOOTHING": moduleDictionary["BLUETOOTH"][1] and "1" or "0"
    }
    try:
        async for data in websocket:
            logging.info(f"Recieved {data}")
            jsonData = json.loads(data)
            module = jsonData["MODULE"]   
            ret = "1"
            if module == "KILL":
                killProcs()
                return

            if not interfaceCooldown: # If no cooldown
                interfaceCooldown = True
                if moduleDictionary[module][0] is None: # If no daemon process
                    ret = initModule(module)
                else:
                    os.killpg(os.getpgid(moduleDictionary[module][0].pid), signal.SIGKILL)
                    moduleDictionary[module][0] = None
                    ret = moduleDictionary[module][2]()
                
                await asyncio.sleep(4)
                interfaceCooldown = False 

            payload = json.dumps({module : ret})
            logging.info(f"Returning {payload}")
            await websocket.send(payload)


    except ConnectionClosed:
        return

async def handle(websocket):
    logging.info("Front end connected")
    await asyncio.gather(
        listener(websocket),
    )

async def main():
    async with serve(handle, "127.0.0.1", 5829):
        logging.info("Control panel: ws://localhost:5829")
        await asyncio.Future()
                             
if __name__ == "__main__":
    asyncio.run(main())   
