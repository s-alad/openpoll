import { z, ZodEnum, ZodType } from "zod"; // Add new import
import { createclassformdata, createpollformdata, createshortanswerformdata } from "./form";

export const createClassSchema: ZodType<createclassformdata> = z
    .object({
        classname: z.string().min(2, "Class name must be at least 2 characters").max(50, "class name must be between 2 and 50 characters"),
        description: z.string().max(200, "Description must be between 10 and 200 characters"),
    })

export const createPollSchema: ZodType<createpollformdata> = z
    .object({
        question: z.string().min(1, "Question must be at least 2 characters").max(200, "Question must be between 1 and 200 characters"),
        options: z.array(
            z.object({
                letter: z.string(),
                option: z.string().min(1, "Option must be at least 2 characters").max(200, "Option must be between 1 and 200 characters")
            })
        ).min(2, "Poll must have at least 2 options").max(10, "Poll must have at most 10 options"),
        answers: z.array(z.string()).min(1, "Poll must have at least 1 answer")
    })
