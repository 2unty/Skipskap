from scapy.all import * 
import subprocess
import requests
import sys
import io
running = False
interface = "wlan1"
apDictionary = {}
hostDictionary = {}
bt = None
endpoint = "http://0.0.0.0:5000/api/update"

def parseResults(result):
    infoDict = {"BT": {}}
    regex = result.splitlines()
    for key in regex:
        stripped = key.strip()
        #stripped = re.split(r'^(?!.*[|]\s*).*', key.strip())
        dictMap = re.split(r'(\w+)\s*=\s*(.+)', stripped)
        if not ("\\" in stripped or "###[" in stripped) and len(dictMap)>1:
            infoDict["BT"][dictMap[1]] = dictMap[2]

    return infoDict

def startScan():
    global running
    while running: 
        try:
            # Lamba function returns true if the bluetooth packet is an advertising report
            advert = bt.sniff(count=1, lfilter=lambda p: HCI_LE_Meta_Advertising_Reports in p)
            report = advert[0][HCI_LE_Meta_Advertising_Reports].reports[0]
            # Have scapy do all the resolving for me, print results to buffer and parse through it
            old = sys.stdout
            sys.stdout = resultBuffer = io.StringIO()
            report.show()
            sys.stdout = old
            result = resultBuffer.getvalue()
            payload = parseResults(result)
            resp = requests.post(endpoint, json=payload) 
            print(payload)
            print(f"Returned: {resp}")
        except KeyboardInterrupt:
            running = False
            bt.sr(HCI_Hdr()/HCI_Command_Hdr()/HCI_Cmd_LE_Set_Scan_Enable(enable=False))
        except Exception as e:
            print(f"Error: {e}")

def init():
    global running
    global bt
    iFaceNumber = 0
    # We have to fetch the bluetooth interface number bc it can boot as hci0 or hci1 or whatever the fuck
    try:
        res = subprocess.run(["hcitool", "dev"], capture_output=True, text=True)
        iFaceNumber = next((char for char in res.stdout if char.isdigit()), None)
    except subprocess.CalledProcessError as e:
        print(f"Subprocess error: {e}")
    
    bt = BluetoothHCISocket(int(iFaceNumber))
    bt.sr(HCI_Hdr()/HCI_Command_Hdr()/HCI_Cmd_LE_Set_Scan_Enable(enable=True))
    running = True
    print("Listening for Bluetooth advertisments... Press Ctrl+C to stop.")
    startScan() 

if __name__ == "__main__":
    init()
