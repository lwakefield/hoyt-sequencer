const rev = (val) => '\x1b[7m' + val + '\033[27m';
const revif = (val, bool) => bool ? rev(val) : val;
const udl = (val) => '\x1b[4m' + val + '\033[24m';
const clreol = '\x1b[K';
const mvorigin = '\x1b[H';
const clrscn = '\x1b[2J';
const dimon = '\x1b[2m';
const dimoff = '\x1b[22m';
const dim = (val) =>  '\x1b[2m' + val + '\x1b[22m';
const dimif = (val, bool) => bool ? dim(val) : val;
const yellowfg = (val) => '\x1b[33m' + val + '\x1b[39m';

const clamp = (val, min, max) => {
  if (val <= min) return min;
  if (val >= max) return max;
  return val;
}

module.exports = {
  rev,
  revif,
  udl,
  clreol,
  mvorigin,
  clrscn,
  dimon,
  dimoff,
  dim,
  dimif,
  yellowfg,
  clamp,
}
