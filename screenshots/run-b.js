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
  async function solvePass(term) {
    await exact(term);
    await has("Passar " + term);
  }

  await solvePass("6");
  c.must("2x = 14");
  await exact("÷ 2");
  c.must("x = 7");
  await exact("Seguir");

  c.must("recuperaram 8");
  await solvePass("-8");
  c.must("x = 21");
  await exact("Seguir");

  c.must("aquecimento");
  await solvePass("4");
  await exact("÷ 3");
  c.must("x = 5");
  await exact("Seguir");

  c.must("Duas baias");
  await exact("÷ 2");
  c.must("x + 5 = 12");
  await solvePass("5");
  c.must("x = 7");
  await exact("Seguir");

  c.must("empatam");
  await solvePass("2x");
  await solvePass("3");
  await exact("÷ 2");
  c.must("x = 6");
  await exact("Seguir");

  c.must("160 operações");
  await has("15n + 40 = 160");
  c.must("Agora isola");
  await solvePass("40");
  await exact("÷ 15");
  c.must("n = 8");
  await exact("Seguir");

  c.must("Linha em ritmo");
  c.must("PARA A PRÓXIMA AULA");
  return "turno-fechado";
})();
