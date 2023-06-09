# Contract Builder

Builds contracts in the simplest way possible.

Allows for cross environment compilation by utilizing Docker in the background.

## Program Requirements

-   Docker must be installed

## Repository Requirements

-   Node 16+

## Installation

```
git clone git@github.com:ultraio/contract-builder.git
```

```
cd contract-builder
```

```
npm install
```

```
npm run dev
```

## Build

Releases will be output to the `releases` folder if built successfully.

```
npm run build
```

## Usage

To build a contract simply drag and drop a folder with source code onto the binary. The tool will start a docker image and places build artifacts (wasm and abi files) along with the source files. Another way of using the tool is through command line:

```
$ contract-builder-macos ./test/example-contract
Warning, empty ricardian clause file
Warning, empty ricardian clause file
Warning, action <hi> does not have a ricardian contract
Program will stop container in 5 seconds...
```

One can also pass build flags for the compiler with `-b` option:

```
$ contract-builder -i ./test/example-contract -b "-DTEST=true"
```

For a more complex projects you might want to use a build system like CMake. The tool supports it and looks for `CMakeLists.txt` in the root of the repo. If found it will use cmake to build the project.

```
$ contract-builder -i ./test/example-cmake-contract
-- Setting up Eosio Wasm Toolchain 1.7.0 at /usr
-- Configuring done
-- Generating done
-- Build files have been written to: /opt/buildable/build
[100%] Built target eosio.token
```
