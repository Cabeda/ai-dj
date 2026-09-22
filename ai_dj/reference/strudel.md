# Strudel Reference (for ai-dj)

Strudel is a browser/JS live-coding language (a TidalCycles port). A set is a
single JavaScript **pattern expression**. Music is built from strings of
"mini-notation" passed to functions, then chained with `.method()` calls.

Verified against <https://strudel.cc/> and the AI-optimised reference
`auto-duan/strudel-docs-for-ai` (fetched 2026-06-23).

## How an ai-dj set is shaped

- The whole script is **one expression**. Layer patterns are combined with
  `stack(...)` — they play simultaneously.
- Set tempo once, at the top: `setcpm(<bpm>/4)` (or `setcps(<bpm>/240)`).
- Each **layer** is one self-contained pattern expression, e.g.
  `note("c2 eb2 g2").s("sawtooth").lpf(800)`.
- Do **not** use `$:` labels, `hush()`, or `setcpm` inside a layer — the
  orchestrator owns tempo and re-evaluates the whole set on each change.
- Prefer **double quotes** `"..."` for mini-notation. Single quotes are not
  parsed as patterns.
- Choose timbres only from the instrument palette below.

## Instrument palette

`<name>` → the string to pass to `s(...)`. Pick the canonical name; use its
Strudel id in code.

- **drums**: kick→`bd`, snare→`sd`, hat→`hh`, perc→`perc`
- **bass**: acid_bass→`sawtooth`, sub_bass→`sine`
- **synth**: pad→`sawtooth`, lead→`sawtooth`, arp→`triangle`, drone→`saw`
  (avoid `supersaw`: it needs an AudioWorklet, which the headless host lacks)
- **keys**: piano→`gm_piano`, electric_piano→`gm_electric_piano_1`,
  harpsichord→`gm_harpsichord`, organ→`gm_church_organ`
- **strings**: violin→`gm_violin`, viola→`gm_viola`, cello→`gm_cello`,
  contrabass→`gm_contrabass`, string_ensemble→`gm_string_ensemble_1`,
  tremolo_strings→`gm_tremolo_strings`, pizzicato_strings→`gm_pizzicato_strings`,
  harp→`gm_orchestral_harp`, timpani→`gm_timpani`
- **brass**: trumpet→`gm_trumpet`, trombone→`gm_trombone`,
  french_horn→`gm_french_horn`, tuba→`gm_tuba`, brass_section→`gm_brass_section`
- **woodwind**: flute→`gm_flute`, piccolo→`gm_piccolo`, oboe→`gm_oboe`,
  english_horn→`gm_english_horn`, clarinet→`gm_clarinet`, bassoon→`gm_bassoon`
- **voice**: choir→`gm_choir_aahs`, voice_oohs→`gm_voice_oohs`
- **fx**: noise→`white`

The `gm_*` names are General MIDI soundfonts (sampled). They are the classical
palette. Drum/synth names are built in.

## Mini-notation

| Symbol | Meaning | Example |
|---|---|---|
| space | separate events, split the cycle evenly | `"c e g"` |
| `~` / `-` | rest / silence | `"c ~ e ~"` |
| `[ ]` | sub-sequence in one slot | `"c [e g] c"` |
| `< >` | one event per cycle (alternation) | `"<c e g>"` |
| `*n` | repeat / speed up within the slot | `"c*2"` |
| `/n` | slow: one event over n cycles | `"[c e g d]/2"` |
| `,` | parallel / chord | `"[c,e,g]"` |
| `@n` | elongate: take n shares of time | `"c@3 e"` |
| `!n` | replicate as equal-length events | `"c!3 e"` |
| `?` / `?p` | degrade: drop ~50% (or p) of events | `"c*8?"` |
| `\|` | random choice per cycle | `"[c\|e\|g]"` |
| `(p,s,o?)` | Euclidean: pulses, steps, offset | `"bd(3,8)"` |
| `:n` | sample index in a bank (0-based, wraps) | `"bd:3 hh:1"` |

## Core creation

| Function | Purpose | Example |
|---|---|---|
| `s(name)` / `sound` | play a named sample/synth | `s("bd sd hh")` |
| `note(x)` | absolute pitch (names or numbers) | `note("c e g")` |
| `n(x)` | sample variant index, or scale degree with `.scale()` | `n("0 2 4").scale("C:major")` |
| `stack(...)` | layer patterns simultaneously | `stack(drums, bass)` |
| `cat(...)` | sequence: one full cycle each | `cat("c","e","g")` |
| `seq(...)` | sequence: all within one cycle | `seq("c","e","g")` |
| `arrange([n,pat],...)` | song arrangement (n cycles each) | `arrange([2,a],[2,b])` |

