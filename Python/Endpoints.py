from flask import Flask, jsonify, request
from flask_cors import CORS
import mariadb
import time
import json
import os
app = Flask(__name__)
vendorJSON = None
CORS(app)
dbConf = {
    "host": "127.0.0.1",
    "port": 3306,
    "user": "root",
    "password": "skap",
    "database": "Scanned"
}
projPath = "/home/hope/Skipskap"
# ** -> host="127.0.0.1", port="1919"
def dbConn():
    return mariadb.connect(**dbConf)

def resolveVendor(macAddr):
    vendor = "No vendor found"
    match = [entry["vendorName"] for entry in vendorJSON if entry.get("macPrefix").lower()==macAddr[:8].lower()]
    if match:
        vendor = match[0]
    
    return vendor

@app.route("/")
def home():
    return "Are you lost?"

@app.route("/api/update", methods=["POST"])
def updateEntry():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing info"}), 400
    
    try:
        # Not the best code, but gets the job done.
        conn = dbConn()
        queries = conn.cursor()
        APID = None # Have to declare APID in this scope because if theres a probe, I have to increment AP count. Theres probably a better way to do this tho.
        if "AP" in data:
            # Search for access points
            queries.execute("SELECT * FROM APS WHERE SSID = ?", (data["AP"]["SSID"],))
            AP = queries.fetchall()
            if "BSSID" in data["AP"]: # If beacon frame
                vendor = resolveVendor(data["AP"]["BSSID"])
                if AP: # Update BSSID for AP entries that may not have one yet. Also updates RSSI
                    # Theres a slight problem when working with hidden networks. 
                    # There may be several access points that are hidden, which means several BSSIDs will resolve to one "--hidden--" this is not good.
                    queries.execute("UPDATE APS SET BSSID = ?, RSSI = ?, VENDOR = ?, TIMESTAMP = ? WHERE SSID = ?", (data["AP"]["BSSID"], data["AP"]["RSSI"], vendor, time.time(), data["AP"]["SSID"]))
                else:
                    queries.execute("INSERT INTO APS (BSSID, SSID, RSSI, VENDOR, COMMENT, COUNT, HOSTS, TIMESTAMP, FIRSTSIG) VALUES (?, ?, ?, ?, 'NONE', 0, 0, ?, ?)", (data["AP"]["BSSID"], data["AP"]["SSID"], data["AP"]["RSSI"], vendor, time.time(), time.time()))
            else: # If this is an AP discovered via probe frame instead of beacon
                if not AP: 
                    queries.execute("INSERT INTO APS (SSID, COMMENT, COUNT, HOSTS, TIMESTAMP, FIRSTSIG) VALUES (?, 'NONE', 0, 0, ?, ?)", (data["AP"]["SSID"], time.time(), time.time()))
                
            queries.execute("SELECT ID FROM APS WHERE SSID = ?", (data["AP"]["SSID"],))
            APID = int(queries.fetchone()[0])
        if "HOST" in data: # If probe frame
            vendor = resolveVendor(data["HOST"]["MAC"])
            # Search for hosts
            queries.execute("SELECT * FROM HOSTS WHERE MAC = ?", (data["HOST"]["MAC"],))
            HOST = queries.fetchall()
            if not HOST:
                queries.execute("INSERT INTO HOSTS (MAC, VENDOR, RSSI, ALIAS, COUNT, TIMESTAMP, FIRSTSIG) VALUES (?, ?, ?, 'NONE', 1, ?, ?)", (data["HOST"]["MAC"], vendor, data["HOST"]["RSSI"], time.time(), time.time()))

            queries.execute("SELECT ID FROM HOSTS WHERE MAC = ?", (data["HOST"]["MAC"],))
            HID = int(queries.fetchone()[0])
            # Search for links
            queries.execute("SELECT * FROM LINKS WHERE APID = ? AND HID = ?", (APID, HID))
            LINKS = queries.fetchall()
            if not LINKS:
                queries.execute("INSERT INTO LINKS (APID, HID, COUNT, TIMESTAMP) VALUES (?, ?, 0, ?)", (APID, HID, time.time()))
                queries.execute("UPDATE APS SET HOSTS = HOSTS + 1 WHERE ID = ?", (APID,))
  
            queries.execute("SELECT ID FROM LINKS WHERE APID = ? AND HID = ?", (APID,HID))
            LINKID = int(queries.fetchone()[0])
            # Update counters
            queries.execute("UPDATE APS SET COUNT = COUNT + 1 WHERE ID = ?", (APID,))
            queries.execute("UPDATE HOSTS SET COUNT = COUNT + 1 WHERE ID = ?", (HID,))
            queries.execute("UPDATE HOSTS SET RSSI = ? WHERE ID = ?", (data["HOST"]["RSSI"], HID))
            queries.execute("UPDATE HOSTS SET TIMESTAMP = ? WHERE ID = ?", (time.time(), HID))
            queries.execute("UPDATE LINKS SET COUNT = COUNT + 1 WHERE ID = ?", (LINKID,))
            queries.execute("UPDATE LINKS SET TIMESTAMP = ? WHERE ID = ?", (time.time(), LINKID))
        if "BT" in data:
            # ID, MAC, COMPANY, LOCALNAME, RSSI, TIMESTAMP, FIRSTSIG, VENDOR 
            vendor = resolveVendor(data["BT"]["addr"])
            queries.execute("SELECT * FROM BTS WHERE MAC = ?", (data["BT"]["addr"],))
            BT = queries.fetchall()
            if not BT:
                companyIdent = "company_identifier" in data["BT"] and data["BT"]["company_identifier"] or "No CID"
                localName = "local_name" in data["BT"] and data["BT"]["local_name"] or "No Local Name"
                queries.execute("INSERT INTO BTS (MAC, COMPANY, LOCALNAME, RSSI, TIMESTAMP, FIRSTSIG, VENDOR) VALUES (?, ?, ?, ?, ?, ?, ?)", (data["BT"]["addr"], companyIdent, localName, data["BT"]["rssi"], time.time(), time.time(), vendor))

            queries.execute("SELECT ID FROM BTS WHERE MAC = ?", (data["BT"]["addr"],))
            BID = int(queries.fetchone()[0])
            queries.execute("UPDATE BTS SET RSSI = ? WHERE ID = ?", (data["BT"]["rssi"], BID))
            queries.execute("UPDATE BTS SET TIMESTAMP = ? WHERE ID = ?", (time.time(), BID))

        conn.commit()
        queries.close()
        conn.close()
        return jsonify({"success":"Database updated"}), 200
    except mariadb.Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

