const fs = require('fs')
const path = require('path')
const all = require('require-all')
const stream = all(path.join(__dirname, '../../../stream'))
const sqlite = all(path.join(__dirname, '../../../sqlite'))
const Database = require('better-sqlite3')

module.exports = {
  command: 'import <database>',
  describe: 'import features into a SQLite database',
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
      describe: 'Apply potentially unsafe PRAGMA settings to speed up imports.'
    })
    yargs.option('schema', {
      type: 'boolean',
      default: true,
      describe: 'Attempt to create tables & indices which don\'t exist.'
    })
    yargs.option('unlink', {
      type: 'boolean',
      default: false,
      alias: 'rm',
      describe: 'Delete db file before import if it already exists.'
    })
  },
  handler: (argv) => {
    // unlink db
    if (argv.unlink) {
      if (argv.verbose) { console.error(`unlink ${argv.database}`) }
      fs.existsSync(argv.database) && fs.unlinkSync(argv.database)
    }

    // connect to database
    if (argv.verbose) { console.error(`open ${argv.database}`) }
    const db = Database(argv.database)

    // fast mode
    if (argv.fast) {
      if (argv.verbose) { console.error('using potentially unsafe PRAGMA settings to speed up imports') }
      sqlite.pragma.write(db)
    }

    // create tables/indices
    if (argv.schema) {
      if (argv.verbose) { console.error('creating tables & indices which don\'t exist') }
      sqlite.schema(db)
    }

    // create import stream
    process.stdin
      .pipe(stream.json.parse())
      .pipe(stream.sqlite.createWriteStream(db))
  }
}
