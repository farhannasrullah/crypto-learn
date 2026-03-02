export const utils = {
    mod: (n, m) => ((n % m) + m) % m,
    clean: (txt) => txt.toUpperCase().replace(/[^A-Z]/g, ''),
    gcd: (a, b) => (b === 0 ? a : utils.gcd(b, a % b)),
    modInverse: (a, m) => {
      a = utils.mod(a, m);
      for (let x = 1; x < m; x++) if (utils.mod(a * x, m) === 1) return x;
      return -1;
    }
  };
  
  export const ciphers = {
    vigenere: (text, key, decrypt = false) => {
      text = utils.clean(text); key = utils.clean(key) || 'KEY';
      let result = '';
      let steps = [];
      for (let i = 0, j = 0; i < text.length; i++) {
        const p = text.charCodeAt(i) - 65;
        const k = key.charCodeAt(j % key.length) - 65;
        const c = utils.mod(decrypt ? p - k : p + k, 26);
        const cChar = String.fromCharCode(c + 65);
        result += cChar;
        
        const calc = decrypt ? `(${p} - ${k}) mod 26 = ${c}` : `(${p} + ${k}) mod 26 = ${c}`;
        steps.push({ pChar: text[i], kChar: key[j % key.length], cChar, calc });
        j++;
      }
      return { result, steps, type: 'vigenere' };
    },
  
    affine: (text, a, b, decrypt = false) => {
      text = utils.clean(text); a = parseInt(a); b = parseInt(b);
      if (utils.gcd(a, 26) !== 1) throw new Error("Kunci A harus koprima dengan 26 (misal: 1, 3, 5, 7, 11, dst)");
      let result = '';
      let steps = [];
      const aInv = utils.modInverse(a, 26);
      
      for (let i = 0; i < text.length; i++) {
        const p = text.charCodeAt(i) - 65;
        const c = decrypt ? utils.mod(aInv * (p - b), 26) : utils.mod((a * p) + b, 26);
        const cChar = String.fromCharCode(c + 65);
        result += cChar;
  
        const calc = decrypt 
          ? `${aInv} × (${p} - ${b}) mod 26 = ${c}` 
          : `(${a} × ${p} + ${b}) mod 26 = ${c}`;
        steps.push({ pChar: text[i], cChar, calc });
      }
      return { result, steps, type: 'affine', a, b, aInv };
    },
  
    playfair: (text, key, decrypt = false) => {
      text = utils.clean(text).replace(/J/g, 'I');
      key = utils.clean(key).replace(/J/g, 'I') || 'KEY';
      
      const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ";
      const gridArr = [...new Set((key + alphabet).split(''))];
      const grid = [];
      for (let i = 0; i < 5; i++) grid.push(gridArr.slice(i * 5, i * 5 + 5));
  
      const findPos = (char) => {
        for (let r = 0; r < 5; r++) {
          for (let c = 0; c < 5; c++) {
            if (grid[r][c] === char) return { r, c };
          }
        }
      };
  
      if (!decrypt) {
        let formatted = '';
        for (let i = 0; i < text.length; i++) {
          formatted += text[i];
          if (i < text.length - 1 && text[i] === text[i + 1] && formatted.length % 2 !== 0) {
            formatted += 'X';
          }
        }
        if (formatted.length % 2 !== 0) formatted += 'X';
        text = formatted;
      }
  
      let result = '';
      let steps = [];
      
      for (let i = 0; i < text.length; i += 2) {
        const p1 = findPos(text[i]);
        const p2 = findPos(text[i + 1]);
        if (!p1 || !p2) continue;
  
        let c1Char, c2Char, rule;
  
        if (p1.r === p2.r) { 
          c1Char = grid[p1.r][utils.mod(p1.c + (decrypt ? -1 : 1), 5)];
          c2Char = grid[p2.r][utils.mod(p2.c + (decrypt ? -1 : 1), 5)];
          rule = "Baris Sama (Shift Horizontal)";
        } else if (p1.c === p2.c) { 
          c1Char = grid[utils.mod(p1.r + (decrypt ? -1 : 1), 5)][p1.c];
          c2Char = grid[utils.mod(p2.r + (decrypt ? -1 : 1), 5)][p2.c];
          rule = "Kolom Sama (Shift Vertikal)";
        } else { 
          c1Char = grid[p1.r][p2.c];
          c2Char = grid[p2.r][p1.c];
          rule = "Persegi Panjang (Tukar Sudut)";
        }
        
        result += c1Char + c2Char;
        steps.push({ p1: text[i], p2: text[i + 1], c1: c1Char, c2: c2Char, rule });
      }
      return { result, steps, grid, type: 'playfair' };
    },
  
    hill: (text, matrixStr, decrypt = false) => {
      text = utils.clean(text);
      const nums = matrixStr.split(',').map(n => parseInt(n.trim()));
      if (nums.length !== 4 || nums.some(isNaN)) throw new Error("Masukkan 4 angka dipisah koma untuk matriks 2x2");
      
      let [k11, k12, k21, k22] = nums;
      let det = utils.mod((k11 * k22) - (k12 * k21), 26);
      
      if (utils.gcd(det, 26) !== 1) throw new Error(`Determinan matriks (${det}) tidak koprima dengan 26.`);
  
      if (decrypt) {
        const detInv = utils.modInverse(det, 26);
        const tk11 = utils.mod(k22 * detInv, 26);
        const tk12 = utils.mod(-k12 * detInv, 26);
        const tk21 = utils.mod(-k21 * detInv, 26);
        const tk22 = utils.mod(k11 * detInv, 26);
        k11 = tk11; k12 = tk12; k21 = tk21; k22 = tk22;
      }
  
      if (text.length % 2 !== 0) text += 'X';
      let result = '';
      let steps = [];
      
      for (let i = 0; i < text.length; i += 2) {
        const p1 = text.charCodeAt(i) - 65;
        const p2 = text.charCodeAt(i + 1) - 65;
        const c1 = utils.mod((k11 * p1) + (k12 * p2), 26);
        const c2 = utils.mod((k21 * p1) + (k22 * p2), 26);
        
        const char1 = String.fromCharCode(c1 + 65);
        const char2 = String.fromCharCode(c2 + 65);
        result += char1 + char2;
  
        steps.push({
          pChars: [text[i], text[i+1]],
          pVals: [p1, p2],
          cVals: [c1, c2],
          cChars: [char1, char2],
          calc1: `(${k11}×${p1} + ${k12}×${p2}) mod 26 = ${c1}`,
          calc2: `(${k21}×${p1} + ${k22}×${p2}) mod 26 = ${c2}`
        });
      }
      return { result, steps, matrix: [k11, k12, k21, k22], type: 'hill' };
    },
  
    enigma: (text, startPos, decrypt = false) => {
      text = utils.clean(text);
      startPos = utils.clean(startPos).padEnd(3, 'A').substring(0, 3);
      
      const r1 = "EKMFLGDQVZNTOWYHXUSPAIBRCJ"; const n1 = "Q"; 
      const r2 = "AJDKSIRUXBLHWTMCQGZNPYFVOE"; const n2 = "E"; 
      const r3 = "BDFHJLCPRTXVZNYEIWGAKMUSQO";                  
      const ref = "YRUHQSLDPXNGOKMIEBFZCWVJAT";                
      const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  
      let [p1, p2, p3] = startPos.split('').map(c => abc.indexOf(c));
  
      let result = "";
      let steps = [];
      
      for (let char of text) {
        let cIdx = abc.indexOf(char);
        if (cIdx === -1) continue;
  
        p1 = (p1 + 1) % 26;
        if (abc[p1] === n1) {
          p2 = (p2 + 1) % 26;
          if (abc[p2] === n2) p3 = (p3 + 1) % 26;
        }
  
        const passRotor = (idx, rotor, pos, forward) => {
          let shiftIn = utils.mod(idx + pos, 26);
          let outChar = forward ? rotor[shiftIn] : abc[rotor.indexOf(abc[shiftIn])];
          return utils.mod(abc.indexOf(outChar) - pos, 26);
        };
  
        let temp = passRotor(cIdx, r1, p1, true);
        temp = passRotor(temp, r2, p2, true);
        temp = passRotor(temp, r3, p3, true);
        temp = abc.indexOf(ref[temp]);
        temp = passRotor(temp, r3, p3, false);
        temp = passRotor(temp, r2, p2, false);
        temp = passRotor(temp, r1, p1, false);
  
        const outChar = abc[temp];
        result += outChar;
        
        steps.push({ inChar: char, outChar: outChar, pos: `${abc[p1]}${abc[p2]}${abc[p3]}` });
      }
      return { result, steps, type: 'enigma' };
    }
  };