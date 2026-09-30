const express = require("express");
const db = require("../db/database");
const { postValidationRules, checkValidation } = require("../middleware/validators");

const router = express.Router();

// READ - daftar semua catatan
router.get("/", (req, res) => {
  const posts = db
    .prepare("SELECT id, title, created_at FROM posts ORDER BY created_at DESC")
    .all();
  res.render("index", { posts });
});

// CREATE - form tambah catatan baru
router.get("/new", (req, res) => {
  res.render("new", { errors: [], post: {}, formAction: "/posts" });
});

router.post(
  "/",
  postValidationRules,
  checkValidation("new"),
  (req, res) => {
    const { title, content } = req.body;
    const stmt = db.prepare("INSERT INTO posts (title, content) VALUES (?, ?)");
    const result = stmt.run(title, content);
    res.redirect(`/posts/${result.lastInsertRowid}`);
  }
);

// READ - satu catatan
router.get("/:id", (req, res) => {
  const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(req.params.id);
  if (!post) {
    return res.status(404).render("404");
  }
  res.render("show", { post });
});

// UPDATE - form edit
router.get("/:id/edit", (req, res) => {
  const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(req.params.id);
  if (!post) {
    return res.status(404).render("404");
  }
  res.render("edit", { errors: [], post, formAction: `/posts/${post.id}?_method=PUT` });
});

router.put(
  "/:id",
  postValidationRules,
  checkValidation("edit"),
  (req, res) => {
    const { title, content } = req.body;
    const stmt = db.prepare(
      "UPDATE posts SET title = ?, content = ?, updated_at = datetime('now') WHERE id = ?"
    );
    const result = stmt.run(title, content, req.params.id);
    if (result.changes === 0) {
      return res.status(404).render("404");
    }
    res.redirect(`/posts/${req.params.id}`);
  }
);

// DELETE
router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM posts WHERE id = ?").run(req.params.id);
  res.redirect("/posts");
});

module.exports = router;
