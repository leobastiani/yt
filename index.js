module.exports = (argv = process.argv) => {
  const execa = require('execa');
  const fs = require('fs');
  const path = require('path');
  const { docopt } = require('docopt');
  const execname = path.basename(argv[1]);
  doc = `Usage:
  ${execname} [options] [<urls> ...]
Options:
  -h --help            Show this screen.
  -d --debug           Debug mode.
  --dry-run            Does not download any content.
  -a --audio-only      Downloads audio only.
  -r --resolution=<r>  Video resolution [default: 720p].
  -e --ext=<e>         Video extension [default: mp4].
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

  if(process.cwd() == process.env.USERPROFILE) {
    process.chdir(`${process.env.USERPROFILE}\\Desktop`);
  }

  const resolution = parseInt(arguments['--resolution']);
  const ext = arguments['--ext'];
  for(const url of urls) {
    execa.sync(
      `youtube-dl`,
      [
        arguments['--audio-only']
          ? '--extract-audio --audio-format mp3'
          : `-f "best[height<=${resolution}][ext=${ext}]"`,
        "--output",
        `"%(title)s.%(ext)s"`,
        `"${url}"`,
      ],
      { shell: true, stdio: ['inherit', 'inherit', 'inherit'] }
    );
  }
};
