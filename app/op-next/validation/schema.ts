import { z, ZodEnum, ZodType } from "zod"; // Add new import
<<<<<<< HEAD
<<<<<<< HEAD
import { createclassformdata, createpollformdata, createshortanswerformdata, createattendanceformdata } from "./form";
=======
import { CreateClassFormData, CreateMultipleChoicePollFormData, CreateShortAnswerFormData } from "./form";
>>>>>>> c032a60 (RESTRUCTURE POLLS AND INPUT AND SCHEMA AND A LOT)
=======
import { CreateClassFormData, CreateMultipleChoicePollFormData, CreateOrderingPollFormData, CreateShortAnswerPollFormData } from "./form";
>>>>>>> a7d8adb (start ordering poll)

export const createClassSchema: ZodType<CreateClassFormData> = z
    .object({
        classname: z.string().min(2, "Class name must be at least 2 characters").max(50, "class name must be between 2 and 50 characters"),
        description: z.string().max(200, "Description must be between 10 and 200 characters"),
    })

export const createMultipleChoicePollData: ZodType<CreateMultipleChoicePollFormData> = z
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

export const createShortAnswerPollSchema: ZodType<CreateShortAnswerPollFormData> = z
    .object({
        question: z.string().min(1, "Question must be at least 2 characters").max(200, "Question must be between 1 and 200 characters"),
<<<<<<< HEAD
<<<<<<< HEAD
        answers: z.optional(z.string().min(1, "Answer must be at least 2 characters").max(200, "Answer must be between 1 and 200 characters"))
    })

export const createAttendanceSchema: ZodType<createattendanceformdata> = z
.object({
    date: z.date(),
    attended: z.array(z.string()).min(1, "Poll must have at least 1 answer")
});
=======
        answers: z.string()
    })
>>>>>>> c032a60 (RESTRUCTURE POLLS AND INPUT AND SCHEMA AND A LOT)
=======
        answer: z.string()
    })

export const createOrderingPollSchema: ZodType<CreateOrderingPollFormData> = z
    .object({
        question: z.string().min(1, "Question must be at least 2 characters").max(200, "Question must be between 1 and 200 characters"),
        options: z.array(
            z.object({
                letter: z.string(),
                option: z.string().min(1, "Option must be at least 2 characters").max(200, "Option must be between 1 and 200 characters")
            })
        ).min(2, "Poll must have at least 2 options").max(10, "Poll must have at most 10 options"),
<<<<<<< HEAD
        answer: z.object({
            index: z.number(),
            choice: z.number()
        })
    })
>>>>>>> a7d8adb (start ordering poll)
=======
        answer: z.record(z.object({
            letter: z.string(),
            option: z.string(),
        }))
    })
>>>>>>> 73428b0 (add ordering poll)
