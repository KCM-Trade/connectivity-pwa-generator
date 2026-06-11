async function decryptInBrowser(encryptedData, password, salt) {
    // 1. 將 Hex 字串轉換為 Uint8Array
    const hexToBuffer = (hex) => 
      new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  
    // 2. 解析資料組件
    const [ivHex, authTagHex, encryptedTextHex] = encryptedData.split(':');
    const iv = hexToBuffer(ivHex);
    const authTag = hexToBuffer(authTagHex);
    const encryptedText = hexToBuffer(encryptedTextHex);
  
    // 3. 合併密文與認證標籤（Web Crypto 標準要求）
    const combinedCiphertext = new Uint8Array(encryptedText.length + authTag.length);
    combinedCiphertext.set(encryptedText);
    combinedCiphertext.set(authTag, encryptedText.length);
  
    // 4. 將字串轉換為二進位 Buffer
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    const saltBuffer = encoder.encode(salt);
  
    // 5. 匯入基礎原始密碼（為 PBKDF2 作準備）
    const baseKey = await window.crypto.subtle.importKey(
      "raw",
      passwordBuffer,
      "PBKDF2",
      false,
      ["deriveBits", "deriveKey"]
    );
  
    // 6. 衍生出與 Node.js 完全對應的 AES-GCM 金鑰物件（10,000次疊代，SHA-256）
    const cryptoKey = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: saltBuffer,
        iterations: 10000,
        hash: "SHA-256"
      },
      baseKey,
      { name: "AES-GCM", length: 256 }, // 直接衍生為 256 位的 AES 金鑰
      false,
      ["decrypt"]
    );
  
    // 7. 執行 AES-GCM 解密
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
        tagLength: 128 // 16 位元組認證標籤
      },
      cryptoKey,
      combinedCiphertext
    );
  
    // 8. 解碼回明文字串
    return new TextDecoder().decode(decryptedBuffer);
  }

  async function load(domain,type){
    const result = await fetch(`${domain}/api/getEncodedUrls?type=${decodeURIComponent(type)}`);
    const data = await result.json();
    const url = await decryptInBrowser(data.data, 'ykcm-fallback-password', 'salt-kcming');
    const testUrls = [];
    const checkPromises = JSON.parse(url).map(async (link) => {
        const res = await fetch(link.url, { method: 'GET' });
        if (!res.ok) throw new Error();
        return link.url; 
      });
    const resultUrl = await Promise.any(checkPromises);
    return resultUrl;
  }

  async function getRouter(domain){
    const result = await fetch(`${domain}/api/getEncodedUrls?type=router`);
    const data = await result.json();
    const url = await decryptInBrowser(data.data, 'ykcm-fallback-password', 'salt-kcming');
    const links = JSON.parse(url);
    return links[Math.floor(Math.random() * links.length)];
  }