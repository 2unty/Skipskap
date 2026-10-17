from scapy.all import sniff, Dot11, Dot11Elt, Dot11EltRSN, RadioTap
import subprocess
import threading
import requests
import time
import json
interface = "wlan1"
apDictionary = {}
hostDictionary = {}
endpoint = "http://0.0.0.0:5000/api/update"
def hopChan():
    i = 0
    while True:
        try:
            #print(f"Channel no {(i%11)+1} on interface {interface}")
            subprocess.run(["iw", "dev", interface, "set", "channel", str((i%11)+1)], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            time.sleep(0.5)
            i+=1
        except subprocess.CalledProcessError:
            print(f"Channel switch to {(i%11)+1} failed")
        except KeyboardInterrupt:
            return


def handleProbe(packet):
    try:
        if packet.haslayer(Dot11) and packet.type == 0 and (packet.subtype == 4 or packet.subtype == 8):
            rssi = 0
            payload = None
            ssid = "--Hidden--"
            addr = packet.addr2 # Either BSSID or host MAC
            if packet.haslayer(RadioTap):
                 rssi = packet.getlayer(RadioTap).dBm_AntSignal

            if packet.haslayer(Dot11Elt):
                info_layer = packet[Dot11Elt]
                if info_layer.ID == 0 and info_layer.info:
                    ssid = info_layer.info.decode('utf-8', errors='ignore')

            if packet.subtype == 4: # Probe request frame
                payload = {
                    "AP": {
                        "SSID": ssid
                    },
                    "HOST": {
                        "MAC": addr, # Transmitter address (client device)
                        "RSSI": rssi,
                    }
                }

            elif packet.subtype == 8: # Beacon frame
                payload = {
                    "AP": {
                        "BSSID": addr, # Transmitter address (AP)
                        "SSID": ssid,
                        "RSSI": rssi,
                    },
                }

            resp = requests.post(endpoint,json=payload)
            #print(f"[+] Device {clientAddr} (cendor: {vendor}) searched for SSID: {ssid}")
            print(payload)
            print(f"Returned: {resp}")

    except Exception as e:
        print(f"Error: {e}")

def main():
    hopperThread = threading.Thread(target=hopChan)
    hopperThread.daemon = True
    hopperThread.start()
    print("Listening for Wi-Fi Probe Requests... Press Ctrl+C to stop.")
    sniff(iface=interface, prn=handleProbe, store=0)

if __name__ == "__main__":
    main()
