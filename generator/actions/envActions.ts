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
