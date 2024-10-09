import { EnvVariableType } from "../envSchema";

export const validateType = (
  variable: string,
  value: any,
  expectedType: EnvVariableType,
  addError: (variable: string, reason: string) => void,
  env: { [key: string]: any }
) => {
  const validators = {
    number: (value: any) => {
      const numberValue = Number(value);
      if (isNaN(numberValue)) {
        addError(variable, `${variable} debe ser un número.`);
      } else {
        env[variable] = numberValue;
      }
    },
    string: (value: any) => {
      if (typeof value !== "string") {
        addError(variable, `${variable} debe ser una cadena de texto.`);
      }
    },
    boolean: (value: any) => {
      if (value !== "true" && value !== "false") {
        addError(variable, `${variable} debe ser un booleano (true o false).`);
      } else {
        env[variable] = value === "true";
      }
    },
  };

  const validate = validators[expectedType];
  if (validate) {
    validate(value);
  } else {
    addError(variable, `Tipo de variable desconocido: ${expectedType}.`);
  }
};
