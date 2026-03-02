export const videoLibrary = {
    vigenere: [
      { title: "Konsep & Sejarah Vigenere Cipher", id: "IBUvsHlvRPs", desc: "Algoritma polialfabetik yang pernah dianggap tidak bisa dipecahkan." },
      { title: "Cara Kerja Vigenere Square", id: "hURVv2dxBeE", desc: "Penjelasan matematis menggunakan tabel tabula recta." },
      { title: "Kelemahan & Analisis Frekuensi", id: "VroMnK36KJs", desc: "Bagaimana cara Babbage memecahkan Vigenere." },
      { title: "Vigenere vs Caesar Cipher", id: "rRuMEHYYj5k", desc: "Perbandingan keamanan antara dua algoritma bersejarah." },
      { title: "Implementasi Vigenere Modern", id: "fJRYeZmoXYw", desc: "Relevansi sistem polyalphabetic di era modern." }
    ],
    affine: [
      { title: "Pengenalan Affine Cipher", id: "rqa6O05n9a8", desc: "Pengantar Affine Cipher dalam Kriptografi." },
      { title: "Mencari Invers Modulo 26", id: "rqa6O05n9a8", desc: "Pentingnya syarat Coprime pada parameter A." },
      { title: "Contoh Enkripsi Affine", id: "rqa6O05n9a8", desc: "Langkah demi langkah mengenkripsi teks dengan Affine." },
      { title: "Dekripsi dengan Rumus Invers", id: "rqa6O05n9a8", desc: "Cara mengembalikan teks asli menggunakan invers matematika." },
      { title: "Kriptanalisis Affine", id: "rqa6O05n9a8", desc: "Brute force dan analisis huruf tersering pada Affine." }
    ],
    playfair: [
      { title: "Memahami Playfair Cipher", id: "2RCmkWZE-Fg", desc: "Teknik enkripsi berbasis grid 5x5 dan substitusi digraf." },
      { title: "Aturan Baris, Kolom, & Persegi", id: "ldQ6A9bGCR8", desc: "Tiga aturan utama pergeseran Playfair." },
      { title: "Pembuatan Matriks Kunci", id: "_ZLs1gyqxRc", desc: "Cara menyusun alfabet di dalam kotak 5x5." },
      { title: "Enkripsi Digraf Playfair", id: "quKMQvJpUQQ", desc: "Mengapa Playfair lebih kuat dari substitusi sederhana." },
      { title: "Playfair dalam Sejarah", id: "6K-Q5B_K1sU", desc: "Penggunaan Playfair pada perang dunia pertama." }
    ],
    hill: [
      { title: "Aljabar Linear dalam Kriptografi", id: "CeEjEawCZU4", desc: "Pengenalan Hill Cipher menggunakan operasi matriks." },
      { title: "Determinan & Matriks Invers", id: "CeEjEawCZU4", desc: "Syarat wajib matriks 2x2 agar bisa digunakan sebagai kunci." },
      { title: "Enkripsi Hill Cipher (Matriks 2x2)", id: "CeEjEawCZU4", desc: "Perkalian matriks modulo 26 untuk menyembunyikan pesan." },
      { title: "Dekripsi Teks Sandi Hill", id: "CeEjEawCZU4", desc: "Menerapkan matriks invers pada ciphertext." },
      { title: "Kerentanan Hill Cipher", id: "X2b1_B4Y8_A", desc: "Kejahatan Known-Plaintext Attack pada Hill Cipher." }
    ],
    enigma: [
      { title: "Mesin Enigma Perang Dunia II", id: "G2_Q9FoD-oQ", desc: "Visualisasi mekanik dari mesin Enigma legendaris." },
      { title: "Sistem Rotor & Stepping", id: "ASfAPOiq_eQ", desc: "Cara kerja odometer dan scrambling kabel di dalam Enigma." },
      { title: "Peran Reflektor Enigma", id: "V4V2bpZlqx8", desc: "Mengapa sebuah huruf tidak pernah dienkripsi menjadi dirinya sendiri." },
      { title: "Steckerbrett (Plugboard)", id: "d2Nw8g2w0A0", desc: "Lapisan keamanan tambahan yang menyulitkan Sekutu." },
      { title: "Alan Turing & Bombe", id: "9U_1_1V8_7o", desc: "Bagaimana Bletchley Park memecahkan kode Enigma." }
    ]
  };
  
  export const categoryNames = { vigenere: "Vigenere", affine: "Affine", playfair: "Playfair", hill: "Hill", enigma: "Enigma" };