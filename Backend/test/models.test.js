import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import app from "../src/app.js";
import { getLoginStatus } from "../src/controllers/auth.controller.js";
import { updateAppointmentStatus } from "../src/controllers/appointments.controller.js";
import appointmentModel from "../src/models/appointments.model.js";
import userModel from "../src/models/users.model.js";
import { DEFAULT_DOCTOR_AVAILABILITY, isDoctorAvailable } from "../src/utils/availability.js";

test("login distinguishes inactive accounts from invalid credentials", async () => {
    const password = "correct-password";
    const user = {
        password: await bcrypt.hash(password, 4),
        isActive: false
    };

    assert.equal(await getLoginStatus(user, password), "deactivated");
    assert.equal(await getLoginStatus({ ...user, isActive: true }, password), "active");
    assert.equal(await getLoginStatus(user, "wrong-password"), "invalid");
    assert.equal(await getLoginStatus(null, password), "invalid");
});

test("doctor availability only allows configured weekdays and times", () => {
    const schedule = {
        availableDays: ["Monday", "Wednesday"],
        startTime: "09:00",
        endTime: "17:00"
    };

    assert.equal(isDoctorAvailable(schedule, "2030-06-17", "09:00"), true);
    assert.equal(isDoctorAvailable(schedule, "2030-06-17", "16:59"), true);
    assert.equal(isDoctorAvailable(schedule, "2030-06-17", "17:00"), false);
    assert.equal(isDoctorAvailable(schedule, "2030-06-18", "10:00"), false);
    assert.equal(isDoctorAvailable(schedule, "invalid-date", "10:00"), false);
    assert.equal(isDoctorAvailable(undefined, "2030-06-17", "10:00"), true);
    assert.equal(isDoctorAvailable(undefined, "2030-06-22", "10:00"), false);
});

test("doctor cannot reject an appointment without a decline reason", async () => {
    const response = {
        statusCode: 0,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        }
    };

    await updateAppointmentStatus(
        { body: { status: "rejected" }, params: { id: "invalid-id" }, user: { id: "doctor-id" } },
        response
    );

    assert.equal(response.statusCode, 400);
    assert.match(response.body.message, /decline reason is required/i);
});

test("API keeps role-specific routes protected and validates public registration", async t => {
    const server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    t.after(() => new Promise(resolve => server.close(resolve)));
    const base = `http://127.0.0.1:${server.address().port}`;

    const healthResponse = await fetch(`${base}/api/health`);
    assert.equal(healthResponse.status, 200);
    assert.equal(healthResponse.headers.get("x-content-type-options"), "nosniff");
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

    const hostedOrigin = await fetch(`${base}/api/health`, {
        headers: { origin: "https://final-hackathon-practice-q631.vercel.app" }
    });
    assert.equal(hostedOrigin.status, 200);
    assert.equal(hostedOrigin.headers.get("access-control-allow-origin"), "https://final-hackathon-practice-q631.vercel.app");
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
    assert.deepEqual(doctor.availability.availableDays, DEFAULT_DOCTOR_AVAILABILITY.availableDays);
});

test("appointment model validates slot time and allowed statuses", async () => {
    const appointment = new appointmentModel({
        patient: new mongoose.Types.ObjectId(),
        doctor: new mongoose.Types.ObjectId(),
        appointmentDate: new Date("2030-06-15T00:00:00.000Z"),
        appointmentTime: "09:30",
        reason: "Annual checkup",
        status: "pending",
        cancellationReason: "Cancelled because the doctor is not available at this time.",
        rejectionReason: "The doctor is unavailable at the requested time."
    });
    await appointment.validate();
    assert.equal(
        appointment.cancellationReason,
        "Cancelled because the doctor is not available at this time."
    );
    assert.equal(appointment.rejectionReason, "The doctor is unavailable at the requested time.");

    appointment.appointmentTime = "9:30";
    appointment.status = "confirmed";
    const error = await appointment.validate().then(() => null, validationError => validationError);
    assert.ok(error.errors.appointmentTime);
    assert.ok(error.errors.status);
});
