# Automatización de la creación y validación de variables de entorno en Vite

## Creación Automatizada de Variables de Entorno con Plop

Plop es una herramienta de generación de código basada en prompts interactivos. Ayuda a generar código o archivos predefinidos en función de las respuestas a una serie de preguntas. En este caso, se usará Plop para automatizar la creación de variables de entorno y asegurar que siempre se añadan de acuerdo a una estructura definida.

## Consideraciones

EL sistema operativo en el cual se desarrollan los ejemplos es Widows, el proyecto se creó con `pnpm create vite@latest`, configurado para que use la librería React y el lenguaje TypeScript.

## Pasos a seguir

### **1. Estructura de carpetas**

Los ejemplos están estructurados de la siguiente forma.

```arduino
/validating-envVars
│
├── generator
│   ├── actions
│   │   └── envActions.ts
│   ├── config.ts
│   └── helpers
│        └── helpers.ts
│
├── src
│   ├── utils
│   │   ├── validate
│   │   │   ├── isValueUndefined.ts
│   │   │   ├── validateAllowedValues.ts
│   │   │   ├── validateEnv.ts
│   │   │   ├── validateRequired.ts
│   │   │   └── validateType.ts
│   │   └── envSchema.ts
│   │
│   └── App.tsx
│   └── main.tsx
│
├── .env
├── .env.development
└── .env.production
│
├── vite.config.ts
│
└── node_modules

```

### **2. Instala Plop, tsx y cross-env**

Plop es el generador de código, y tsx es necesario para cargar archivos TypeScript sin necesidad de compilarlos previamente. cross-env es útil para manejar variables de entorno de manera consistente entre sistemas operativos.

Ejecuta el siguiente comando para instalar las dependencias:

```bash
pnpm install --save-dev plop tsx cross-env
```

### **3. Configura el script de ejecución en `package.json`**

Dependiendo de la versión de Node.js que estés utilizando, debes configurar el script de ejecución de Plop en el archivo package.json:

- Para Node.js v20.6 y superior:

```json
"scripts": {
  "gen": "cross-env NODE_OPTIONS=\"--import tsx\" plop --plopfile=generator/config.ts"
}
```

- Para Node.js v20.5.1 y versiones anteriores:

```json
"scripts": {
  "gen": "cross-env NODE_OPTIONS=\"--loader tsx\" plop --plopfile=generator/config.ts"
}
```

### **4. Instalar tipos de Node.js**

Permite que TypeScript reconozca los tipos de las API de Node.js

```bash
pnpm install --save-dev @types/node
```

### **5. Generar variables de entorno Vite**

Archivo `config.ts`:

```javascript
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
```

En este código:

**1. Función Principal:** Se define la función que configura Plop, que recibe un objeto `plop` de tipo `NodePlopAPI`.

**2. Helpers:** Se itera sobre los helpers importados y se registran en Plop, lo que permite utilizarlos dentro de los templates de los generadores.

**3. Generador `env-var`:**

- **Descripción:** Se establece una descripción que explica la finalidad del generador.

- **Prompts:** Se definen varias preguntas que se le harán al usuario:

  - **Nombre de la variable:** Se valida que siga el formato `VITE*[A-Z*]`.

  - **Valor de la variable:** Pregunta por el valor a asignar.

  - **Descripción:** Se solicita una breve descripción de la variable.

  - **Requerido:** Se pregunta si la variable es obligatoria.

  - **Tipo de variable:** Se le da al usuario la opción de seleccionar el tipo de la variable (string, number, boolean).

  - **Valores permitidos:** Se pregunta si hay un conjunto de valores permitidos.

  - **Archivo `.env`:** Se permite al usuario seleccionar en qué archivo `.env` desea agregar la variable.

**5. Acciones:** Se especifican las acciones a realizar después de recoger la información, que son `appendEnvVariable` (agregar la variable al archivo `.env`) y `modifyEnvSchema` (modificar el esquema de la variable de entorno).