@app.route("/api/fetch", methods=["GET"])
def fetchall():
    arg = request.args.get("param", default="all")
    try:
        fullData = {}
        conn = dbConn()
        queries = conn.cursor()
        match arg:
            case "all":
                # Search for bluetooth
                queries.execute("SELECT * FROM BTS ORDER BY RSSI DESC")
                fullData["BTS"]=queries.fetchall()
                # Search for access points
                queries.execute("SELECT * FROM APS ORDER BY RSSI DESC")
                fullData["APS"]=queries.fetchall()
                # Search for hosts
                queries.execute("SELECT * FROM HOSTS ORDER BY RSSI DESC")
                fullData["HOSTS"]=queries.fetchall()
                # Search for links
                queries.execute("SELECT * FROM LINKS")
                fullData["LINKS"]=queries.fetchall()
            case "closest": 
                # Search for bluetooth w/ strongest signal
                queries.execute("SELECT * FROM BTS ORDER BY RSSI DESC")
                fullData["BTS"]=queries.fetchall()
                # Search for hosts w/ strongest signal
                queries.execute("SELECT * FROM HOSTS ORDER BY RSSI DESC")         
                fullData["HOSTS"]=queries.fetchall()
                # Search for APs w/ strongest signal
                queries.execute("SELECT * FROM APS ORDER BY RSSI DESC")         
                fullData["APS"]=queries.fetchall()
            case "recent": 
                # Search for bluetooth w/ latest timestamp 
                queries.execute("SELECT * FROM BTS ORDER BY TIMESTAMP DESC")
                fullData["BTS"]=queries.fetchall()
                # Search for hosts w/ latest timestamp 
                queries.execute("SELECT * FROM HOSTS ORDER BY TIMESTAMP DESC")         
                fullData["HOSTS"]=queries.fetchall()
                # Search for APs w/ latest timestamp
                queries.execute("SELECT * FROM APS ORDER BY TIMESTAMP DESC")         
                fullData["APS"]=queries.fetchall()
                # Search for LINKS w/ latest timestamp
                queries.execute("SELECT * FROM LINKS ORDER BY TIMESTAMP DESC")         
                fullData["LINKS"]=queries.fetchall()
            
        queries.close()
        conn.close()
        return jsonify(fullData), 200 
    except mariadb.Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

@app.route("/api/clear", methods=["GET"])
def clearDB():
    arg = request.args.get("param", default="all")
    try:
        fullData = {}
        conn = dbConn()
        queries = conn.cursor()
        match arg:
            case "all":
                queries.execute("TRUNCATE TABLE APS")
                queries.execute("TRUNCATE TABLE BTS")
                queries.execute("TRUNCATE TABLE HOSTS")
                queries.execute("TRUNCATE TABLE LINKS")
            case "wifi":
                queries.execute("TRUNCATE TABLE APS")
                queries.execute("TRUNCATE TABLE HOSTS")
                queries.execute("TRUNCATE TABLE LINKS")
            case "bt":
                queries.execute("TRUNCATE TABLE BTS")
                
        queries.close()
        conn.close()
        return jsonify(fullData), 200 
    except mariadb.Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

def initJSON():
    global vendorJSON
    with open(f"{projPath}/Python/macDB.json", "r", encoding="utf-8") as jsonFile:
        vendorJSON = json.load(jsonFile)

if __name__ == "__main__":
    initJSON()
    app.run(debug=True)
