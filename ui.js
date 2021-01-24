const readline = require('readline');

const helpers = require('./helpers.js');

const { clamp, revif } = helpers;

const UI_PARAMS = {
  SEQ_SEL: 0,
  CLK_DIV: 1,
  SEQ_LEN: 2,
};

class UI {
  constructor (seq) {
    this.seq = seq;
    seq.onupdate = () => this.redraw();

    this.mode = 'edit';
    this.seqidx = 0;
    this.noteidx = 0;
    this.paramidx = 0;

    this.init();
  }
  redraw () {
    process.stdout.write(helpers.mvorigin + helpers.clrscn);

    const clk = this.seq.clock;
    for (let i = 0; i < this.seq.seqs.length; i++) {
      const parts = [];
      const seq = this.seq.seqs[i];
      const clkdiv = this.seq.clockdivs[i];
      const onidx = Math.floor((clk / clkdiv) % seq.length);

      for (let j = 0; j < seq.length; j++) {
        const s = seq[j];
        let part = s === null ? '--' : s.toString(16);
        if (j === onidx) part = helpers.yellowfg(part);
        if (i === this.seqidx && j === this.noteidx) part = helpers.rev(part);

        parts.push(part);
      }
      if (this.mode !== 'edit') {
        console.log(helpers.dim(parts.join(' ')));
      } else {
        console.log(parts.join(' '));
      }
    }

    let params = '';
    params += 'seqsel: '
    params += revif(this.seqidx, this.paramidx === UI_PARAMS.SEQ_SEL);
    params += '\n';
    params += 'clkdiv: ' 
    params += revif(this.seq.clockdivs[this.seqidx], this.paramidx === UI_PARAMS.CLK_DIV);
    params += '\n';
    params += 'seqlen: '
    params += revif(this.seq.seqs[this.seqidx].length, this.paramidx === UI_PARAMS.SEQ_LEN);
    if (this.mode !== 'params') params = helpers.dim(params);
    console.log(params);
  }

  init () {
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);

    process.stdin.on('keypress', (_, key) => {
      const k = key.sequence;
      if (k === '\u0003') { process.exit(0); }

      if (this.mode === 'edit') {

        if (k === 'l') {
          this.noteidx = clamp(this.noteidx + 1, 0, this.seq.seqs[this.seqidx].length - 1);
        }
        if (k === 'h') {
          this.noteidx = clamp(this.noteidx - 1, 0, this.seq.seqs[this.seqidx].length - 1);
        }
        if (k === 'k') {
          const note = this.seq.seqs[this.seqidx][this.noteidx];
          this.seq.seqs[this.seqidx][this.noteidx] = clamp(note + 1, 0, 127);
        }
        if (k === 'j') {
          const note = this.seq.seqs[this.seqidx][this.noteidx];
          this.seq.seqs[this.seqidx][this.noteidx] = clamp(note - 1, 0, 127);
        }
        if (k === '\r') {
          const note = this.seq.seqs[this.seqidx][this.noteidx];
          this.seq.seqs[this.seqidx][this.noteidx] = note ? null : 60; // 60=c4
        }
        if (k === '\t') {
          this.mode = 'params';
        }

      } else if (this.mode === 'params') {

        if (k === '\t') {
          this.mode = 'edit';
        }
        if (k === 'j') { this.paramidx = clamp(this.paramidx + 1, 0, 2); }
        if (k === 'k') { this.paramidx = clamp(this.paramidx - 1, 0, 2); }

        if (this.paramidx === UI_PARAMS.SEQ_SEL) {
          if (k === 'h') this.seqidx = clamp(this.seqidx - 1, 0, 3);
          if (k === 'l') this.seqidx = clamp(this.seqidx + 1, 0, 3);
        }

        if (this.paramidx === UI_PARAMS.CLK_DIV) {
          if (k === 'h') this.seq.clockdivs[this.seqidx] = clamp(
            this.seq.clockdivs[this.seqidx] - 1, 1, 4096
          );
          if (k === 'l') this.seq.clockdivs[this.seqidx] = clamp(
            this.seq.clockdivs[this.seqidx] + 1, 1, 4096
          );
        }

        if (this.paramidx === UI_PARAMS.SEQ_LEN) {
          if (k === 'l') {
            this.seq.seqs[this.seqidx].push(null);
          }
          if (k === 'h') {
            this.seq.seqs[this.seqidx].splice(-1, 1);
          }
        }


      }

      this.redraw();
    });
  }
}

module.exports = { UI };
