import { prisma } from "../src/lib/prisma";

const TOTAL_UNIDADES = 60;
const TOTAL_PRODUTOS = 180;
const TOTAL_LOTES = 600;
const TOTAL_USUARIOS = 120;
const TOTAL_MOVIMENTACOES = 900;
const TOTAL_REQUISICOES = 220;
const TOTAL_COTAS = 160;
const TOTAL_INVENTARIOS = 80;

const CATEGORIAS = ["MEDICAMENTO", "MEDICO_HOSPITALAR", "LIMPEZA_HIGIENE"] as const;
const TIPOS_UNIDADE = [
  "ALMOXARIFADO_CENTRAL",
  "UBS",
  "ESF",
  "CAPS",
  "HOSPITAL",
  "PRONTO_ATENDIMENTO",
  "FARMACIA",
  "OUTRO",
] as const;
const PERFIS = [
  "ADMINISTRADOR",
  "GESTOR_SAUDE",
  "ALMOXARIFE",
  "RESPONSAVEL_UNIDADE",
] as const;
const TIPOS_MOVIMENTACAO = [
  "ENTRADA_COMPRA",
  "ENTRADA_DOACAO",
  "ENTRADA_TRANSFERENCIA",
  "SAIDA_DISTRIBUICAO",
  "SAIDA_PERDA",
  "SAIDA_VENCIMENTO",
  "AJUSTE_INVENTARIO",
] as const;
const STATUS_REQUISICAO = [
  "ABERTA",
  "EM_ANALISE",
  "APROVADA",
  "SEPARACAO",
  "EM_TRANSPORTE",
  "ENTREGUE",
  "CANCELADA",
] as const;
const PERIODOS = ["MENSAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL"] as const;
const BAIRROS = [
  "Centro",
  "Jardim América",
  "Vila Nova",
  "São José",
  "Boa Vista",
  "Morumbi",
  "Santa Cruz",
  "Industrial",
  "Residencial",
  "Panorama",
];
const CIDADES = [
  "Castro",
  "Ponta Grossa",
  "Telêmaco Borba",
  "Carambeí",
  "Jaguariaíva",
  "Sengés",
  "Balsa Nova",
  "Campo Largo",
  "Curitiba",
  "Lapa",
];
const NOMES_PRODUTOS = [
  "Dipirona",
  "Paracetamol",
  "Amoxicilina",
  "Soro fisiológico",
  "Luvas cirúrgicas",
  "Máscara N95",
  "Gaze estéril",
  "Esparadrapo",
  "Seringa 10ml",
  "Agulha 25x7",
  "Termômetro digital",
  "Oxímetro de dedo",
  "Atadura crepe",
  "Álcool 70%",
  "Hipoclorito de sódio",
  "Detergente hospitalar",
  "Papel toalha",
  "Luva de procedimento",
  "Máscara cirúrgica",
  "Touca descartável",
  "Propelente",
  "Sulfato de magnésio",
  "Omeprazol",
  "Loratadina",
  "Diclofenaco",
  "Insulina NPH",
  "Bomba de insulina",
  "Copo coletor",
  "Frasco soro 500ml",
  "Frasco soro 1000ml",
  "Cabo de cânula",
  "Filtro de ar",
  "Lâmina de bisturi",
  "Fio de sutura",
  "Cola cirúrgica",
  "Compressa cirúrgica",
  "Sonda vesical",
  "Sonda nasogástrica",
  "Cateter venoso",
  "Equipo macroget",
  "Equipo microgotas",
  "Bandeja clínica",
  "Tesoura cirúrgica",
  "Pinça Kelly",
  "Pinça Backhaus",
  "Afastador Farabeuf",
  "Manta térmica",
  "Aspirador cirúrgico",
  "Desfibrilador",
  "Monitor cardíaco",
  "Carrinho de emergência",
];

const FABRICANTES = [
  "Becton Dickinson",
  "Johnson & Johnson",
  "3M Health Care",
  "Medtronic",
  "Smith+Nephew",
  "Hartmann",
  "Neurotech",
  "Cremer",
  "Lifemed",
  "Mikros",
  "Covidien",
  "Philips Healthcare",
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(items: readonly T[]) {
  return items[randomInt(0, items.length - 1)];
}

function randomItems<T>(items: readonly T[], min: number, max: number) {
  const qtd = randomInt(min, max);
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, qtd);
}

function gerarCpfUnico(usados: Set<string>) {
  let cpf: string;
  do {
    cpf = Array.from({ length: 9 })
      .map(() => randomInt(0, 9))
      .join("");
    cpf = `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${randomInt(0, 9)}${randomInt(0, 9)}${randomInt(0, 9)}`;
  } while (usados.has(cpf));
  usados.add(cpf);
  return cpf;
}

function gerarEmailUnico(nome: string, usados: Set<string>) {
  let email = `${nome.toLowerCase().replace(/\s+/g, ".")}@sms.gov.br`;
  let counter = 1;
  let base = email.replace(/@.*$/, "");
  while (usados.has(email)) {
    email = `${base}${counter}@sms.gov.br`;
    counter += 1;
  }
  usados.add(email);
  return email;
}

