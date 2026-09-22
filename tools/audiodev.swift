import CoreAudio
import Foundation

func propString(_ id: AudioDeviceID, _ sel: AudioObjectPropertySelector, _ scope: AudioObjectPropertyScope = kAudioObjectPropertyScopeGlobal) -> String {
    var a = AudioObjectPropertyAddress(mSelector: sel, mScope: scope, mElement: kAudioObjectPropertyElementMain)
    var cf: Unmanaged<CFString>?
    var sz = UInt32(MemoryLayout<Unmanaged<CFString>?>.size)
    let s = AudioObjectGetPropertyData(id, &a, 0, nil, &sz, &cf)
    guard s == noErr, let v = cf?.takeRetainedValue() else { return "" }
    return v as String
}

func propUInt32(_ id: AudioDeviceID, _ sel: AudioObjectPropertySelector) -> UInt32 {
    var a = AudioObjectPropertyAddress(mSelector: sel, mScope: kAudioObjectPropertyScopeGlobal, mElement: kAudioObjectPropertyElementMain)
    var v: UInt32 = 0
    var sz = UInt32(MemoryLayout<UInt32>.size)
    AudioObjectGetPropertyData(id, &a, 0, nil, &sz, &v)
    return v
}

func hasOutputStreams(_ id: AudioDeviceID) -> Bool {
    var a = AudioObjectPropertyAddress(mSelector: kAudioDevicePropertyStreams, mScope: kAudioDevicePropertyScopeOutput, mElement: kAudioObjectPropertyElementMain)
    var sz = UInt32(0)
    guard AudioObjectGetPropertyDataSize(id, &a, 0, nil, &sz) == noErr else { return false }
    return sz > 0
}

func outputDevices() -> [(id: AudioDeviceID, name: String, uid: String, transport: UInt32, isDefault: Bool)] {
    var addr = AudioObjectPropertyAddress(mSelector: kAudioHardwarePropertyDevices, mScope: kAudioObjectPropertyScopeGlobal, mElement: kAudioObjectPropertyElementMain)
    var sz = UInt32(0)
    AudioObjectGetPropertyDataSize(AudioObjectID(kAudioObjectSystemObject), &addr, 0, nil, &sz)
    let count = Int(sz) / MemoryLayout<AudioDeviceID>.size
    var ids = [AudioDeviceID](repeating: 0, count: count)
    AudioObjectGetPropertyData(AudioObjectID(kAudioObjectSystemObject), &addr, 0, nil, &sz, &ids)

    var defaultID = AudioDeviceID(0)
    var da = AudioObjectPropertyAddress(mSelector: kAudioHardwarePropertyDefaultOutputDevice, mScope: kAudioObjectPropertyScopeGlobal, mElement: kAudioObjectPropertyElementMain)
    var dsz = UInt32(MemoryLayout<AudioDeviceID>.size)
    AudioObjectGetPropertyData(AudioObjectID(kAudioObjectSystemObject), &da, 0, nil, &dsz, &defaultID)

    var out: [(id: AudioDeviceID, name: String, uid: String, transport: UInt32, isDefault: Bool)] = []
    for id in ids where hasOutputStreams(id) {
        out.append((id, propString(id, kAudioObjectPropertyName),
                    propString(id, kAudioDevicePropertyDeviceUID),
                    propUInt32(id, kAudioDevicePropertyTransportType),
                    id == defaultID))
    }
    return out
}

func transportName(_ t: UInt32) -> String {
    switch t {
    case kAudioDeviceTransportTypeBuiltIn: return "builtin"
    case kAudioDeviceTransportTypeBluetooth: return "bluetooth"
    case kAudioDeviceTransportTypeBluetoothLE: return "bluetooth-le"
    case kAudioDeviceTransportTypeDisplayPort: return "displayport"
    case kAudioDeviceTransportTypeVirtual: return "virtual"
    case kAudioDeviceTransportTypeUSB: return "usb"
    case kAudioDeviceTransportTypeAggregate: return "aggregate"
    default: return String(format: "0x%X", t)
    }
}

// Create an aggregate device with the given subdevice UIDs.
func createAggregate(name: String, uid: String, subUIDs: [String]) -> AudioDeviceID? {
    let subDevices: [CFString] = subUIDs as [CFString]
    let dict: [String: Any] = [
        kAudioAggregateDeviceNameKey as String: name,
        kAudioAggregateDeviceUIDKey as String: uid,
        kAudioAggregateDeviceSubDeviceListKey as String: subUIDs,
        kAudioAggregateDeviceIsPrivateKey as String: false,
        kAudioAggregateDeviceIsStackedKey as String: true,
    ]
    var id = AudioDeviceID(0)
    let s = AudioHardwareCreateAggregateDevice(dict as CFDictionary, &id)
    return s == noErr ? id : nil
}

func deleteAggregate(_ id: AudioDeviceID) {
    AudioHardwareDestroyAggregateDevice(id)
}

func multiOutput(name: String, uid: String, subUIDs: [String]) -> AudioDeviceID? {
    // A Multi-Output Device is a stacked aggregate: each sub-device gets the
    // full mix. This is what Audio MIDI Setup's "+ -> Create Multi-Output Device"
    // produces, and it can include Bluetooth sub-devices.
    let dict: [String: Any] = [
        kAudioAggregateDeviceNameKey as String: name,
        kAudioAggregateDeviceUIDKey as String: uid,
        kAudioAggregateDeviceSubDeviceListKey as String: subUIDs,
        kAudioAggregateDeviceIsPrivateKey as String: false,
        kAudioAggregateDeviceIsStackedKey as String: true,
    ]
    var id = AudioDeviceID(0)
    let s = AudioHardwareCreateAggregateDevice(dict as CFDictionary, &id)
    return s == noErr ? id : nil
}

let args = CommandLine.arguments
if args.count > 1 && args[1] == "--list" {
    for d in outputDevices() {
        print("\(d.name)\t\(d.uid)\t\(transportName(d.transport))\t\(d.isDefault ? "DEFAULT" : "")")
    }
    exit(0)
}

if args.count > 1 && args[1] == "--create" {
    // create aggregate from the default output device
    let subs = outputDevices().filter { $0.isDefault }
    guard let d = subs.first else { print("no default device"); exit(1) }
    let aggUID = "ai-dj-aggregate-\(getpid())"
    let aggName = "ai-dj \(d.name)"
    guard let id = createAggregate(name: aggName, uid: aggUID, subUIDs: [d.uid]) else {
        print("create failed"); exit(1)
    }
    print("created\t\(aggName)\t\(propString(id, kAudioDevicePropertyDeviceUID))\t\(id)")
    exit(0)
}

if args.count > 1 && args[1] == "--multi" {
    // create a Multi-Output Device: <active output> + <extra devices>
    guard args.count > 3 else {
        print("usage: audiodev --multi <name> <uid> <subdevice-uid> [<subdevice-uid>...]")
        exit(1)
    }
    let name = args[2]
    let uid = args[3]
    let subs = Array(args[4...])
    guard let id = multiOutput(name: name, uid: uid, subUIDs: subs) else {
        print("create failed"); exit(1)
    }
    print("created\t\(name)\t\(propString(id, kAudioDevicePropertyDeviceUID))\t\(id)")
    exit(0)
}