import { z } from 'zod';

// Define your base poll using z.object to ensure it returns a ZodObject
const basePollSchema = z.object({
    type: z.enum(['short', 'mc']),
    question: z.string().min(1).max(200),
    answers: z.array(z.string())
});

// Extend the base schema for the short answer poll
const shortAnswerSchema = basePollSchema.extend({
    type: z.literal('short'),
});

// Extend the base schema for the multiple choice poll
const multipleChoiceSchema = basePollSchema.extend({
    type: z.literal('mc'),
    options: z.array(z.object({
        letter: z.string().min(1),
        option: z.string().min(1).max(200),
    })).min(2).max(10),
});


// Define the ordering poll schema
const orderingSchema = basePollSchema.extend({
    type: z.literal('ordering'),
    options: z.array(z.object({
        number: z.string().min(1),
        option: z.string().min(1).max(200),
    })).min(2).max(10),
});


// Union the short answer and multiple choice schemas to cover all poll types
export const pollSchema = z.discriminatedUnion('type', [shortAnswerSchema, multipleChoiceSchema, orderingSchema]);

// Using ZodType for type annotation
type BasePoll = z.infer<typeof basePollSchema>;
type ShortAnswerPoll = z.infer<typeof shortAnswerSchema>;
type MultipleChoicePoll = z.infer<typeof multipleChoiceSchema>;
type OrderingPoll = z.infer<typeof orderingSchema>;

export type PollV = z.infer<typeof pollSchema>;