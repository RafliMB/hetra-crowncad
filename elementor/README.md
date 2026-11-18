# Widget Elementor — CrownCAD Indonesia (hetra-crowncad.com)

Satu file `index.html` berisi **satu halaman penuh**: header, hero, semua section, footer, CSS, JavaScript, dan ikon SVG. Tidak ada aset dari folder tema, tidak memakai CDN selain Google Fonts, dan halaman statis di root repo tidak diubah.

Arah desain: **"Workshop"** — latar putih, Fraunces (serif) + Plus Jakarta Sans, navy & merah Hetra dengan aksen biru di judul hero, editorial/service-led. Isi dan urutan section sama dengan domain satunya; yang berbeda hanya bahasa visual dan foto industri.

## Isi folder

```
elementor/
├─ index.html            ← tempel isinya ke widget HTML Elementor
├─ crowncad-images.zip   ← hanya gambar yang dipakai widget (109 file)
├─ README.md
└─ uploads/crowncad/     ← isi zip yang sama, sudah diekstrak
   └─ images/...
```

## Cara pasang

### 1. Unggah gambar

Unggah **isi** folder `uploads/crowncad/` ke:

```
/wp-content/uploads/crowncad/
```

lewat File Manager hosting (atau ekstrak `crowncad-images.zip` di dalam `/wp-content/uploads/`; zip hanya berisi file yang benar-benar dipakai). Struktur akhirnya harus seperti:

```
/wp-content/uploads/crowncad/images/hero/hero-bg-1440.webp
/wp-content/uploads/crowncad/images/industries/aerospace-assembly-960.webp
/wp-content/uploads/crowncad/images/gallery/gallery-01-480.webp
...
```

Jangan mengubah nama file atau struktur folder — semua path di `index.html` sudah menunjuk ke lokasi tersebut.

### 2. Buat halaman

1. WordPress → **Pages → Add New**.
2. Klik **Edit with Elementor**.
3. Panel bawah: **Page Settings → Template → Elementor Canvas**. Wajib, karena header dan footer sudah ada di dalam widget (kalau memakai template tema, header/footer akan dobel).
4. Tambahkan satu widget **HTML** ke section pertama.
5. Pengaturan section: **Layout → Content Width: Full Width**, dan **Padding: 0** di semua sisi.
6. Tempel seluruh isi `elementor/index.html` ke kolom HTML.
7. **Update / Publish**.

### 3. Jika tag `<script>` atau `<style>` hilang

Beberapa instalasi WordPress membuang tag tersebut dari widget HTML. Solusi:

- Pasang plugin **Code Snippets** atau **Insert Headers and Footers**, lalu pindahkan blok `<style>…</style>` ke head halaman; atau
- Gunakan widget **HTML** dari Elementor Pro (bukan teks biasa), yang menyimpan tag dengan benar.

## Catatan teknis

- **CSS di-scope** ke `#cc-b` (ID pembungkus widget). Selector tema tidak bocor ke dalam widget, dan style widget tidak mengubah halaman lain. Satu aturan global ditambahkan di akhir CSS: `body.is-locked { overflow: hidden }`, dipakai saat menu mobile / lightbox terbuka.
- **Header bersifat fixed** (menempel di atas viewport) dan transparan hanya saat halaman di posisi paling atas; begitu digulir, bar putih + blur muncul kembali. Kalau tema memakai header sendiri, pakai Elementor Canvas agar tidak bertumpuk. Untuk admin WordPress yang login, pasang CSS kecil `#cc-b .nav { top: 32px }` bila perlu menghindari admin bar.
- **Font** diambil dari Google Fonts: `Fraunces` (serif, 400–600) dan `Plus Jakarta Sans` (400–800). Ikon sudah inline SVG. Kalau tema membuang tag `<link>` font, tambahkan tag itu ke head lewat plugin *Insert Headers and Footers*.
- **JavaScript** hanya progressive enhancement: menu mobile, tab modul, lightbox galeri, chamber "Lihat seluruh foto", validasi form → WhatsApp, tombol kembali ke atas. Halaman tetap terbaca tanpa JS.
- **Form kontak** tidak mengirim data ke server; tombol submit membuka WhatsApp dengan pesan yang sudah terisi.
- **Efek menempel saat scroll**: gambar section Platform dan kolom kiri FAQ memakai `position: sticky` (aktif mulai lebar 1181px). Pembungkus `#cc-b` memakai `overflow-x: clip` — bukan `hidden` — karena `overflow-x: hidden` membuat halaman menjadi scroll container dan mematikan efek sticky. Jangan menggantinya dengan `hidden`.
- Section partner memakai panel navy penuh (tanpa kelas `sect-dark`) supaya tetap kontras di latar abu muda; di layar sempit teks partner tampil lebih dulu, panel menyusul.
- Galeri hanya menampilkan **dua baris** foto di halaman (7 di desktop, 6 di tablet, 3 di HP). Tombol **"Lihat seluruh foto"** membuka chamber berisi semua 12 foto; klik thumbnail membuka lightbox di indeks yang sama.

## Kontak yang dipakai

- WhatsApp: **0819-1224-4660** (`6281912244660`) — semua CTA dan form.
- Telepon kantor: **021-3831-7110** (`+622138317110`).
- Email: **hagai@hetratekno.com**.
- Alamat: Plaza Summarecon Bekasi, Lantai 6, Jl. Bulevar Ahmad Yani, Bekasi 17143.

## Gambar

- Format WebP. Varian lebar **480 / 960 / 1600 px** (hero 960/1440/1920 dalam rasio 16:9, trainer 480–1086, industri 480–1600).
- Setiap `<img>` memakai `srcset`, `sizes`, `width`, dan `height` agar layout tidak bergeser.
- Total gambar ± 6 MB (109 file WebP, hanya yang dipakai).
- Foto hero: render produk CrownCAD (laptop dengan model turbin) dari situs resmi `crowncad.com` — hak milik CrownCAD / Huayun 3D, dipakai sebagai materi promosi partner resmi. Dipasang full-bleed dari tepi atas tanpa veil; teks hero memakai bayangan tipis agar tetap terbaca.
- Foto industri: perakitan struktur pesawat, gambar teknik di meja kerja, deretan mobil, suasana kelas CAD. Empat foto ini sengaja berbeda dari domain `crowncad.id`.
- Kredit foto perakitan pesawat: Lockheed Martin / U.S. Air Force, **public domain** (Wikimedia Commons, `Plant workers work on the F-35 Joint Strike Fighter.JPG`). Tidak wajib atribusi, tetapi dicantumkan untuk ketertiban.
- Gambar galeri memakai varian terbesar untuk lightbox.

## Kompatibilitas browser

Chrome/Edge 111+, Firefox 113+, Safari 16.4+ (memakai `clamp()`, `aspect-ratio`, dan `:has()` terbatas pada halaman statis). Browser lama tetap menampilkan konten, tetapi sebagian spasi bisa bergeser.

## Mengubah konten

Semua konten berada di `index.html` (satu blok kode). Setelah widget terpasang, perubahan teks/gambar dilakukan dengan mengedit file itu lalu menempel ulang ke widget HTML. Halaman statis di root repo tetap dipakai untuk pengembangan dan QA.
