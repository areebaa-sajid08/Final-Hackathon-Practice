import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import mongoose from "mongoose";
import app from "../src/app.js";
import appointmentModel from "../src/models/appointments.model.js";
import userModel from "../src/models/users.model.js";

test("API keeps role-specific routes protected and validates public registration", async t => {
    const server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    t.after(() => new Promise(resolve => server.close(resolve)));
    const base = `http://127.0.0.1:${server.address().port}`;

    assert.equal((await fetch(`${base}/api/health`)).status, 200);
    assert.equal((await fetch(`${base}/api/appointments/my`)).status, 401);
    assert.equal((await fetch(`${base}/api/admin/stats`)).status, 401);

    const invalidRegistration = await fetch(`${base}/api/auth/register`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Sam Patient", email: "sam@example.com", password: "password123", role: "admin" })
    });
    assert.equal(invalidRegistration.status, 400);

    const blockedOrigin = await fetch(`${base}/api/health`, {
        headers: { origin: "https://untrusted.example" }
    });
    assert.equal(blockedOrigin.status, 403);
});

test("user model accepts clinic roles and requires doctor details", async () => {
    const patient = new userModel({
        name: "Sam Patient",
        email: "sam@example.com",
        password: "hashed-password",
        role: "patient"
    });
    await patient.validate();
    assert.equal(Object.hasOwn(patient.toJSON(), "password"), false);

    const doctor = new userModel({
        name: "Alex Doctor",
        email: "alex@example.com",
        password: "hashed-password",
        role: "doctor"
    });
    const error = await doctor.validate().then(() => null, validationError => validationError);
    assert.ok(error.errors.specialization);
    assert.ok(error.errors.experience);
});

test("appointment model validates slot time and allowed statuses", async () => {
    const appointment = new appointmentModel({
        patient: new mongoose.Types.ObjectId(),
        doctor: new mongoose.Types.ObjectId(),
        appointmentDate: new Date("2030-06-15T00:00:00.000Z"),
        appointmentTime: "09:30",
        reason: "Annual checkup",
        status: "pending"
    });
    await appointment.validate();

    appointment.appointmentTime = "9:30";
    appointment.status = "confirmed";
    const error = await appointment.validate().then(() => null, validationError => validationError);
    assert.ok(error.errors.appointmentTime);
    assert.ok(error.errors.status);
});
