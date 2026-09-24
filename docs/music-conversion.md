# LilyPond and MIDI to Strudel

`lilypond-to-strudel` converts `.ly` files (or LilyPond source pasted as `.txt`)
through MIDI performance events. LilyPond parses its own notation and resolves
pitches, accidentals, tuplets, repeats, and note lengths. The converter then
maps those MIDI events to Strudel timing and pitches. Pass `--articulate` when
the score uses grace notes, ornaments, or phrasing that LilyPond's optional
`articulate.ly` pass can render to MIDI.

## Use

```bash
python3 scripts/lilypond_to_strudel.py score.ly --articulate -o score.strudel.js
python3 scripts/lilypond_to_strudel.py score.mid -o score.strudel.js
```

LilyPond must be installed and available as `lilypond` on `PATH`. If it is in a
different location, pass `--lilypond /path/to/lilypond`. LilyPond source files
are copied to a temporary directory; the converter adds an empty `\midi { }`
block to each ordinary `\score { ... }` block that does not already have one.
The source file is left untouched. One MIDI output per source file is supported.

Options:

- `--bpm 72` sets a fixed quarter-note tempo for the generated Script. Without
  it, the MIDI file's first tempo is used.
- `--articulate` asks LilyPond to apply its `articulate.ly` script before MIDI
  export. Use it for grace notes, ornaments, and phrasing; it can change note
  lengths according to LilyPond's articulation rules.
- `--sound piano` chooses the Strudel sound name. The default is `piano`.
- `-o FILE` writes a standalone Script; without it, the Script goes to stdout.

The generated Script sets the tempo and stacks one or more note patterns. If a
MIDI part has overlapping notes, the converter splits it into non-overlapping
voices. Pitches are written as MIDI note numbers, so enharmonic spelling does
not change the sound. Chords with the same start, end, and velocity are kept as
chords. MIDI tempo changes are rendered as timing changes while the output
keeps the first tempo as its global tempo. Sustain pedal, note lengths, and
note velocities are included.

## What the MIDI path preserves

The converter preserves information present in MIDI: note pitches and timing,
simultaneous notes, MIDI velocity, tempo events, and sustain pedal (CC 64).
The selected Strudel sound is used for every part; MIDI instrument programs,
other controller messages, pitch bends, and channel pressure are not mapped.
Velocity is represented as a linear Strudel gain, so timbral velocity layers
of a particular piano sample may sound different from the source.

LilyPond itself does not write every notational mark into MIDI. Its documented
limitations include fermatas, glissandi, microtonal chords, swing entered only
as an annotation, tempo marks entered only as annotations, tremolos entered
with `:`, and articulations outside its supported set. Grace notes and
ornaments may need `--articulate`. Those cases require a later converter
extension or manual correction. See the [LilyPond MIDI reference](https://lilypond.org/doc/v2.24/Documentation/notation/the-midi-block),
its [unsupported MIDI notation list](https://lilypond.org/doc/v2.24/Documentation/notation/unsupported-notation-for-midi),
and its documentation for [supported MIDI notation](https://lilypond.org/doc/v2.24/Documentation/notation/supported-notation-for-midi).

LilyPond source can contain executable Scheme expressions. Only compile `.ly`
files from sources you trust.

## Improving the converter

The package API is shared by its CLI and any service integration:

- `parse_midi(data)` reads Standard MIDI files.
- `convert_midi(data, ...)` renders the MIDI events as Strudel.
- `convert_file(path, ...)` accepts LilyPond or MIDI files.
- `convert_lilypond_text(text, ...)` accepts an in-memory upload and returns a
  `ConversionResult` with the Script and JSON-friendly metadata.
- `compile_lilypond(path, ...)` asks LilyPond for MIDI without modifying the
  source file.

When improving the converter, add a small MIDI fixture for the behavior being
changed and compare its expected Strudel timing, note numbers, and voice layout.
This keeps future changes focused on a specific, reproducible conversion case.