Mini-notation equivalents: `stack` == `"a,b"`; `seq` == `"a b"`; `cat` == `"<a b>"`.

## Transforms

| Function | Purpose |
|---|---|
| `fast(n)` / `slow(n)` | speed up / stretch the whole pattern |
| `rev()` | reverse each cycle |
| `jux(fn)` | apply fn to the right channel only |
| `every(n, fn)` | apply fn every n cycles |
| `ply(n)` | repeat each event n times |
| `off(t, fn)` | layer a copy delayed by t, transformed |
| `superimpose(fn)` | layer a transformed copy, no time offset |
| `layer(...fns)` | stack multiple transformed copies |
| `echo(n, t, fb)` | n echoes, t apart, feedback gain |
| `euclid(p,s)` / `euclidRot(p,s,r)` | Euclidean rhythm |
| `struct(pat)` | impose a boolean structure |
| `add` / `sub` / `mul` | arithmetic on values (e.g. transpose) |
| `range(lo,hi)` / `segment(n)` | remap / sample a signal |

## Effects (chained params)

`gain(x)` 0..1 · `pan(x)` 0 left..1 right · `lpf(x)`/`cutoff` low-pass Hz ·
`hpf(x)` high-pass · `lpq(x)`/`resonance` Q · `room(x)` 0..1 · `size(x)` ·
`delay(x)` · `delaytime(x)` · `delayfeedback(x)` · `crush(x)` bitcrush ·
`shape(x)` waveshape · `speed(x)` (neg = reverse) · `begin/end(x)` ·
`coarse(x)` · `vowel(x)`.

ADSR: `.attack(a).decay(d).sustain(s).release(r)` (seconds; sustain is 0..1).

## Signals / LFO

Continuous signals output **0..1** (`sine`, `cosine`, `saw`, `isaw`, `tri`,
`square`, `rand`, `perlin`, `irand(n)`); `*2` variants output -1..1.
Sample with `.segment(n)` to make events, or pass to a param.

```js
n(sine.segment(16).range(0,15)).scale("C:minor")
s("hh*8").gain(rand.range(0.4,1))
.lpf(saw.range(200,2000).slow(4))
```

## Tonal

| Function | Purpose | Example |
|---|---|---|
| `scale(name)` | map `n` degrees → notes (0-based) | `n("0 2 4").scale("C:major")` |
| `chord(name)` | build a chord | `chord("C Am F G")` |
| `transpose(n)` | shift by semitones / interval | `.transpose(7)` |
| `scaleTranspose(n)` | shift by scale steps | `.scaleTranspose(3)` |
| `voicing()` | realise chord voicings | `chord("<C^7 Am7>").voicing()` |

Scale format `root:type`, root defaults to octave 3. Multi-word names use
colons: `"C:bebop:major"`.

## Gotchas

- Single quotes are **not** patterns — use `"..."` or backticks.
- `*n` is repeat/fill, **not** pitch. Change pitch with `note`/`add`/`transpose`.
- `@n` changes time share; `!n` repeats as equal events.
- `<a b>` plays **one per cycle**; `[a b]` plays both in one cycle.
- `,` inside `[...]` is a chord.
- Euclidean is `(pulses, steps, offset)` — order matters.
- `stack` layers simultaneously; `cat`/`seq` are sequential.
- `fast`/`slow` change time only, never pitch.
- Continuous signals need `.segment(n)` before they make events.
- `scale` pairs with `n` (degrees), not `note` (names).
- `n` is overloaded: with `s` it is a sample variant; with `scale` a degree.
- `s("hh:2")` is shorthand for `s("hh").n(2)`.
- Samples lazy-load; the first hit can be silent.

## Recipes

```js
// Four-on-the-floor with hats and a filtered bass
stack(
  s("bd*4").gain(0.9),
  s("hh*8").gain(rand.range(0.2,0.5)),
  n("0 0 3 5").scale("C:minor").s("sawtooth").lpf(sine.range(300,1200).slow(4))
)

// String quartet sketch (classical palette)
stack(
  note("c3 eb3 g3").s("gm_cello").attack(0.05).release(0.8).gain(0.7),
  note("[c4,eb4,g4]").s("gm_violin").room(0.4).gain(0.5),
  note("c2").s("gm_contrabass").slow(2).gain(0.6)
)

// Euclidean stereo melody
note("c3 eb3 g3").s("gm_marimba").euclid(5,8).jux(rev).off(1/8, x=>x.add(12))
```
