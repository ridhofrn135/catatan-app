# Catatan App

Aplikasi CRUD catatan/blog sederhana — full-stack, dari database sampai deploy ke cloud.
Dibuat untuk **Final Project: Cloud Full-Stack Deployment**.

## Tech Stack

| Bagian | Teknologi | Alasan |
| --- | --- | --- |
| Backend | Node.js + Express | Ringan, mudah dipelajari, ekosistem besar |
| Database | SQLite (`better-sqlite3`) | Tidak perlu server database terpisah, cukup 1 file |
| Frontend | EJS (server-side rendering) + CSS murni | Tidak perlu build step tambahan, simpel untuk deploy |
| Keamanan | `helmet`, `express-validator` | Header HTTP aman + validasi input |
| Monitoring | `express-status-monitor` | Dashboard real-time tanpa infrastruktur tambahan |
| Container | Docker (multi-stage build) | Image kecil & konsisten di semua environment |
| CI/CD | GitHub Actions | Otomatis test → build image → deploy |

## Fitur

- **Create** — tulis catatan baru
- **Read** — lihat daftar & detail catatan
- **Update** — edit catatan
- **Delete** — hapus catatan
- Validasi input di server (judul & isi wajib diisi)
- Health check endpoint (`/health`) untuk load balancer / uptime monitor
- Dashboard monitoring bawaan (`/status`)

## Menjalankan di Lokal

Butuh Node.js 18+.

```bash
# 1. Install dependencies
npm install

# 2. Siapkan file environment
cp .env.example .env

# 3. Jalankan (mode development, auto-restart saat file berubah)
npm run dev

# atau mode biasa
npm start
```

Buka:
- App: http://localhost:3000
- Dashboard monitoring: http://localhost:3000/status
- Health check: http://localhost:3000/health

## Menjalankan Test

```bash
npm test
```

## Menjalankan dengan Docker

```bash
# Build & jalankan
docker compose up --build

# Atau manual tanpa compose
docker build -t catatan-app .
docker run -p 3000:3000 -v catatan-data:/app/data catatan-app
```

## Struktur Folder

```
catatan-app/
├── .github/workflows/ci-cd.yml   # Pipeline CI/CD
├── src/
│   ├── server.js                 # Entry point Express
│   ├── db/database.js            # Koneksi & schema SQLite
│   ├── routes/posts.js           # Route CRUD
│   └── middleware/validators.js  # Validasi input
├── views/                        # Template EJS
├── public/css/style.css          # Styling
├── tests/                        # Test otomatis
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

## CI/CD Pipeline

Setiap push ke branch `main`, GitHub Actions otomatis menjalankan:

1. **Test** — install dependencies, jalankan test suite
2. **Build & push image Docker** — image di-build lalu di-push ke Docker Hub
3. **Deploy** — image terbaru ditarik & dijalankan di server tujuan

### Setup CI/CD (wajib dilakukan sebelum push)

Di repo GitHub kamu, buka **Settings → Secrets and variables → Actions**, lalu tambahkan secret berikut:

| Secret | Isi |
| --- | --- |
| `DOCKERHUB_USERNAME` | Username Docker Hub kamu |
| `DOCKERHUB_TOKEN` | Access token Docker Hub (buat di Docker Hub → Account Settings → Security) |
| `VPS_HOST` | Alamat IP/domain server tujuan deploy |
| `VPS_USERNAME` | Username SSH ke server |
| `VPS_SSH_KEY` | Private key SSH (yang public key-nya sudah ditaruh di server) |

> Kalau kamu deploy ke Render/Railway/Fly.io alih-alih VPS sendiri, lihat komentar di `.github/workflows/ci-cd.yml` bagian "OPSI B" — biasanya platform-platform itu bisa auto-deploy langsung dari repo GitHub tanpa perlu job Docker manual.

## Opsi Deploy ke Cloud

Pilih salah satu, urut dari yang paling mudah untuk pemula:

1. **Railway / Render / Fly.io** — connect repo GitHub, platform otomatis build & deploy dari `Dockerfile`. Ada free tier, tidak perlu setup server manual. Paling direkomendasikan untuk final project ini.
2. **VPS (DigitalOcean, Vultr, dll.)** — install Docker di VPS, lalu workflow CI/CD di atas (OPSI A) akan otomatis deploy ke sana lewat SSH setiap push.
3. **GCP / AWS / Azure** — bisa pakai Cloud Run (GCP), ECS/App Runner (AWS), atau Container Apps (Azure) — semuanya menerima image Docker yang sudah dibuat di sini.

## Keamanan

- Header HTTP diamankan dengan `helmet` (mencegah beberapa jenis serangan umum seperti clickjacking)
- Semua input divalidasi di server sebelum masuk database (`express-validator`)
- Query database pakai prepared statement (`better-sqlite3`), aman dari SQL injection
- Kredensial (`.env`) tidak pernah di-commit ke git — cek `.gitignore`
- Container jalan sebagai non-root user di dalam Docker

## Monitoring

Dashboard real-time tersedia di `/status` — menampilkan CPU, memori, response time, dan request per detik tanpa perlu setup infrastruktur tambahan (cocok untuk demo/screenshot checklist tugas).

Untuk uptime monitoring dari luar (opsional), endpoint `/health` bisa didaftarkan ke layanan gratis seperti UptimeRobot atau Better Uptime.

## Scaling (Opsional)

- **Horizontal**: jalankan beberapa instance container di belakang load balancer (Docker Swarm, atau Cloud Run/ECS yang sudah punya auto-scaling bawaan)
- **Database**: untuk beban lebih besar, ganti SQLite dengan PostgreSQL/MySQL yang bisa dipisah dari container aplikasi
