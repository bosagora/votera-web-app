# Votera SDK Common

votera-sdk-common provides general purpose components to use across the entire Aragon SDK:

- Interfaces
- Constants
- Types
- Enumerations
- Helpers

# Installation

Use [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) to install
votera-sdk-common.

```bash
npm install votera-sdk-common
yarn add votera-sdk-common
```

# Usage

## Constants

## Encoding

### Converting buffers and hex strings

```ts
import {hexToBytes, bytesToHex} from "votera-sdk-common";

const buff = hexToBytes("0xffffffff");
// [255, 255, 255, 255]

const str0x = bytesToHex(new Uint8Array([100, 100, 100, 100, 100, 100]));
// "0x646464646464"

const str = bytesToHex(new Uint8Array([100, 100, 100, 100, 100, 100]), true);
// "646464646464"
```

### Converting between buffers and big integers

```ts
import {bigIntToBuffer, bigIntToLeBuffer} from "votera-sdk-common";

const bi = BigInt("111122223333444455556666777788889999000011112222333344445555666677778888999900")
const buff = bigIntToBuffer(bi);
// Uint8Array(32) [ 245, 172, 243,  22, 170, 44,  13,  78, ..., 220 ]

const buffLe = bigIntToLeBuffer(bi);
// Uint8Array(32) [ 220,  67, 63, 224,  21,  50, 154, 103, ..., 245 ]
```

```ts
import {bufferToBigInt, bufferLeToBigInt} from "votera-sdk-common";

const buff = new Uint8Array([
    245, 172, 243, 22, 170, 44, 13, 78,
    106, 70, 70, 147, 249, 71, 137, 190,
    155, 21, 186, 14, 206, 88, 97, 129,
    103, 154, 50, 21, 224, 63, 67, 220
]);
const hex = bufferToBigInt(buff);
// 111122223333444455556666777788889999000011112222333344445555666677778888999900n

const buffLe = new Uint8Array([
    220, 67, 63, 224, 21, 50, 154, 103,
    129, 97, 88, 206, 14, 186, 21, 155,
    190, 137, 71, 249, 147, 70, 70, 106,
    78, 13, 44, 170, 22, 243, 172, 245
]);
const hex = bufferLeToBigInt(buffLe);
// 111122223333444455556666777788889999000011112222333344445555666677778888999900n
```

### Percent ratios stored on-chain

Encodes ratio values between 0 and 1 translated into an integer range with the given digit precision

```ts
import {encodeRatio, decodeRatio} from "votera-sdk-common";

let digits = 1
encodeRatio(0.5, digits) // 5
encodeRatio(0.53625, digits) // 5
encodeRatio(0.57625, digits) // 6

digits = 4
encodeRatio(0.5, digits) // 5000
encodeRatio(0.53625, digits) // 5362
encodeRatio(0.57625, digits) // 5762
```

### Hex prefix guards

```ts
import {strip0x, ensure0x} from "votera-sdk-common";

strip0x("1234")
// "1234"
strip0x("0x1234")
// "1234"

ensure0x("1234")
// "0x1234"
ensure0x("0x1234")
// "0x1234"
```

## Errors

## Promises

## Types
