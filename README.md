# Kechlen Studio

Aplikasi web kamera interaktif untuk mengambil foto dengan berbagai efek visual dan filter menarik.

## Fitur-Fitur

- **Tema Tampilan**: Pilihan tema warna antarmuka (Sakura, Cozy Café, Rainy Night, Neon City, dan Minimal White) yang dilengkapi dengan animasi partikel sesuai tema.
- **Deteksi Gestur Tangan**:
  - **Jempol (👍)**: Memulai hitung mundur otomatis untuk mengambil foto.
  - **Peace (✌️)**: Otomatis mengaktifkan efek *Portrait* (wajah lebih mulus dan cerah).
- **Bingkai Foto**: Tambahkan bingkai estetis pada hasil foto, seperti gaya Polaroid, Kawaii, dan Film Strip.
- **Mode Photo Strip**: Mengambil 4 foto secara berurutan dan otomatis menggabungkannya menjadi satu jepretan memanjang ala *photobooth*.
- **Skor Foto**: Memberikan penilaian interaktif untuk aspek Pencahayaan, Senyuman, dan Komposisi setelah foto diambil.
- **Galeri Lokal**: Menyimpan riwayat foto yang diambil selama sesi aktif, dilengkapi tombol untuk *Download*, *Share*, dan *Delete*.

## Cara Menjalankan

1. *Clone* atau *download* repositori ini.
2. Buka folder proyek.
3. Jalankan *local server*. Contoh menggunakan Python:
   ```bash
   python -m http.server 8000
   ```
4. Buka browser dan akses `http://localhost:8000`.
5. Izinkan akses kamera dan mulai berfoto.
