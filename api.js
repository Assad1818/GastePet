// api.js
// função principal: calcularGastosDetalhados(petProfile)
// petProfile: { especie, raca, idade (anos number), porte, alimentacao: { tipo, gastoMensal? }, vet: { freqAno, custoConsulta? }, vacinas: { status, lista[], custoAnual? }, tosa: { faz, freq, custoPorTosa? }, higieneMensal?, medicamentos: { faz, lista[], custoMensal? }, acessorios: [{ nome, custoAnual }], servicos: [{ nome, frequencia, custo }] }

export async function calcularGastosDetalhados(pet) {
  // pequena latência simulada
  await new Promise(r => setTimeout(r, 200));

  const idade = Number(pet.idade) || 0;
  const porte = (pet.porte || 'medio').toLowerCase();
  const especie = (pet.especie || '').toLowerCase();

  // ---------- Ração: base por espécie/raça (valores mais modestos) ----------
  const baseRacaoEspecie = {
    cachorro: {
      default: 150,
      // raças mais "gulosas" ou maiores podem consumir mais
      Labrador: 180, 'Golden Retriever': 185, Rottweiler: 220, 'Pastor Alemão': 200, Husky: 200, 'Shiba Inu': 170,
      Poodle: 150, Bulldog: 160, 'Bulldog Francês': 160, Vira: 120, 'Vira Lata': 120
    },
    gato: {
      default: 90,
      Persa: 110, Siamês: 100, 'Maine Coon': 140, Bengal: 120, 'British Shorthair': 115, 'Vira Lata': 80
    },
    ave: {
      default: 40,
      Calopsita: 35, Periquito: 25, Papagaio: 70, Canário: 25, Agapornis: 30
    }
  };

  let racaoBase = 100;
  if (especie === 'cachorro') {
    const map = baseRacaoEspecie.cachorro;
    racaoBase = map[pet.raca] || map[pet.raca?.trim()] || map.default;
  } else if (especie === 'gato') {
    const map = baseRacaoEspecie.gato;
    racaoBase = map[pet.raca] || map.default;
  } else if (especie === 'ave') {
    const map = baseRacaoEspecie.ave;
    racaoBase = map[pet.raca] || map.default;
  } else {
    racaoBase = 120;
  }

  // se o usuário forneceu gasto mensal real, respeitar
  let racaoMensal = pet.alimentacao?.gastoMensal ? Number(pet.alimentacao.gastoMensal) : null;
  if (!racaoMensal) {
    // ajustar por idade e porte
    if (idade <= 1) racaoBase *= 1.15; // filhote come mais proporcionalmente
    else if (idade > 8) racaoBase *= 0.85; // idoso come menos
    switch (porte) {
      case 'pequeno': racaoBase *= 0.8; break;
      case 'medio': racaoBase *= 1; break;
      case 'grande': racaoBase *= 1.4; break;
      default: racaoBase *= 1;
    }
    // ajuste por tipo de alimentação (premium etc)
    const tipo = (pet.alimentacao?.tipo || '').toLowerCase();
    if (tipo.includes('premium') && !tipo.includes('super')) racaoBase *= 1.2;
    if (tipo.includes('super premium')) racaoBase *= 1.4;
    if (tipo.includes('natural')) racaoBase *= 1.6;
    if (tipo.includes('medicamentosa')) racaoBase *= 1.2;
    if (tipo.includes('sementes')) racaoBase *= 0.5; // aves que comem sementes
    racaoMensal = Math.max( Math.round(racaoBase), 20 );
  } else racaoMensal = Number(racaoMensal);

  // ---------- Vacinas ----------
  // se custo anual informado, usar; senão estimar realisticamente por espécie
  let vacinasAnual = pet.vacinas?.custoAnual ? Number(pet.vacinas.custoAnual) : null;
  if (!vacinasAnual) {
    if (especie === 'cachorro') vacinasAnual = idade < 1 ? 350 : 180; // filhote tem séries iniciais maiores
    else if (especie === 'gato') vacinasAnual = idade < 1 ? 220 : 120;
    else if (especie === 'ave') vacinasAnual = pet.vacinas?.status === 'Sim' ? 60 : 30;
    else vacinasAnual = 100;
  }
  const vacinasMensal = vacinasAnual / 12;

  // ---------- Banho / Petshop ----------
  // custo por banho depende do porte; se usuário informou custo por tosa/banho usar
  let banhoMensal = 0;
  if (pet.banho) {
    // pet.banho aqui é o campo de tosa/banho e petshop -> we keep tosa separate below
    // We'll calculate 'banho' (petshop) via tosa / banho combined: if tosa.faz true, include cost; else minimal grooming cost
  }
  // se usuário informou higiene mensal total (areia/banho etc), respeitar parcialmente
  const higieneUsuario = pet.higieneMensal ? Number(pet.higieneMensal) : null;

  // PETSHOP (banho+serviços de higiene):
  // base por porte
  let banhoBase = 0;
  switch (porte) {
    case 'pequeno': banhoBase = 35; break;
    case 'medio': banhoBase = 55; break;
    case 'grande': banhoBase = 75; break;
    default: banhoBase = 50;
  }
  // se tosa faz e custo informado
  let tosaMensal = 0;
  if (pet.tosa?.faz) {
    const freq = (pet.tosa.freq || 'mensal').toLowerCase();
    let multipl = 1;
    if (freq === 'semanal') multipl = 4;
    else if (freq === 'quinzenal') multipl = 2;
    else if (freq === 'mensal') multipl = 1;
    else if (freq === 'bimestral') multipl = 0.5;
    const custoPorTosa = pet.tosa?.custoPorTosa ? Number(pet.tosa.custoPorTosa) : Math.max(40, banhoBase * 0.8);
    tosaMensal = custoPorTosa * multipl;
  }

  // Banho: assume banho mensal (1/mês) a menos que informado em serviços extras
  const custoBanhoUnit = pet.banhoCustoUnit ? Number(pet.banhoCustoUnit) : banhoBase;
  const freqBanho = pet.banhoFreq ? pet.banhoFreq : 'mensal'; // possivel campo - se nao, 1/mês
  let banhoFreqMult = 1;
  if (freqBanho === 'semanal') banhoFreqMult = 4;
  else if (freqBanho === 'quinzenal') banhoFreqMult = 2;
  else if (freqBanho === 'mensal') banhoFreqMult = 1;
  else if (freqBanho === 'bimestral') banhoFreqMult = 0.5;
  banhoMensal = custoBanhoUnit * banhoFreqMult;

  // Combine banho + tosa + higiene mensal informado (areia, tapete, serragem)
  const higieneExtra = higieneUsuario || 0;
  const petshopMensal = banhoMensal + tosaMensal + higieneExtra;

  // ---------- Veterinário ----------
  // freqAnual: mapping
  const freqMap = {
    '1 vez': 1, '2 vezes': 2, '3–5 vezes': 4, '6+ vezes': 8, 'só em emergência': 0.5
  };
  const vetFreqLabel = pet.vet?.freqAno || '1 vez';
  const consultasAno = freqMap[vetFreqLabel] || Number(pet.vet?.freqAno) || 1;
  const custoConsulta = pet.vet?.custoConsulta ? Number(pet.vet.custoConsulta) : (especie === 'cachorro' ? 120 : especie === 'gato' ? 100 : 80);
  const veterinarioMensal = (consultasAno * custoConsulta) / 12;

  // ---------- Medicamentos ----------
  const medicamentosMensal = pet.medicamentos?.custoMensal ? Number(pet.medicamentos.custoMensal) : 0;

  // ---------- Serviços extras (daycare, sitter, adestramento, passeador, hotel, banho semanal)
  // pet.servicos: [{ nome, frequenciaTipo: 'dia/semana/mes', frequenciaNum, custoUnit }]
  let servicosMensal = 0;
  if (Array.isArray(pet.servicos) && pet.servicos.length) {
    for (const s of pet.servicos) {
      const custo = Number(s.custo) || 0;
      const tipo = (s.frequenciaTipo || 'mensal').toLowerCase();
      const n = Number(s.frequenciaNum) || 1;
      if (tipo === 'dia') {
        // n dias por mês
        servicosMensal += custo * n;
      } else if (tipo === 'semana') {
        // n vezes por semana -> n * 4 * custo
        servicosMensal += custo * n * 4;
      } else { // mensal
        servicosMensal += custo * n;
      }
    }
  }

  // ---------- Acessórios (custos anuais divididos)
  let acessoriosMensal = 0;
  if (Array.isArray(pet.acessorios) && pet.acessorios.length) {
    for (const a of pet.acessorios) {
      const c = Number(a.custoAnual) || 0;
      acessoriosMensal += c / 12;
    }
  }

  // ---------- Alimentação complementar (snacks) - if provided
  const snacksMensal = pet.alimentacao?.snacksMensal ? Number(pet.alimentacao.snacksMensal) : 0;

  // ---------- TOTAL
  const totalMensal = racaoMensal + vacinasMensal + petshopMensal + veterinarioMensal + medicamentosMensal + servicosMensal + acessoriosMensal + snacksMensal;
  const totalAnual = totalMensal * 12;

  // retornar detalhado
  return {
    racao: Number(racaoMensal),
    vacinas: Number(vacinasMensal),
    banho: Number(banhoMensal),
    tosa: Number(tosaMensal),
    petshop: Number(petshopMensal), // banho + tosa + higiene
    veterinario: Number(veterinarioMensal),
    medicamentos: Number(medicamentosMensal),
    servicos: Number(servicosMensal),
    acessorios: Number(acessoriosMensal),
    snacks: Number(snacksMensal),
    totalMensal: Number(totalMensal),
    totalAnual: Number(totalAnual)
  };
}
