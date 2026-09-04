import { describe, expect, it } from "vitest";
import {
  createAppointmentSchema,
  customerDetailsSchema,
} from "@/schemas/booking";

const validCustomer = {
  firstName: "Marta",
  lastName: "Silva",
  email: "marta@example.pt",
  phone: "+351 912 345 678",
  privacyAccepted: true,
};

describe("customerDetailsSchema", () => {
  it("accepts and normalizes valid Portuguese contact details", () => {
    const result = customerDetailsSchema.parse(validCustomer);
    expect(result.phone).toBe("+351912345678");
  });

  it("rejects privacy consent when it is not accepted", () => {
    expect(() =>
      customerDetailsSchema.parse({ ...validCustomer, privacyAccepted: false }),
    ).toThrow();
  });
});

describe("createAppointmentSchema", () => {
  it("rejects malformed service identifiers", () => {
    expect(() =>
      createAppointmentSchema.parse({
        ...validCustomer,
        serviceId: "not-an-id",
        professionalId: "any",
        date: "2026-09-12",
        startTime: "10:30",
      }),
    ).toThrow();
  });
});
