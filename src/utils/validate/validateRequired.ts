import { EnvVariable } from "../envSchema";

export const validateRequired = (
  variable: string,
  value: any,
  config: EnvVariable,
  addError: (variable: string, reason: string) => void
) => {
  if (
    config.required &&
    (value === undefined || value === null || value === "")
  ) {
    addError(variable, config.message || `${variable} es requerido.`);
  }
};
