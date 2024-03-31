import { FieldError, UseFormRegister } from "react-hook-form";
import { z } from "zod";
import { createPollSchema } from "./schema";


export type DefaultFormField = {
    type: string;
    error: FieldError | undefined;
    
    placeholder?: string;
    disabled?: boolean;
    defaultvalue?: string | undefined;
    description?: string;
};

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