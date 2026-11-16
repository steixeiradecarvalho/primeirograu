(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const c = window.__c;
  async function exact(label) {
    c.clickExact(label);
    await sleep(90);
  }
  async function has(label) {
    c.clickIncludes(label);
    await sleep(90);
  }

  await has("Leitura");
  c.must("30 transações");
  await exact("30s");
  await exact("12");
  await exact("É esta");
  c.must("coeficiente");
  await exact("Seguir");

  c.must("desistem");
  await exact("2c");
  await exact("-5");
  await exact("É esta");
  c.must("Dobro");
  await exact("Seguir");

  c.must("3 caixas");
  await exact("3(p + 2)");
  await exact("É esta");
  c.must("parêntese");
  await exact("Seguir");

  c.must("s = 4");
  await exact("1");
  await exact("3");
  await exact("2");
  await exact("Ver se fecha");
  c.must("lugar esperando");
  await exact("Seguir");

  c.must("p = 5");
  await exact("2");
  await exact("1");
  await exact("Ver se fecha");
  c.must("manda a ordem");
  await exact("Seguir");

  c.must("incógnita");
  await exact("Ver isso na linha");

  await exact("Tirar 9 dos dois lados");
  c.must("n = 12");
  await exact("Seguir");

  await exact("Dividir os dois lados por 4");
  c.must("t = 7");
  await exact("Seguir");

  c.must("Dois lotes");
  return "at-free";
})();
