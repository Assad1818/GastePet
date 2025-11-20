// api.js
export async function calcularGastoMedio(raca, idade, porte) {
  // Simula tempo de resposta da API
  await new Promise(resolve => setTimeout(resolve, 500));

  // --- Ração ---
  const baseRacao = {
    "Labrador": 200,
    "Poodle": 180,
    "Vira-lata": 100,
    "Golden": 220,
    "Bulldog": 200,
    "Shih Tzu": 160,
    "Yorkshire": 150,
    "Husky": 250,
    "Beagle": 180,
    "Boxer": 210,
    "Dachshund": 140,
    "Rottweiler": 260,
    "Schnauzer": 160,
    "Maltês": 140,
    "Pinscher": 130,
    "Cocker Spaniel": 180,
    "Pastor Alemão": 240,
    "Doberman": 230,
    "Lhasa Apso": 140,
    "Akita": 280,
    "Buldogue": 200,
    "Chihuahua": 100,
    "Pug": 160,
    "Border Collie": 220,
    "Shar Pei": 200,
    "Mastiff": 300,
    "Samoyed": 260,
    "Corgi": 170,
    "Bull Terrier": 210,
    "Papillon": 120,
    "Havanês": 140,
    "Dálmata": 230,
    "Saint Bernard": 300,
    "Terrier Brasileiro": 120,
    "Shiba Inu": 220
  };
  
  let gastoRacao = baseRacao[raca] || 150;

  // Ajuste por idade (ração)
  if (idade <= 1) gastoRacao *= 1.2;       // filhote
  else if (idade <= 5) gastoRacao *= 1;    // adulto jovem
  else gastoRacao *= 0.8;                  // idoso

  // Ajuste por porte (ração)
  switch (porte.toLowerCase()) {
    case "pequeno":
      gastoRacao *= 0.9;
      break;
    case "medio":
      gastoRacao *= 1;
      break;
    case "grande":
      gastoRacao *= 1.2;
      break;
    default:
      gastoRacao *= 1;
  }

  // --- Vacinas ---
  const vacinasBase = {
    filhote: 250,   // primeira série
    adulto: 120     // reforço anual
  };
  
  let gastoVacina = idade < 1 ? vacinasBase.filhote : vacinasBase.adulto;
  gastoVacina /= 12; // mensal

  // --- Banho ---
  let gastoBanho = 0;
  switch (porte.toLowerCase()) {
    case "pequeno":
      gastoBanho = 40;
      break;
    case "medio":
      gastoBanho = 60;
      break;
    case "grande":
      gastoBanho = 80;
      break;
    default:
      gastoBanho = 50;
  }

  if (idade < 0.5) gastoBanho *= 0.5;

  const gastoTotal = gastoRacao + gastoVacina + gastoBanho;

  return {
    racao: gastoRacao,
    vacinas: gastoVacina,
    banho: gastoBanho,
    total: gastoTotal
  };
}
