import { z, ZodEnum, ZodType } from "zod"; // Add new import
import { formdata } from "./form";

export const matchschema: ZodType<formdata> = z
    .object({
        classname: z.string().min(2, "Class name must be at least 2 characters").max(50, "class name must be between 2 and 50 characters"),
        description: z.string().max(200, "Description must be between 10 and 200 characters"),
    })