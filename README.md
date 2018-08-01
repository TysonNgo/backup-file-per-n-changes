# backup-file-per-n-changes

Script that saves a backup of file(s) for every `n` changes.

Intended to be used for creative projects that require the user to constantly save their work such as an art project created using illustration software. The creator of this type of project may become deeply immersed in their work and may forget to create regular backups. Therefore, in the event that the file they are working on becomes corrupted, the user will suffer a great loss. The idea of this script is to minimize loss if said file ever corrupts by automating the backup process.

# How it works

Looks for changes in the MD5 sum from a list of given files, and after every n changes of a file, a backup of the respective file will be created.

# Usage

```
node index.js file_1 file_2 ... file_n [OPTIONS]

options:
    --n=NUM    the number of changes to create backups. Default value: 50
```

