const CryptoJS = require("crypto-js");
const dotenv = require("dotenv");
dotenv.config();

const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET;

const encrypt = (text) => {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_SECRET).toString(); // encrypted string
};

const decrypt = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_SECRET);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) throw new Error("Decryption failed");
    return decrypted;
  } catch (err) {
    console.error("Decryption error:", err.message);
    return null;
  }
};

module.exports = { encrypt, decrypt };
