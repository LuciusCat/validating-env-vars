import { isValueUndefined } from "./isValueUndefined";
import { EnvSchema } from "../envSchema";
import { validateType } from "./validateType";
import { validateRequired } from "./validateRequired";
import { validateAllowedValues } from "./validateAllowedValues";

type Env = { [key: string]: string | number | boolean };

export const validateEnv = (env: Env, schema: EnvSchema, mode: string) => {
  const errors: { variable: string; reason: string }[] = [];

  const addError = (variable: string, reason: string) => {
    errors.push({ variable, reason });
  };

  Object.keys(schema).forEach((variable) => {
    const config = schema[variable];

    if (!config.environments || config.environments.includes(mode)) {
      let value = env[variable];

      validateRequired(variable, value, config, addError);

      // Asignar valor por defecto si no está definido
      if (isValueUndefined(value) && config.default !== undefined) {
        env[variable] = config.default;
        value = config.default;
      }

      // Validar el tipo
      if (!isValueUndefined(value) && config.type) {
        validateType(variable, value, config.type, addError, env);
        value = env[variable];
      }

      // Validar valores permitidos
      validateAllowedValues(variable, value, config, addError);
    }
  });

  if (errors.length > 0) {
    const errorDetails = errors
      .map(
        (error) => `
Variable: ${error.variable}
Razón: ${error.reason}\n`
      )
      .join("\n");

    throw new Error(
      `Errores en la validación de variables de entorno:\n${errorDetails}`
    );
  }

  return env;
};
