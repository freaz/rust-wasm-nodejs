# Playing with Rust + WASM + Node.js

Run it:

```shell
# add wasm32 target
rustup target add wasm32-unknown-unknown

# build wasm module
cd example && cargo build --target=wasm32-unknown-unknown --release

# run Javascript
node ./index.mjs

```

## Used materials

- https://surma.dev/things/rust-to-webassembly/
- https://stackoverflow.com/questions/49014610/passing-a-javascript-string-to-a-rust-function-compiled-to-webassembly

## Tools

- https://github.com/WebAssembly/wabt
- https://github.com/bytecodealliance/wasm-tools
