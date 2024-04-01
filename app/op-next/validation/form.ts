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

// polls -----------------------------------------------------------------------

// Generic interface for form fields
export interface GenericFormField<T extends FieldValues> extends DefaultFormField{
    register: UseFormRegister<T>;
    name: Path<T>;
    customregistername?: Path<string>;
}

// create multiple choice poll form -------------------------------------------

export type CreateMultipleChoicePollFormData = {
    question: string;
    options: {
        letter: string;
        option: string;
    }[];
    answers: string[];
};

// create short answer poll form ----------------------------------------------

export type CreateShortAnswerPollFormData = {
    question: string;
    answer: string;
};

// create ordering poll form

export type CreateOrderingPollFormData = {
    question: string;
    options: {
        number: number;
        option: string;
    }[];
    answer: {
        [index: number]: [choice: number]
    }
};