function gerarDataPassada(diasMax: number) {
  const d = new Date();
  d.setDate(d.getDate() - randomInt(0, diasMax));
  d.setHours(randomInt(8, 18), randomInt(0, 59), randomInt(0, 59), 0);
  return d;
}

function gerarDataFutura(diasMax: number) {
  const d = new Date();
  d.setDate(d.getDate() + randomInt(0, diasMax));
  d.setHours(randomInt(8, 18), randomInt(0, 59), randomInt(0, 59), 0);
  return d;
}

async function main() {
  console.log("Iniciando seed massivo...");

  const unidades: { id: string; nome: string }[] = [];
  const produtos: { id: string; descricao: string }[] = [];
  const lotes: { id: string; produtoId: string }[] = [];
  const usuarios: { id: string; nome: string; email: string }[] = [];
  const almoxarifados: { id: string }[] = [];

  console.log(`Criando ${TOTAL_UNIDADES} unidades...`);
  for (let i = 0; i < TOTAL_UNIDADES; i++) {
    const codigo = `UNI-${String(i + 1).padStart(3, "0")}`;
    const tipo = randomItem(TIPOS_UNIDADE);
    const cidade = randomItem(CIDADES);
    const nome = `${tipo === "OUTRO" ? "Outra Unidade" : tipo.replace(/_/g, " ")} ${i + 1}`;
    const unidade = await prisma.unidade.create({
      data: {
        codigo,
        nome,
        tipo,
        cnpj: `${randomInt(10, 99)}.${randomInt(100, 999)}.${randomInt(100, 999)}/${randomInt(1000, 9999)}-${randomInt(10, 99)}`,
        endereco: `Rua ${randomItem(["A", "B", "C", "D", "E"])}, ${randomInt(1, 999)}`,
        bairro: randomItem(BAIRROS),
        cidade,
        cep: `${randomInt(10000, 99999)}-${randomInt(100, 999)}`,
        telefone: `(${randomInt(11, 99)}) 9${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`,
        email: `unidade${i + 1}@sms.gov.br`,
        responsavel: `Responsável ${i + 1}`,
        isAlmoxarifado: tipo === "ALMOXARIFADO_CENTRAL" || randomInt(1, 10) === 1,
        situacao: randomInt(1, 20) === 1 ? "INATIVA" : "ATIVA",
      },
    });
    unidades.push({ id: unidade.id, nome: unidade.nome });
    if (unidade.isAlmoxarifado) {
      almoxarifados.push({ id: unidade.id });
    }
  }

  console.log(`Criando ${TOTAL_PRODUTOS} produtos...`);
  const usados = new Set<string>();
  for (let i = 0; i < TOTAL_PRODUTOS; i++) {
    const baseNome = randomItem(NOMES_PRODUTOS);
    const sufixo = i < NOMES_PRODUTOS.length ? "" : ` ${Math.floor(i / NOMES_PRODUTOS.length) + 1}`;
    const descricao = `${baseNome}${sufixo}`;
    const codigoInterno = `PRD-${String(i + 1).padStart(4, "0")}`;
    const categoria = randomItem(CATEGORIAS);
    const produto = await prisma.produto.create({
      data: {
        codigoInterno,
        codigoBarras: usados.has(codigoInterno) ? undefined : `789${randomInt(100000000, 999999999)}`,
        descricao,
        categoria,
        unidadeMedida: randomItem(["UN", "CX", "PC", "FR", "ML", "MG", "G"]),
        unidadeCompra: randomItem(["UN", "CX", "FR"]),
        fabricante: randomItem(FABRICANTES),
        estoqueMinimo: randomInt(5, 100),
        estoqueMaximo: randomInt(101, 500),
        localizacaoFisica: `Corredor ${randomInt(1, 20)}, Prateleira ${randomInt(1, 10)}, Nível ${randomInt(1, 5)}`,
        situacao: randomInt(1, 50) === 1 ? "INATIVO" : "ATIVO",
      },
    });
    produtos.push({ id: produto.id, descricao: produto.descricao });
  }

  console.log(`Criando ${TOTAL_LOTES} lotes...`);
  for (let i = 0; i < TOTAL_LOTES; i++) {
    const produto = randomItem(produtos);
    const numeroLote = `L-${randomInt(10000, 99999)}`;
    const dataFabricacao = gerarDataPassada(365);
    const dataValidade = new Date(dataFabricacao);
    dataValidade.setFullYear(dataValidade.getFullYear() + randomInt(1, 3));
    const lote = await prisma.lote.create({
      data: {
        produtoId: produto.id,
        numeroLote,
        dataFabricacao,
        dataValidade,
        quantidade: randomInt(1, 500),
      },
    });
    lotes.push({ id: lote.id, produtoId: lote.produtoId });
  }

  console.log(`Criando ${TOTAL_USUARIOS} usuários...`);
  const usuariosUsados = new Set<string>();
  const perfis = [...PERFIS];
  for (let i = 0; i < TOTAL_USUARIOS; i++) {
    const nome = `Usuário ${i + 1}`;
    const email = gerarEmailUnico(nome, usuariosUsados);
    const perfil = randomItem(perfis);
    const usuario = await prisma.usuario.create({
      data: {
        authUserId: `seed-user-${i + 1}`,
        nome,
        email,
        perfil,
        unidadeId: randomInt(1, 10) === 1 ? undefined : randomItem(unidades).id,
        ativo: randomInt(1, 20) !== 1,
      },
    });
    usuarios.push({ id: usuario.id, nome: usuario.nome, email: usuario.email });
  }

  console.log(`Criando ${TOTAL_MOVIMENTACOES} movimentações...`);
  for (let i = 0; i < TOTAL_MOVIMENTACOES; i++) {
    const tipo = randomItem(TIPOS_MOVIMENTACAO);
    const produto = randomItem(produtos);
    const lote = randomItem(lotes);
    const usuario = randomItem(usuarios);
    const unidadeDestino = randomInt(1, 5) === 1 ? randomItem(unidades) : null;
    const data = gerarDataPassada(180);
    await prisma.movimentacao.create({
      data: {
        tipo,
        produtoId: produto.id,
        loteId: lote.id,
        unidadeDestinoId: unidadeDestino?.id ?? undefined,
        quantidade: randomInt(1, 200),
        numeroNotaFiscal: randomInt(1, 10) === 1 ? `NF-${randomInt(10000, 99999)}` : undefined,
        fornecedor: randomInt(1, 10) === 1 ? randomItem(FABRICANTES) : undefined,
        dataMovimentacao: data,
        usuarioId: usuario.id,
        observacoes: randomInt(1, 20) === 1 ? "Observação automática" : undefined,
      },
    });
  }

  console.log(`Criando ${TOTAL_REQUISICOES} requisições...`);
  for (let i = 0; i < TOTAL_REQUISICOES; i++) {
    const unidade = randomItem(unidades);
    const solicitante = randomItem(usuarios);
    const status = randomItem(STATUS_REQUISICAO);
    const criadaEm = gerarDataPassada(120);
    const itens = randomItems(produtos, 1, 5);
    await prisma.requisicao.create({
      data: {
        numero: `REQ-${String(i + 1).padStart(6, "0")}`,
        unidadeId: unidade.id,
        status,
        justificativa: randomInt(1, 10) === 1 ? "Justificativa de teste" : undefined,
        extraordinaria: randomInt(1, 20) === 1,
        autorizacaoExcepcional: randomInt(1, 30) === 1,
        solicitanteId: solicitante.id,
        createdAt: criadaEm,
        updatedAt: criadaEm,
        itens: {
          create: itens.map((produto) => ({
            produtoId: produto.id,
            quantidadeSolicitada: randomInt(1, 50),
            quantidadeAprovada: status === "APROVADA" || status === "ENTREGUE" ? randomInt(1, 50) : undefined,
          })),
        },
      },
    });
  }

  console.log(`Criando ${TOTAL_COTAS} cotas...`);
  for (let i = 0; i < TOTAL_COTAS; i++) {
    const unidade = randomItem(unidades);
    const produto = randomItem(produtos);
    const periodo = randomItem(PERIODOS);
    const dataInicio = gerarDataPassada(90);
    const dataTermino = new Date(dataInicio);
    if (periodo === "MENSAL") {
      dataTermino.setMonth(dataTermino.getMonth() + 1);
    } else if (periodo === "TRIMESTRAL") {
      dataTermino.setMonth(dataTermino.getMonth() + 3);
    } else if (periodo === "SEMESTRAL") {
      dataTermino.setMonth(dataTermino.getMonth() + 6);
    } else {
      dataTermino.setFullYear(dataTermino.getFullYear() + 1);
    }
    await prisma.cota.create({
      data: {
        unidadeId: unidade.id,
        produtoId: produto.id,
        quantidadeAutorizada: randomInt(10, 500),
        periodo,
        dataInicio,
        dataTermino,
        quantidadeUtilizada: randomInt(0, 400),
      },
    });
  }

  console.log(`Criando ${TOTAL_INVENTARIOS} inventários...`);
  for (let i = 0; i < TOTAL_INVENTARIOS; i++) {
    const unidade = randomItem(unidades);
    const tipo = randomItem(["GERAL", "ROTATIVO"]);
    const status = randomInt(1, 10) === 1 ? "FINALIZADO" : "ABERTO";
    const inventario = await prisma.inventario.create({
      data: {
        unidadeId: unidade.id,
        tipo,
        status,
        dataInicio: gerarDataPassada(60),
        dataFim: status === "FINALIZADO" ? gerarDataPassada(30) : undefined,
        contagens: {
          create: randomItems(produtos, 5, 15).map((produto) => ({
            produtoId: produto.id,
            quantidadeSistema: randomInt(0, 100),
            quantidadeContada: randomInt(0, 120),
            divergencia: randomInt(-20, 20),
          })),
        },
      },
    });
  }

  console.log("Seed massivo concluído com sucesso.");
}

main()
  .catch((e) => {
    console.error("Erro no seed massivo:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
