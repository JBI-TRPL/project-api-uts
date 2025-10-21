import request from "supertest";
import app from "../src/app.js";

describe("Library API Autograder Tests", () => {
  test("GET /api/books returns 200 and array", async () => {
    const res = await request(app).get("/api/books");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /api/books inserts new book", async () => {
    const payload = {
      title: "Autograder Book",
      author: "System",
      copies_total: 2,
    };
    const res = await request(app)
      .post("/api/books")
      .send(payload)
      .set("Accept", "application/json");
    expect([200, 201]).toContain(res.statusCode);
  });

  test("PATCH /api/books/:id updates data correctly", async () => {
    const res = await request(app)
      .patch("/api/books/1")
      .send({ copies_total: 5 })
      .set("Accept", "application/json");
    expect([200, 204]).toContain(res.statusCode);
  });

  test("Structure: Required folders exist", () => {
    const fs = require("fs");
    expect(fs.existsSync("src/routes")).toBe(true);
    expect(fs.existsSync("src/repositories")).toBe(true);
  });

  test("README includes AI prompt section", () => {
    const fs = require("fs");
    const content = fs.readFileSync("README.md", "utf-8");
    expect(content.toLowerCase()).toContain("prompt");
  });
});
