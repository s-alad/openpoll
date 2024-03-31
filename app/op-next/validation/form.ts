import { FieldError, UseFormRegister } from "react-hook-form";
import { z } from "zod";
import { createPollSchema } from "./schema";

export type createclassformdata = {
    classname: string;
    description: string;
};

export type ValidCreateClassFieldNames =
    | "classname"
    | "description"


export interface createclassformfield extends defaultformfield {
    register: UseFormRegister<createclassformdata>;
    name: ValidCreateClassFieldNames;
};


export type createshortanswerformdata = {
    question: string;
    answers?: string;
};

export type ValidCreateShortAnswerFieldNames =
    | "question"
    | "answers"

export interface createshortanswerformfield extends defaultformfield {
    register: UseFormRegister<createshortanswerformdata>;
    name: ValidCreateShortAnswerFieldNames;
};

export type createattendanceformdata = {
    date: Date;
    attended: string[];
};

export type ValidCreateAttendanceFieldNames =
    | "date"
    | "attended"

export interface createattendanceformfield extends defaultformfield {
    register: UseFormRegister<createattendanceformdata>;
    name: ValidCreateAttendanceFieldNames;
};


export type createpollformdata = {
    question: string;
    options: {
        letter: string;
        option: string;
    }[]
    answers: string[];
};

export type ValidCreatePollFieldNames =
    | "question"
    | "options"
    | "answers"

export interface createpollformfield extends defaultformfield {
    register: UseFormRegister<createpollformdata>;
    name: ValidCreatePollFieldNames;
};

export type defaultformfield = {
    type: string;
    placeholder?: string;
    error: FieldError | undefined;
    valueAsNumber?: boolean;
    disabled?: boolean;
    defaultvalue?: string | undefined;
    description?: string;
    options?: string[] | number[];
};