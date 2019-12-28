module.exports = (argv = process.argv) => {
  const execa = require('execa');
  const fs = require('fs');
  const path = require('path');
  const { docopt } = require('docopt');
  const execname = path.basename(argv[1]);
  doc = `Usage:
  ${execname} [options] [<urls> ...]
Options:
  -h --help        Show this screen.
  -d --debug       Debug mode.
  -a --audio-only  Downloads audio only.
  --threads=<t>    Number of threads running downloads [default: 1].
`;
  const arguments = docopt(doc, { argv: argv.slice(2) });
  const DEBUG = arguments['--debug'];
  const debug = DEBUG ? console.debug : () => {};
  debug({ arguments });

  const urls = arguments['<urls>'].length
    ? arguments['<urls>']
    : (() => {
      const clipboardy = require('clipboardy');
      return clipboardy.readSync().trim().split(/\s+/gm).filter(Boolean);
    })();

  if(urls.length == 0) {
    docopt(doc, { argv: ['-h'] });
  }

  const chunk = (input, groups) => {
    const ret = Array.from({ length: groups }).map(() => []);
    for(let i=0; i<input.length; i++) {
      ret[i % groups].push(input[i]);
    }
    return ret;
  };

  const threads = parseInt(arguments['--threads']);
  if(threads > 1) {
    chunk(urls, threads).forEach((chunk) => chunk.length && execa(
      `yt ${arguments['--audio-only'] ? '-a' : ''} "${chunk.join('" "')}"`,
      { shell: true, detached: true }
    ));
  }
  else {
    if(process.cwd() == process.env.USERPROFILE) {
      process.chdir(`${process.env.USERPROFILE}\\Desktop`);
    }
    for(const url of urls) {
      execa.sync(
        `youtube-dl`,
        [
          '-f',
          `"${arguments['--audio-only'] ? 'bestaudio[ext=m4a]' : 'best[height<=720][ext=mp4]'}"`,
          "--output",
          `"%(title)s.%(ext)s"`,
          `"${url}"`,
        ],
        { shell: true, stdio: ['inherit', 'inherit', 'inherit'] }
      );
    }

    if(arguments['--audio-only']) {
      const glob = require('glob');
      for(const m4a of glob.sync('*.m4a')) {
        const ext = path.extname(m4a);
        const mp3 = `${path.basename(m4a, ext)}.mp3`;
        if(!fs.existsSync(mp3)) {
          execa.sync(
            `ffmpeg -i "${m4a}" -codec:a libmp3lame -q:a 2 -vn "${mp3}"`,
            { shell: true, stdio: ['inherit', 'inherit', 'inherit'] }
          );
        }
      }
    }
  }
};