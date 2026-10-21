// How to connect the ME-80 to an amp the way closest to the 4-cable method. Our own words.

const STEPS = [
  'Turn the amp’s volume all the way down.',
  'Cable 1: guitar → ME-80 INPUT.',
  'Cable 2: ME-80 OUTPUT L/MONO → the amp’s FX LOOP RETURN (on the back). Leave the amp’s SEND and front INPUT empty.',
  'If the loop has a level switch (e.g. −10 dBV / +4 dBu), set it to −10 dBV, the setting for pedals.',
  'Switch the ME-80 on first, then the amp. When you finish, switch the amp off first. That avoids loud pops.',
  'Turn the ME-80’s PREAMP section on and pick an amp type. It is now your amp sound; set GAIN and EQ there.',
  'Bring the amp’s master volume (and loop level, if it has one) up slowly to a comfortable level.',
]

export default function HookUp() {
  return (
    <div className="hookup">
      <section className="shortcut">
        <h3>Connecting to an amp (like the 4-cable method)</h3>
        <p className="why">
          The 4-cable method puts drive pedals in front of the amp and modulation, delay and reverb in the amp’s
          effects loop, so the echoes come after the distortion. The ME-80 can’t be split like that: it has no SEND and
          RETURN jacks, just one input and one output.
        </p>
        <p className="why">
          You get the closest result by running the whole ME-80, amp models included, into the amp’s effects loop. The
          ME-80 makes the sound in the same order as the 4-cable method: drive, then amp, then modulation, delay and
          reverb. Your amp just makes it loud through its speaker.
        </p>
        <p className="muted small">You need an amp with an effects loop (FX LOOP SEND and RETURN jacks) and two cables.</p>

        <h4>Hook it up</h4>
        <ol className="hk-steps">
          {STEPS.map((s) => <li key={s}>{s}</li>)}
        </ol>

        <h4>Good to know</h4>
        <ul className="tips">
          <li>The amp’s own channel, gain and tone knobs are skipped this way; tone comes from the ME-80.</li>
          <li>Too quiet? Raise the PREAMP LEVEL or the ME-80’s output volume before cranking the amp.</li>
          <li>
            To use your amp’s own sound instead, plug ME-80 OUTPUT L/MONO into the amp’s front INPUT, turn the ME-80’s
            PREAMP off and keep the amp clean. Delay and reverb then sit before the amp, so they work best with a clean
            amp.
          </li>
        </ul>
      </section>
    </div>
  )
}
