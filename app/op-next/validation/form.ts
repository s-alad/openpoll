import { FieldError, FieldValues, Path, UseFormRegister } from "react-hook-form";


export type DefaultFormField = {
    type: string;
    error: FieldError | undefined;
    
    index?: number;
    placeholder?: string;
    disabled?: boolean;
    defaultvalue?: string | undefined;
    label?: string;
    inputstyle?: string;
};

// create class form ----------------------------------------------------------

export type CreateClassFormData = {
    classname: string;
    description: string;
};

export type ValidCreateClassFieldNames =
    | "classname"
    | "description"


export interface CreateClassFormField extends DefaultFormField {
    register: UseFormRegister<CreateClassFormData>;
    name: ValidCreateClassFieldNames;
};

<<<<<<< HEAD

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
=======
// polls -----------------------------------------------------------------------

// Generic interface for form fields
export interface GenericFormField<T extends FieldValues> extends DefaultFormField{
    register: UseFormRegister<T>;
    name: Path<T>;
    customregistername?: Path<string>;
}

// create multiple choice poll form -------------------------------------------

export type CreateMultipleChoicePollFormData = {
>>>>>>> c032a60 (RESTRUCTURE POLLS AND INPUT AND SCHEMA AND A LOT)
    question: string;
    options: {
        letter: string;
        option: string;
<<<<<<< HEAD
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
=======
    }[];
    answers: string[];
};

// create short answer poll form ----------------------------------------------

export type CreateShortAnswerFormData = {
    question: string;
    answers: string;
};
>>>>>>> c032a60 (RESTRUCTURE POLLS AND INPUT AND SCHEMA AND A LOT)
