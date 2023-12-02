import fs from 'fs';
import { join } from 'path';

const __dirname = new URL('.', import.meta.url).pathname;

const importObject = {};

const wasm = fs.readFileSync(join(__dirname, './example/target/wasm32-unknown-unknown/release/example.wasm'));
const { instance } = await WebAssembly.instantiate(wasm, importObject);

const input_ptr = newString(instance.exports, "Hello from JS");
const result_ptr = instance.exports.round_trip(input_ptr);
console.log({ input_ptr, result_ptr });

console.log(instance.exports.memory.buffer);

const result = copyCStr(instance.exports, result_ptr);
console.log('result', result);


function copyCStr(module, ptr) {
  let orig_ptr = ptr;
  const collectCString = function* () {
    let memory = new Uint8Array(module.memory.buffer);
    while (memory[ptr] !== 0) {
      if (memory[ptr] === undefined) {
        throw new Error("Tried to read undef mem");
      }

      yield memory[ptr];
      ptr += 1;
    }
  }

  const bufferAsU8 = new Uint8Array(collectCString());
  const utf8Decoder = new TextDecoder('utf8');
  const buffer = utf8Decoder.decode(bufferAsU8);
  module.dealloc_str(orig_ptr);
  return buffer;
}

function getStr(module, ptr, len) {
  const getData = function* (ptr, len) {
    let memory = new Uint8Array(module.memory.buffer);
    for (let index = 0; index < len; index++) {
      if (memory[ptr] === undefined) {
        throw new Error(`Tried to read undef mem at ${ptr}`);
      }
      yield memory[ptr + index];
    }
  }

  const bufferAsU8 = new Uint8Array(getData(ptr / 8, len / 8));
  const utf8Decoder = new TextDecoder('utf8');
  return utf8Decoder.decode(bufferAsU8);
}

function newString(module, str) {
  const utf8Encoder = new TextEncoder('utf8');
  let string_buffer = utf8Encoder.encode(str);
  let len = string_buffer.length;
  let ptr = module.alloc(len + 1); // plus 1 to have 0 at the end of the string, but feel clumpsy

  let memory = new Uint8Array(module.memory.buffer);
  for (let i = 0; i < len; i++) {
    memory[ptr + i] = string_buffer[i];
  }

  memory[ptr + len] = 0;
  return ptr
}