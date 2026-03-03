// CRC16/CCITT-FALSE: poly 0x1021, init 0xFFFF
function crc16(str) {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
}

// Helper: ID(2) + len(2) + value
function f(id, value) {
  const len = String(value).length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

export function gerarPixPayload({ chave, nome, cidade, valor }) {
  const nomeTrunc = String(nome).substring(0, 25);
  const cidadeTrunc = String(cidade).substring(0, 15);
  const valorStr = parseFloat(valor).toFixed(2);

  const merchantInfo = f("00", "BR.GOV.BCB.PIX") + f("01", chave);

  const payload =
    f("00", "01") +
    f("01", "12") +
    f("26", merchantInfo) +
    f("52", "0000") +
    f("53", "986") +
    f("54", valorStr) +
    f("58", "BR") +
    f("59", nomeTrunc) +
    f("60", cidadeTrunc) +
    f("62", f("05", "***")) +
    "6304";

  return payload + crc16(payload);
}
