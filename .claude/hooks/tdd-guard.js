// PreToolUse hook (Edit|Write) that enforces the TDD role separation between agents.
//   node tdd-guard.js tests       -> only test files may be written (test-writer agents)
//   node tdd-guard.js production  -> test files may not be written (implementer agents)
// Exit 2 blocks the tool call and shows stderr to the agent.

const mode = process.argv[2];

const isTestFile = (path) =>
  /\/waggo-api\/Tests\//i.test(path) ||
  /\/waggo-mobile\/src\/.+\.test\.tsx?$/i.test(path) ||
  /\/waggo-mobile\/src\/test\//i.test(path);

let raw = '';
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(raw || '{}');
  } catch {
    process.exit(0);
  }

  const path = String(input.tool_input?.file_path ?? '').replace(/\\/g, '/');
  if (!path) process.exit(0);

  if (mode === 'tests' && !isTestFile(path)) {
    console.error(
      `TDD guard: los agentes de pruebas solo escriben pruebas. Bloqueado: ${path}\n` +
        'Si la prueba necesita tipos o métodos que no existen, déjala sin compilar: no compilar también es rojo. ' +
        'Rutas permitidas: waggo-api/Tests/**, waggo-mobile/src/**/*.test.ts(x), waggo-mobile/src/test/**.',
    );
    process.exit(2);
  }

  if (mode === 'production' && isTestFile(path)) {
    console.error(
      `TDD guard: los implementadores no modifican pruebas. Bloqueado: ${path}\n` +
        'Si una prueba parece incorrecta, no la cambies: explica el problema en tu informe para que la revise el agente de pruebas.',
    );
    process.exit(2);
  }

  process.exit(0);
});
