"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findP12CertSerialNumber = findP12CertSerialNumber;
exports.getCertData = getCertData;
exports.getP12CertFingerprint = getP12CertFingerprint;

function _nodeForge() {
  const data = _interopRequireDefault(require("node-forge"));

  _nodeForge = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getP12CertFingerprint(p12Buffer, passwordRaw) {
  const certData = getRawCertData(p12Buffer, passwordRaw);

  const certAsn1 = _nodeForge().default.pki.certificateToAsn1(certData);

  const certDer = _nodeForge().default.asn1.toDer(certAsn1).getBytes();

  return _nodeForge().default.md.sha1.create().update(certDer).digest().toHex().toUpperCase();
}

function findP12CertSerialNumber(p12Buffer, passwordRaw) {
  const {
    serialNumber
  } = getCertData(p12Buffer, passwordRaw);
  return serialNumber;
}

function getCertData(p12Buffer, passwordRaw) {
  const certData = getRawCertData(p12Buffer, passwordRaw);
  return { ...certData,
    serialNumber: certData.serialNumber.replace(/^0+/, '').toUpperCase()
  };
}

function getRawCertData(p12Buffer, passwordRaw) {
  var _p12$getBags, _p12$getBags$certBagT, _p12$getBags$certBagT2;

  if (Buffer.isBuffer(p12Buffer)) {
    p12Buffer = p12Buffer.toString('base64');
  } else if (typeof p12Buffer !== 'string') {
    throw new Error('getCertData only takes strings and buffers.');
  }

  const password = String(passwordRaw || '');

  const p12Der = _nodeForge().default.util.decode64(p12Buffer);

  const p12Asn1 = _nodeForge().default.asn1.fromDer(p12Der);

  const p12 = _nodeForge().default.pkcs12.pkcs12FromAsn1(p12Asn1, password);

  const certBagType = _nodeForge().default.pki.oids.certBag;

  const certData = (_p12$getBags = p12.getBags({
    bagType: certBagType
  })) === null || _p12$getBags === void 0 ? void 0 : (_p12$getBags$certBagT = _p12$getBags[certBagType]) === null || _p12$getBags$certBagT === void 0 ? void 0 : (_p12$getBags$certBagT2 = _p12$getBags$certBagT[0]) === null || _p12$getBags$certBagT2 === void 0 ? void 0 : _p12$getBags$certBagT2.cert;

  if (!certData) {
    throw new Error("getRawCertData: couldn't find cert bag");
  }

  return certData;
}
//# sourceMappingURL=p12Certificate.js.map