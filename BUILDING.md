## Before build
Check app version in package.json, src-tauri/Cargo.toml, and src-tauri/tauri.conf.json. Update if necessary

## Building
Commit all changes to dev branch by running
```
git push origin dev
```
and then build the app by running
```
git push origin dev:release
```

## After Build
Update the Release to include the release notes and SHA-256 checksum.
