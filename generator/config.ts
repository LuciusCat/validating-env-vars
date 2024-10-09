import { NodePlopAPI } from "plop";
import { helpers } from "./helpers/helpers";
import { appendEnvVariable, modifyEnvSchema } from "./actions/envActions";

export default function (plop: NodePlopAPI) {
  Object.entries(helpers).forEach(([name, fn]) => plop.setHelper(name, fn));

  plop.setGenerator("env-var", {
    description: "Crear una nueva variable de entorno en el archivo .env",
    prompts: [
      {
        type: "input",
        name: "variableName",
        message: "¿Cuál es el nombre de la variable de entorno?",
        validate: (input: string) => {
          const regex = /^VITE_[A-Z_]+$/;
          return regex.test(input)
            ? true
            : "El nombre de la variable debe empezar con VITE_, estar en mayúsculas y usar guiones bajos.";
        },
      },
      {
        type: "input",
        name: "variableValue",
        message: "¿Cuál es el valor de la variable de entorno?",
        default: "",
      },
      {
        type: "input",
        name: "variableDescription",
        message: "Proporciona una breve descripción de esta variable:",
      },
      {
        type: "confirm",
        name: "isRequired",
        message: "¿Es esta variable de entorno requerida?",
        default: true,
      },
      {
        type: "list",
        name: "variableType",
        message: "Selecciona el tipo de la variable de entorno:",
        choices: ["string", "number", "boolean"],
        default: "string",
      },
      {
        type: "confirm",
        name: "hasAllowedValues",
        message: "¿Esta variable tiene un conjunto de valores permitidos?",
        default: false,
      },
      {
        type: "input",
        name: "allowedValues",
        message: "Especifica los valores permitidos (separados por comas):",
        when: (answers: any) => answers.hasAllowedValues,
        filter: (input: string) => input.split(",").map((val) => val.trim()),
      },
      {
        type: "list",
        name: "envFile",
        message:
          "Selecciona el archivo .env en el que deseas agregar la variable:",
        choices: [".env", ".env.development", ".env.production"],
      },
    ],
    actions: [appendEnvVariable, modifyEnvSchema],
  });
}
