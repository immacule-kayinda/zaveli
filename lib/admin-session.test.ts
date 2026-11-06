import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { adminConfig, createSessionToken, credentialsMatch, readSessionToken } from "./admin-session";

const original = {
  user: process.env.ADMIN_USER,
  password: process.env.ADMIN_PASSWORD,
  secret: process.env.ADMIN_SESSION_SECRET,
};

afterEach(() => {
  restore("ADMIN_USER", original.user);
  restore("ADMIN_PASSWORD", original.password);
  restore("ADMIN_SESSION_SECRET", original.secret);
});

describe("adminConfig", () => {
  it("exige les trois variables", () => {
    delete process.env.ADMIN_USER;
    delete process.env.ADMIN_PASSWORD;
    delete process.env.ADMIN_SESSION_SECRET;
    assert.equal(adminConfig().configured, false);
    assert.equal(credentialsMatch("zaveli", "secret"), false);
  });
});

describe("credentialsMatch", () => {
  it("accepte uniquement le couple défini dans l'environnement", () => {
    process.env.ADMIN_USER = "zaveli";
    process.env.ADMIN_PASSWORD = "mot-de-passe";
    process.env.ADMIN_SESSION_SECRET = "secret-de-session";
    assert.equal(credentialsMatch("zaveli", "mot-de-passe"), true);
    assert.equal(credentialsMatch("zaveli", "autre"), false);
    assert.equal(credentialsMatch("autre", "mot-de-passe"), false);
  });

  it("tolère la casse et les espaces de l'identifiant, et les espaces autour du mot de passe", () => {
    process.env.ADMIN_USER = "boutique.test";
    process.env.ADMIN_PASSWORD = "Exemple-Fictif-42";
    process.env.ADMIN_SESSION_SECRET = "secret-de-session";
    assert.equal(credentialsMatch("Boutique.Test ", "Exemple-Fictif-42"), true);
    assert.equal(credentialsMatch(" boutique.test", "Exemple-Fictif-42 "), true);
    assert.equal(credentialsMatch("boutique.test", "exemple-fictif-42"), false, "le mot de passe garde sa casse");
    assert.equal(credentialsMatch("boutique.test", ""), false);
    assert.equal(credentialsMatch("", ""), false);
  });
});

describe("session token", () => {
  it("retrouve l'identifiant et refuse un jeton altéré ou expiré", () => {
    const secret = "secret-de-session";
    const now = Date.parse("2026-10-30T12:00:00Z");
    const token = createSessionToken("zaveli", secret, now);
    assert.equal(readSessionToken(token, secret, now), "zaveli");
    assert.equal(readSessionToken(token, "autre-secret", now), null);
    assert.equal(readSessionToken(`${token}x`, secret, now), null);
    assert.equal(readSessionToken(token, secret, now + 8 * 24 * 60 * 60 * 1000), null);
  });
});

function restore(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}
