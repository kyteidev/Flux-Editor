### Before contributing, please see the [Code of Conduct](https://github.com/kyteidev/FluxEditor/blob/dev/CODE_OF_CONDUCT.md).

## Table of Contents

- [Submitting issues](#issues)
- [Submitting PRs](#pr)
- [Setting up the environment](#setting-up)
  - [Prerequisites](#prerequisites)
  - [Cloning](#cloning)
  - [Running](#running)
- [Compiling](#compiling)

## Submitting issues <a name="issues"></a>

When you submit an issue, please use the provided templates. **DO NOT** delete the template, only delete the ones you don't need. Also please submit your issue to the dev branch only. Otherwise your issue will not be reviewed and it will be closed.

## Submitting PRs <a name="pr"></a>
Please create a new PR for the dev branch if you want to contribute code or something else. **DO NOT** submit a PR to the release branch. PRs there will be automatically rejected. You need to sign your commits before submitting a PR.

If you made or plan to make a breaking change, please open an issue for it first. Otherwise your PR will be rejected.

**NOTE:** trolling and spam will result in consequenses.

## Setting up the environment <a name="setting-up"></a>
### Prerequisites <a name="prerequisites"></a>

Make sure you have Rust and NodeJS installed on your system.

This project uses NPM as the package manager for frontend. If you want to use another package manager, make sure to change it in .github/workflows/main.yml

### Cloning <a name="cloning"></a>

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

### Running <a name="running"></a>

To run Flux Editor in dev environment, run
```
npm run tauri dev
```
To run in localhost (no Tauri backend), run
```
npm run serve
```

## Compiling <a name="compiling"></a>
To compile Flux Editor locally as release build, run
```
npm run tauri build
```
For debug builds, add --debug flag, like so:
```
npm run tauri build --debug
```
To build and publish builds, contact the repo admin. If you are one of the admins, see BUILDING.md (non-admins won't be able to push to release branch).
