### Before contributing, please see the Contributing Guidelines.

# Setting up the environment
## Prerequisites

Make sure you have Rust and NodeJS installed on your system.

## Cloning

run
```
git clone https://github.com/kyteidev/FluxEditor.git
```
to clone the repo. Afterwards open the folder and run
```
npm install
```
and
```
cd src-tauri
cargo install
```
to install dependencies.

## Running the app

To run Flux Editor in dev environment, run
```
npm run tauri dev
```
To run in localhost (no Tauri backend), run
```
npm run serve
```

# Pushing commits
Please create a new PR for the dev branch if you want to push your commits. If you can directly push to dev branch, just run
```
git push origin dev
```
NOTE! release branch is for release builds only.

# Building the app
To build Flux Editor locally as release build, run
```
npm run tauri build
```
For debug builds, add --debug flag, like so:
```
npm run tauri build --debug
```
To build and publish builds, contact the repo admin. If you are one of the admins, see BUILDING.md (non-admins won't be able to push to release branch).
