import { EnvVariable } from "../envSchema";

export const validateAllowedValues = (
  variable: string,
  value: any,
  config: EnvVariable,
  addError: (variable: string, reason: string) => void
) => {
  if (Array.isArray(config.allowed) && value !== undefined) {
    const allowedSet = new Set(config.allowed);
    if (!allowedSet.has(value)) {
      addError(
        variable,
        `${variable} debe ser uno de los siguientes valores: ${Array.from(
          allowedSet
        ).join(", ")}.`
      );
    }
  }
};
