import { describe, it, expect } from "vitest";
import { DepartmentSchema } from "../../lib/validations/journal";

describe("Department Schema Validation", () => {
  it("validates a correct custom department payload", () => {
    const valid = {
      name: "Herbology & Botanicals",
      slug: "herbology-botanicals",
      description: "Studies of rare Flora, mandrakes, and enchanted garden lore.",
      icon: "Feather",
      accentColor: "#10B981",
    };
    const result = DepartmentSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("fails when department name is empty or missing", () => {
    expect(DepartmentSchema.safeParse({ name: "" }).success).toBe(false);
    expect(DepartmentSchema.safeParse({}).success).toBe(false);
  });

  it("fails when department description exceeds 500 characters", () => {
    const tooLong = {
      name: "Divination Archives",
      description: "A".repeat(501),
    };
    expect(DepartmentSchema.safeParse(tooLong).success).toBe(false);
  });
});
