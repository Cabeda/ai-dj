// ai-dj now-playing helper (macOS).
//
// Registers ai-dj with the system Now Playing centre so a set shows up in
// Control Center, on the media keys and on the Touch Bar — and so play, pause,
// next and previous come back to us. MediaPlayer's public API needs an app run
// loop, which is why this is a separate process driven over stdio:
//
//   stdin :  title=<t>   artist=<a>   album=<b>   state=playing|paused   clear
//   stdout:  play | pause | toggle | next | previous      (one per line)
//
// `state` also drives the widget's play/pause button. The volume slider the
// system shows controls the machine's output, which is already ours — nothing
// to do here.

import AppKit
import MediaPlayer

let commandCenter = MPRemoteCommandCenter.shared()
let nowPlaying = MPNowPlayingInfoCenter.default()

func emit(_ line: String) {
    FileHandle.standardOutput.write((line + "\n").data(using: .utf8)!)
}

func handle(_ command: MPRemoteCommand, as name: String) {
    command.isEnabled = true
    command.addTarget { _ in
        emit(name)
        return .success
    }
}

// A fresh process must clear stale handlers from any previous run.
for command in [commandCenter.playCommand, commandCenter.pauseCommand,
                commandCenter.togglePlayPauseCommand,
                commandCenter.nextTrackCommand, commandCenter.previousTrackCommand] {
    command.removeTarget(nil)
}
handle(commandCenter.playCommand, as: "play")
handle(commandCenter.pauseCommand, as: "pause")
handle(commandCenter.togglePlayPauseCommand, as: "toggle")
handle(commandCenter.nextTrackCommand, as: "next")
handle(commandCenter.previousTrackCommand, as: "previous")

var info: [String: Any] = [
    MPMediaItemPropertyTitle: "ai-dj",
    MPMediaItemPropertyArtist: "generative radio",
    MPNowPlayingInfoPropertyPlaybackRate: 1.0,
]
var playing = true

func publish() {
    info[MPNowPlayingInfoPropertyPlaybackRate] = playing ? 1.0 : 0.0
    nowPlaying.nowPlayingInfo = info
    if #available(macOS 10.12.2, *) {
        nowPlaying.playbackState = playing ? .playing : .paused
    }
}

// stdin is read off the main thread; the run loop owns that one.
DispatchQueue.global(qos: .utility).async {
    while let raw = readLine(strippingNewline: true) {
        let line = raw.trimmingCharacters(in: .whitespaces)
        guard !line.isEmpty else { continue }
        let parts = line.split(separator: "=", maxSplits: 1).map(String.init)
        guard parts.count == 2 else { continue }
        let value = parts[1]
        switch parts[0] {
        case "title":  info[MPMediaItemPropertyTitle] = value
        case "artist": info[MPMediaItemPropertyArtist] = value
        case "album":  info[MPMediaItemPropertyAlbumTitle] = value
        case "state":  playing = (value == "playing")
        case "clear":
            nowPlaying.nowPlayingInfo = nil
            exit(0)
        default: continue
        }
        publish()
    }
    // the parent closed stdin: we are done
    exit(0)
}

let app = NSApplication.shared
// no dock icon, no menu — just the media integration
app.setActivationPolicy(.prohibited)
publish()
app.run()
