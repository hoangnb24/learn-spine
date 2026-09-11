// Read container headers only; do not decode or modify source media.
export function imageMetadata(bytes) {
  if (bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) {
    return { mimeType: 'image/png', pixelWidth: bytes.readUInt32BE(16), pixelHeight: bytes.readUInt32BE(20) };
  }
  if (['GIF87a','GIF89a'].includes(bytes.subarray(0,6).toString())) {
    return { mimeType: 'image/gif', pixelWidth: bytes.readUInt16LE(6), pixelHeight: bytes.readUInt16LE(8) };
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2;
    while (offset < bytes.length) {
      if (bytes[offset++] !== 0xff) break;
      while (bytes[offset] === 0xff) offset++;
      const marker = bytes[offset++];
      if (marker === 0xd9 || marker === 0xda) break;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      const length = bytes.readUInt16BE(offset);
      if (length < 2 || offset + length > bytes.length) break;
      if ([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)) {
        return { mimeType: 'image/jpeg', pixelWidth: bytes.readUInt16BE(offset + 5), pixelHeight: bytes.readUInt16BE(offset + 3) };
      }
      offset += length;
    }
  }
  throw new Error('Unsupported or malformed image header');
}
