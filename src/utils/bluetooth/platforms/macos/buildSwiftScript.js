function buildSwiftScript(scanSecs) {
  return `
import Foundation
import CoreBluetooth
 
class Scanner: NSObject, CBCentralManagerDelegate {
    var manager: CBCentralManager!
    var found: [[String: Any]] = []
 
    override init() {
        super.init()
        manager = CBCentralManager(delegate: self, queue: nil)
    }
 
    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        guard central.state == .poweredOn else { print("[]"); exit(1) }
        manager.scanForPeripherals(withServices: nil,
                                   options: [CBCentralManagerScanOptionAllowDuplicatesKey: false])
        Timer.scheduledTimer(withTimeInterval: ${scanSecs}.0, repeats: false) { _ in
            self.manager.stopScan()
            let data = (try? JSONSerialization.data(withJSONObject: self.found)) ?? Data()
            print(String(data: data, encoding: .utf8) ?? "[]")
            exit(0)
        }
    }
 
    func centralManager(_ central: CBCentralManager,
                        didDiscover peripheral: CBPeripheral,
                        advertisementData: [String: Any],
                        rssi RSSI: NSNumber) {
        let uid = peripheral.identifier.uuidString
        guard !found.contains(where: { $0["id"] as? String == uid }) else { return }
        var e: [String: Any] = [
            "id":   uid,
            "name": (advertisementData[CBAdvertisementDataLocalNameKey] as? String)
                    ?? peripheral.name ?? "",
            "rssi": RSSI.intValue
        ]
        if let m = advertisementData[CBAdvertisementDataManufacturerDataKey] as? Data {
            e["manufacturerData"] = m.map { String(format: "%02x", $0) }.joined()
        }
        if let s = advertisementData[CBAdvertisementDataServiceUUIDsKey] as? [CBUUID] {
            e["serviceUuids"] = s.map { $0.uuidString }
        }
        if let tx = advertisementData[CBAdvertisementDataTxPowerLevelKey] as? Int {
            e["txPowerLevel"] = tx
        }
        found.append(e)
    }
}
 
let scanner = Scanner()
RunLoop.main.run()
`;
}

module.exports = buildSwiftScript;
