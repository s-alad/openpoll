import { z } from 'zod';

// Define your base poll using z.object to ensure it returns a ZodObject
const basePollSchema = z.object({
    type: z.enum(['shortAnswer', 'multipleChoice']),
    question: z.string().min(1).max(200),
});

// Extend the base schema for the short answer poll
const shortAnswerSchema = basePollSchema.extend({
    type: z.literal('shortAnswer'),
    answers: z.string().min(1).max(200).optional(),
});

// Extend the base schema for the multiple choice poll
const multipleChoiceSchema = basePollSchema.extend({
    type: z.literal('multipleChoice'),
    options: z.array(z.object({
        letter: z.string().min(1),
        option: z.string().min(1).max(200),
    })).min(2).max(10),
    answers: z.array(z.string()).min(1),
});

// Union the short answer and multiple choice schemas to cover all poll types
export const pollSchema = z.discriminatedUnion('type', [shortAnswerSchema, multipleChoiceSchema]);

// Using ZodType for type annotation
type BasePoll = z.infer<typeof basePollSchema>;
type ShortAnswerPoll = z.infer<typeof shortAnswerSchema>;
type MultipleChoicePoll = z.infer<typeof multipleChoiceSchema>;
export type PollV = z.infer<typeof pollSchema>;