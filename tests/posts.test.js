process.env.DATABASE_PATH = "./data/test.db";
process.env.NODE_ENV = "test";

const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const request = require("supertest");

// Bersihkan database test sebelum mulai
if (fs.existsSync(process.env.DATABASE_PATH)) {
  fs.unlinkSync(process.env.DATABASE_PATH);
}

const app = require("../src/server");

test("GET /health mengembalikan status ok", async () => {
  const res = await request(app).get("/health");
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.status, "ok");
});

test("GET /posts mengembalikan halaman daftar catatan", async () => {
  const res = await request(app).get("/posts");
  assert.strictEqual(res.status, 200);
});

test("POST /posts dengan data valid membuat catatan baru dan redirect", async () => {
  const res = await request(app)
    .post("/posts")
    .send({ title: "Judul Tes", content: "Isi catatan tes" });
  assert.strictEqual(res.status, 302);
  assert.match(res.headers.location, /^\/posts\/\d+$/);
});

test("POST /posts dengan judul kosong ditolak (400)", async () => {
  const res = await request(app)
    .post("/posts")
    .send({ title: "", content: "Isi tanpa judul" });
  assert.strictEqual(res.status, 400);
});

test("GET /posts/:id untuk id yang tidak ada mengembalikan 404", async () => {
  const res = await request(app).get("/posts/999999");
  assert.strictEqual(res.status, 404);
});

test.after(() => {
  if (fs.existsSync(process.env.DATABASE_PATH)) {
    fs.unlinkSync(process.env.DATABASE_PATH);
  }
});
