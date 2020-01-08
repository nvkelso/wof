const path = require('path')
const all = require('require-all')
const stream = all(path.join(__dirname, '../../../stream'))
const sqlite = all(path.join(__dirname, '../../../sqlite'))
const Database = require('better-sqlite3')

module.exports = {
  command: 'export <database>',
  describe: 'export features from a SQLite database',
  builder: (yargs) => {
    // mandatory params
    yargs.positional('database', {
      type: 'string',
      describe: 'Location of database file.'
    })

    // optional params
    yargs.option('fast', {
      type: 'boolean',
      default: true,
      describe: 'Apply potentially unsafe PRAGMA settings to speed up exports.'
    })
  },
  handler: (argv) => {
    // connect to database
    if (argv.verbose) { console.error(`open ${argv.database}`) }
    const db = Database(argv.database)

    // fast mode
    if (argv.fast) {
      if (argv.verbose) { console.error('using potentially unsafe PRAGMA settings to speed up imports') }
      sqlite.pragma.read(db)
    }

    // create export stream
    stream.sqlite.createReadStream(db)
      .pipe(process.stdout)
  }
}
