import { FieldError, UseFormRegister } from "react-hook-form";

export type formdata = {
    classname: string;
    description: string;
};

export type formfield = {
    register: UseFormRegister<formdata>;
    type: string;
    placeholder?: string;
    name: ValidFieldNames;
    error: FieldError | undefined;
    valueAsNumber?: boolean;
    disabled?: boolean;
    defaultvalue?: string | undefined;
    description?: string;
    options?: string[] | number[];
};


export type ValidFieldNames =
    | "classname"
    | "description"