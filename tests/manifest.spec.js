import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

describe("manifest.json", () => {
  const loadManifest = async () => {
    const raw = await readFile(
      new URL("../manifest.json", import.meta.url),
      "utf-8",
    );
    return JSON.parse(raw);
  };

  it("has a user-friendly app name", async () => {
    const manifest = await loadManifest();
    assert.equal(manifest.display_information.name, "Retro Recap App");
  });

  it("has a short description under 10 words", async () => {
    const manifest = await loadManifest();
    const wordCount = manifest.display_information.description.split(/\s+/).length;
    assert.ok(wordCount <= 10, `Description is ${wordCount} words, expected <= 10`);
  });

  it("has a long_description for marketplace listing", async () => {
    const manifest = await loadManifest();
    assert.ok(
      manifest.display_information.long_description,
      "Expected a long_description field",
    );
    assert.ok(
      manifest.display_information.long_description.length >= 50,
      "long_description should be at least 50 characters",
    );
  });

  it("has a background_color", async () => {
    const manifest = await loadManifest();
    assert.ok(
      manifest.display_information.background_color,
      "Expected a background_color field",
    );
    assert.match(
      manifest.display_information.background_color,
      /^#[0-9A-Fa-f]{6}$/,
      "background_color should be a hex color",
    );
  });

  it("has bot_user display_name matching app name", async () => {
    const manifest = await loadManifest();
    assert.equal(
      manifest.features.bot_user.display_name,
      "Retro Recap App",
    );
  });
});
