## Before build
Check app version in package.json, src-tauri/Cargo.toml, and src-tauri/tauri.conf.json. Update if necessary. Add changelog to releaseBody in main.yml (workflow). Update README.md and SECURITY.md to include latest version.

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
Download latest.json from the release, and replace contents of existing latest.json with the new one.
