const fs = require('fs');
const path = require('path');
const md5File = require('md5-file');
const watch = require('node-watch');

const [,, ...args] = process.argv;
const outdir = path.join(__dirname, 'backups');

let files = [];
let changes = {};
let numChangesPerBackup = 50;

// https://stackoverflow.com/questions/11293857/fastest-way-to-copy-file-in-node-js
function copyFile(source, target, cb) {
  let cbCalled = false;

  let rd = fs.createReadStream(source);
  rd.on("error", function(err) {
    done(err);
  });
  let wr = fs.createWriteStream(target);
  wr.on("error", function(err) {
    done(err);
  });
  wr.on("close", function(ex) {
    done();
  });
  rd.pipe(wr);

  function done(err) {
    if (!cb) return;
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }
}

// Check for valid script parameters
const usageMsg = 'Usage:\n\tnode index.js file_1 file_2 ... file_N [--n=numberOfChangesToCreateBackups]';
if (args.length){
  const nRe = /^--n=(\d+)$/;
  for (let i = 0; i < args.length; i++){
    if (nRe.test(args[i])){
      numChangesPerBackup = Number(nRe.exec(args[i])[1]);
    } else {
      files.push(args[i]);
      if (!fs.existsSync(args[i])){
        console.log(`${args[i]} does not exist.`);
        console.log(usageMsg);
        process.exit(1);
      } else if (!fs.lstatSync(args[i]).isFile()){
        console.log(`${args[i]} is not a file.`);
        console.log(usageMsg);
        process.exit(1);
      }

      let hash = md5File.sync(args[i]);
      changes[path.resolve(args[i])] = new Set([hash]);
    }
  }  
} else{
  console.log(usageMsg)
  process.exit(1);
}

// Start script
console.log('Watching files:');
files.forEach(f => {
  console.log(`\t${path.resolve(f)}`)
})
console.log(`\nCreating backup files every ${numChangesPerBackup} changes.`);

// Create backup directory if does not exist
if (!fs.existsSync(outdir)){
    fs.mkdirSync(outdir);
}

const watcher = watch(files, {});
watcher.on('change', (e, fname) => {
  md5File(fname, (err, hash) => {
    if (err) throw err;
    let hashes = changes[path.resolve(fname)];
    if (!hashes.has(hash)){
      hashes.add(hash);
      console.log(`[${hashes.size-1}] ${hash} ${fname} has been modified.`);
      if (hashes.size > numChangesPerBackup){
        // Create backup
        let backupFName = `[${(new Date()).toISOString().replace(/[:\.]/g, '')}] ${path.basename(fname)}`;
        let out = path.join(outdir,backupFName);
        console.log(`Saving backup to ${out}...`);
        copyFile(fname, out);
        hashes.clear();
      }
      if (hashes.size === 0){
        hashes.add(hash);
      }
    }
  });
});
