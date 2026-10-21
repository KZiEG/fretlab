// How to connect a BOSS ME-90 to an amp with the 4-cable method. Our own words.

const CABLES = [
  ['Cable 1', 'Guitar → ME-90 INPUT.'],
  ['Cable 2', 'ME-90 SEND → amp INPUT (front). This feeds your drive sounds into the amp’s preamp.'],
  ['Cable 3', 'Amp FX LOOP SEND → ME-90 RETURN. The amp’s own preamp sound comes back into the ME-90.'],
  ['Cable 4', 'ME-90 OUTPUT L/MONO → amp FX LOOP RETURN. The finished sound goes to the amp’s power amp and speaker.'],
]

const SETUP = [
  'Turn the amp’s volume all the way down before connecting anything.',
  'Set the ME-90’s Gt.AMP/LINE switch (next to the outputs) to Gt.AMP, since the sound is going to a guitar amp.',
  'Set OUTPUT SELECT to the “RETURN” option closest to your amp, because the OUTPUT now feeds the amp’s effects return: e.g. TUBE COMBO 112 RETURN for a 1×12 tube combo, TUBE STACK 412 RETURN for a head and 4×12, or the KATANA / JC-120 RETURN options. It’s a system setting: in manual mode press EDIT until OUTPUT SELECT shows, pick with the BANK pedals, then press WRITE.',
  'Switch the ME-90 on first, then the amp. When you finish, switch the amp off first. That avoids loud pops.',
  'Turn the ME-90’s own amp (preamp) off: the real amp is doing that job now.',
  'Turn on the ME-90’s SEND/RETURN loop. It always sits right after the PREAMP, so your drives come before the amp and EQ/FX2, MOD, DELAY and REVERB come after it, exactly what the 4-cable method needs. (See your owner’s manual or the BOSS TONE STUDIO for ME-90 app for switching it on.)',
  'If the amp’s effects loop has a level switch (e.g. −10 dBV / +4 dBu), start on −10 dBV.',
  'Bring the amp’s volume up slowly. Use the amp’s channel, gain and tone knobs as usual: they’re part of the sound again.',
]

export default function HookUp() {
  return (
    <div className="hookup">
      <section className="shortcut">
        <h3>The 4-cable method (ME-90)</h3>
        <p className="why">
          The 4-cable method uses your real amp for the amp sound and the ME-90 for everything around it. Drives and
          wah go <strong>before</strong> the amp’s preamp, and modulation, delay and reverb go <strong>after</strong>{' '}
          it through the amp’s effects loop, so echoes stay clean even when the amp is distorting.
        </p>
        <p className="muted small">
          You need an amp with an effects loop (FX LOOP SEND and RETURN on the back) and four instrument cables.
        </p>

        <h4>The four cables</h4>
        <ol className="hk-steps">
          {CABLES.map(([n, what]) => (
            <li key={n}><strong>{n}:</strong> {what}</li>
          ))}
        </ol>

        <h4>Set up</h4>
        <ol className="hk-steps">
          {SETUP.map((s) => <li key={s}>{s}</li>)}
        </ol>

        <h4>The sound path</h4>
        <p className="why">
          Guitar → ME-90 drives and wah → amp preamp (channel, gain, tone) → ME-90 modulation, delay and reverb → amp
          power amp → speaker.
        </p>

        <h4>Good to know</h4>
        <ul className="tips">
          <li>No sound? Check cables 2 and 3 aren’t swapped, and that the ME-90’s SEND/RETURN loop is switched on.</li>
          <li>Hum or buzz: a cheap or long cable is the usual cause; keep loop cables short.</li>
          <li>
            Simpler 2-cable options: ME-90 OUTPUT L/MONO → amp front INPUT (OUTPUT SELECT on an “INPUT” option, ME-90
            amp off, amp kept clean), or → amp FX LOOP RETURN (a “RETURN” option, ME-90 amp on, so the ME-90 makes the
            whole sound).
          </li>
        </ul>
      </section>
    </div>
  )
}
