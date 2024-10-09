export type EnvVariableType = "string" | "number" | "boolean";

export interface EnvVariable {
  type: EnvVariableType;
  required: boolean;
  environments?: string[];
  message?: string;
  default?: string | number | boolean;
  allowed?: (string | number | boolean)[];
}

export interface EnvSchema {
  [key: string]: EnvVariable;
}

export const envSchema: EnvSchema = {
VITE_BOOLEAN: {
type: 'boolean',
required: true,
message: "VITE_BOOLEAN es necesario para verificar boolean.",
  allowed: [
      true, false
  ],
},
  VITE_API: {
    type: "string",
    required: true,
    message: "VITE_API es necesario para validar pagina youtube.",
    default: "",
  },
};