### **6. Acciones de la función Plop**

Archivo `envAction.ts`:

```javascript
export const appendEnvVariable = {
  type: "append",
  path: "../{{envFile}}",
  template: `# {{variableDescription}}\n{{variableName}}={{variableValue}}`,
};

export const modifyEnvSchema = {
  type: "modify",
  path: "../src/utils/envSchema.ts",
  pattern: /(export\s+const\s+envSchema\s*:\s*EnvSchema\s*=\s*{)/g,
  template: `$1
{{variableName}}: {
type: '{{variableType}}',
required: {{isRequired}},
message: "{{variableName}} es necesario para {{variableDescription}}.",
{{#if (and (eq variableType 'string') (not (eq variableType 'boolean')))}}
default: "{{defaultValue}}", 
{{/if}}
{{#if hasAllowedValues}}
  allowed: [
    {{#if (eq variableType 'string')}}
      {{#each allowedValues}}"{{this}}"{{#unless @last}}, {{/unless}}{{/each}}
    {{else}}
      {{#each allowedValues}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
    {{/if}}
  ],
{{/if}}
},`,
};
```

Estas acciones permiten al generador de `config.ts` agregar dinámicamente una nueva variable de entorno al archivo `.env` y modificar el esquema correspondiente en `envSchema.ts`, asegurando que el esquema de validación se mantenga actualizado y refleje las nuevas variables definidas.

### **7. Helpers necesarios para los templates**

Archivo `helpers.ts`

```javascript
export const helpers = {
  eq: (v1: string, v2: string) => v1 === v2,
  not: (value: boolean) => !value,
  and: (v1: boolean, v2: boolean) => v1 && v2,
};
```

Estos helpers permiten realizar operaciones lógicas en las plantillas y se usan para condicionar o personalizar la generación de código.

Una vez creado envSchema.ts se puede usar el siguiente comando para crear las variables de entorno y su esquema:

```bash
pnpm gen env-var
```

### **8. Verificar valores no válidos**

Archivo `isValueUndefined.ts`:

```javascript
export const isValueUndefined = (value: any) =>
  value === undefined || value === null || value === "";
```

Este archivo exporta una función llamada isValueUndefined que se utiliza para verificar si un valor está indefinido o es considerado vacío.

### **9. Validar valores permitidos**

Archivo `validateAllowedValues.ts`:

```javascript
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
```

En este código:

1. Si la configuración de la variable incluye un array de valores permitidos (`config.allowed`) y el valor no es `undefined`, se crea un Set de valores permitidos.

2. Luego, se comprueba si el valor actual no está dentro de este conjunto.

3. Si el valor no es permitido, se agrega un error con un mensaje que incluye los valores válidos.

### **10. Validar valor asignado**

Archivo `validateRequired.ts`:

```javascript
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
```

En este código:

1. Si la variable está marcada como requerida (`config.required` es `true`), la función verifica si su valor es `undefined`, `null` o una cadena vacía.

2. Si la condición anterior se cumple (es decir, no tiene un valor válido), se llama a la función `addError` para registrar un error.

3. El mensaje de error puede ser el especificado en `config.message`, o uno genérico indicando que la variable es requerida.

### **11. Validar tipo correcto**

Archivo `validateType.ts`:

```javascript
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
```

En este código:

1. Validadores por tipo:

- **number:** Convierte el valor a número. Si no se puede convertir (por ejemplo, si el valor es una cadena no numérica), se genera un error.

- **string:** Verifica si el valor es una cadena de texto. Si no lo es, se genera un error.

- **boolean:** Verifica si el valor es "true" o "false", y lo convierte a true o false respectivamente. Si no es ninguno de estos valores, se genera un error.

2. Se selecciona el validador adecuado según el tipo esperado (expectedType).

3. Si el tipo esperado no es válido o no está definido en el objeto de validadores, se genera un error indicando que el tipo es desconocido.

### **12. Validar variable**

Archivo `validateEnv.ts`:

Este archivo define la función validateEnv, que valida las variables de entorno en función de un esquema y el entorno actual (modo de ejecución).

```javascript
import { isValueUndefined } from "./isValueUndefined";
import { EnvSchema } from "../envSchema";
import { validateType } from "./validateType";
import { validateRequired } from "./validateRequired";
import { validateAllowedValues } from "./validateAllowedValues";

type Env = { [key: string]: string | number | boolean };

export const validateEnv = (env: Env, schema: EnvSchema, mode: string) => {
  const errors: { variable: string, reason: string }[] = [];

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

  // Devolver errores si los hay
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
```

**Pasos de la validación:**

**1. Recorrido del esquema:**

- Para cada variable definida en el esquema, se obtiene su configuración.

**2. Validación por entorno:**

- Si la variable está permitida en el entorno actual (mode), se procede con las validaciones.

**3. Validación de si es requerida:**

- Se usa la función validateRequired para verificar si la variable debe estar presente.

**4. Asignación de valor por defecto:**

- Si la variable no está definida y tiene un valor por defecto, se asigna ese valor.

**5. Validación del tipo:**

- Si el valor no es indefinido y el esquema define un tipo para la variable, se usa la función validateType para asegurarse de que el valor coincide con el tipo esperado.

**6. Validación de valores permitidos:**

- Si la variable tiene un conjunto de valores permitidos, se valida usando validateAllowedValues.

**7. Registro de errores:**

- Los errores encontrados durante las validaciones se acumulan en un array errors, y si al final de todas las validaciones hay errores, se lanza una excepción detallando cada uno.

Esta función asegura que las variables de entorno cumplen con las reglas definidas en el esquema, como ser del tipo correcto, tener un valor válido y estar presentes si son requeridas. Si alguna validación falla, se arroja un error detallado que describe las razones y variables afectadas.

### **13. Esquema de variables de entorno**

Archivo `envSchema.ts`:

```javascript
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
  VITE_API_URL: {
    type: "string",
    required: true,
    default: "",
    message: "VITE_API_URL es necesario para la URL de la API.",
    allowed: ["https://api.example.com", "https://staging.example.com"],
  },
  VITE_API_KEY: {
    type: "string",
    required: true,
    default: "",
    message: "VITE_API_KEY es necesario para la clave de la API.",
  },
};
```

El esquema especifica las reglas que cada variable de entorno debe cumplir en tu aplicación, como su tipo, si es requerida, los valores permitidos, y qué mensaje de error mostrar si falta.

### **14. Asegurar validación**

Archivo `vite.config.ts`:

```javascript
import { defineConfig, loadEnv } from "vite";
import { validateEnv } from "./src/utils/validate/validateEnv";
import { envSchema } from "./src/utils/envSchema";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  try {
    const env = loadEnv(mode, process.cwd());

    validateEnv(env, envSchema, mode);
    return {
      plugins: [react()],
    };
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
```

**1. `defineConfig`:**

- Es una función proporcionada por Vite para exportar su configuración de una manera tipada.
  Aquí, toma como parámetro el `mode` (el entorno de ejecución, como `development` o `production`).

**2. `loadEnv`:**

- Carga las variables de entorno para el modo actual (como `development` o `production`) desde los archivos `.env`, `.env.development`, `.env.production`, etc.

**3. `validateEnv`:**

- Valida las variables de entorno cargadas usando el esquema definido en `envSchema`. Si hay un error en la validación, el proceso se detiene.

**4. `envSchema`:**

- Contiene la definición de las variables de entorno esperadas y sus reglas de validación.

**5. Manejo de errores:**

- Si la validación falla, se captura el error, se imprime en la consola y el proceso de ejecución se detiene (`process.exit(1)`), evitando que la aplicación continúe con una configuración incorrecta.

Diagrama de flujo:

[![](https://mermaid.ink/img/pako:eNqNlMlu2zAQhl-F4NkJIseKLR9aOHEWZ3E2o4fKOkwk2mErkSpFuXENP0yOPfTUByhQv1iH1FIWudSAAJP6_5lvZihuaCwTRod0kcqv8TMoTWbjuSD4G4UTwWMuI7K3944ch6mE5FSsSAxqCSSFgqxAcXhKWUESRpjQUgkZVeZjazoJV5DyBDQzRtSlKWSQAMlBAaneqX9D1f4T6x-HE80USgr5pBhmTqBVYkLCUlLEzywDdFW-sfWdbn7_unalBVHsS8kU5nu_rZSnqCSPux_WcNaCPqCOK5aQFaoXPAZScCR0Y-ndKxa84AINkRNsKm2si_BECs1FidyxFMZc8GXJsUGsDdMCn1nPOQLPUGEEqVQkxwdTsFjLhvfc5Z2EI4wpMMMbfeTIa6LL8A4K1ELqkGDfsCOyBbm00isLkkszUWyHxAqUcjGuXIzrtm2zdc7qgZqp6DqE07jI8ddcN-FoqdgSyZhSsplybW_Brq12imAfTK04y5ypjGueyKKhmrpUty3VKMVTzRL0laxo8FZvokROkBrt7j-HaHy3laPhvbPLe-S9gDXJdq_O6W54713esbNXp38w7vJJVo2pfJXqwXU-hpMsVzzjqhGSNdGmLnM02CcWlzHf_RSR460zzMJZpbPl7b6_cP235RdVCWZBOzRDIfAEL4mN2ZlTjZ8cm9Mh_sXv9_OczsUWdVBq-bgWMR1qVbIOVbJcPtPhAtICV2VuJjLmsFSQtbsswbzqprqD7FXUoTmIj1JmTRhc0uGGvtDhXveovx94h95B3wsOBv5R0KFr3PaCoLt_4AV9P_B7XrfX72079JsN4e8PeoOe53cHvn941PV72z-_MJxH?type=png)](https://mermaid.live/edit#pako:eNqNlMlu2zAQhl-F4NkJIseKLR9aOHEWZ3E2o4fKOkwk2mErkSpFuXENP0yOPfTUByhQv1iH1FIWudSAAJP6_5lvZihuaCwTRod0kcqv8TMoTWbjuSD4G4UTwWMuI7K3944ch6mE5FSsSAxqCSSFgqxAcXhKWUESRpjQUgkZVeZjazoJV5DyBDQzRtSlKWSQAMlBAaneqX9D1f4T6x-HE80USgr5pBhmTqBVYkLCUlLEzywDdFW-sfWdbn7_unalBVHsS8kU5nu_rZSnqCSPux_WcNaCPqCOK5aQFaoXPAZScCR0Y-ndKxa84AINkRNsKm2si_BECs1FidyxFMZc8GXJsUGsDdMCn1nPOQLPUGEEqVQkxwdTsFjLhvfc5Z2EI4wpMMMbfeTIa6LL8A4K1ELqkGDfsCOyBbm00isLkkszUWyHxAqUcjGuXIzrtm2zdc7qgZqp6DqE07jI8ddcN-FoqdgSyZhSsplybW_Brq12imAfTK04y5ypjGueyKKhmrpUty3VKMVTzRL0laxo8FZvokROkBrt7j-HaHy3laPhvbPLe-S9gDXJdq_O6W54713esbNXp38w7vJJVo2pfJXqwXU-hpMsVzzjqhGSNdGmLnM02CcWlzHf_RSR460zzMJZpbPl7b6_cP235RdVCWZBOzRDIfAEL4mN2ZlTjZ8cm9Mh_sXv9_OczsUWdVBq-bgWMR1qVbIOVbJcPtPhAtICV2VuJjLmsFSQtbsswbzqprqD7FXUoTmIj1JmTRhc0uGGvtDhXveovx94h95B3wsOBv5R0KFr3PaCoLt_4AV9P_B7XrfX72079JsN4e8PeoOe53cHvn941PV72z-_MJxH)
