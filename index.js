const midi = require('easymidi');

const helpers = require('./helpers.js');
const { UI } = require('./ui.js');

// 60 is c4

class Sequencer {
  constructor (input, output, onupdate) {
    Object.assign(this, {input, output, onupdate});
    input.on('clock', this.onclock.bind(this));
    input.on('start', this.onstart.bind(this));
    input.on('stop', this.onstop.bind(this));

    this.clock = 0;
    this.ppqn = 24;
    // eight -> 12
    // sixteenth -> 6
    // thirtysecond -> 3

    this.clockdiv = 24;
    this.run = true;

    this.seqs = [ // 16 channels
      [], [], [], [], [], [], [], [],
    ];
    this.clockdivs = [
      24, 24, 24, 24, 24, 24, 24, 24,
    ];
    this.currnotes = [
      [], [], [], [], [], [], [], [],
    ];
  }
  onclock (...args) {
    this.clock += 1;

    if (!this.run) return;

    let didupdate = false;
    for (let i = 0; i < this.seqs.length; i++) {
      if (this.seqs[i].length === 0) continue;

      const clockdiv = this.clockdivs[i];

      if ((this.clock % clockdiv) === 0) {
        didupdate = true;
        for (const note of this.currnotes[i]) {
          this.output.send('noteoff', { note, channel: i });
        }
        this.currnotes[i] = [];

        const seq = this.seqs[i];
        const nextnotes = [ seq[(this.clock / clockdiv) % seq.length] ];
        for (const note of nextnotes) {
          if (note === null) continue;

          this.output.send('noteon', { note, velocity: 96, channel: i });
          this.currnotes[i].push(note);
        }
      }
    }
    if (didupdate && this.onupdate) this.onupdate();
  }
  onstart () {
    this.clock = -1;
    this.run = true;
  }
  onstop () {
    this.run = false;

    for (let i = 0; i < this.numchans; i++) {
      for (const note of this.currnotes[i]) {
        this.output.send('noteoff', { note, channel: i });
      }
    }
    this.currnotes = [
      [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
    ];
  }
}

const input = new midi.Input('Hoyt', true);
const output = new midi.Output('Hoyt', true);

const seq = new Sequencer(input, output);
seq.seqs[0] = [ 60, 64, 67, 64];
seq.seqs[1] = [ 56, 55, null, 53];
for (let i = 2; i < seq.seqs.length; i++) {
  seq.seqs[i] = [ null, null, null, null ];
}
seq.clockdivs[1] = 48;

const ui = new UI(seq);
ui.redraw();
