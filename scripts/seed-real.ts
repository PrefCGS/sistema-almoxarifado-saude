import { prisma } from "../src/lib/prisma";

const UNIDADES_REAIS = [
  { codigo: "USF-AB", nome: "Unidade de Saúde Adelque Bossardi", bairro: "Jardim Flórida", tipo: "UBS" },
  { codigo: "USF-CM", nome: "Unidade de Saúde Conceição Maria de Andrade", bairro: "Jardim Paulista", tipo: "UBS" },
  { codigo: "USF-DS", nome: "Unidade de Saúde Dacyr Siqueira Trevisan", bairro: "Sede", tipo: "UBS" },
  { codigo: "USF-HF", nome: "Unidade de Saúde Henrique Ferreira", bairro: "Timbú", tipo: "UBS" },
  { codigo: "USF-JB", nome: "Unidade de Saúde Jacira Paulina Balbino Ferreira", bairro: "Paiol de Baixo", tipo: "UBS" },
  { codigo: "USF-JH", nome: "Unidade de Saúde João Hamilton Belo", bairro: "Santa Rosa", tipo: "UBS" },
  { codigo: "USF-JR", nome: "Unidade de Saúde Jorge Ribeiro Camargo", bairro: "Taquari", tipo: "UBS" },
  { codigo: "USF-MK", nome: "Unidade de Saúde Manoel Alves Kustel", bairro: "Araçatuba", tipo: "UBS" },
  { codigo: "USF-PC", nome: "Unidade de Saúde Pedro Casemiro Rodrigues", bairro: "Barragem", tipo: "UBS" },
  { codigo: "USF-ES", nome: "Unidade de Saúde Professora Elvira Tavares de Sant'Anna Camargo", bairro: "Jaguatirica", tipo: "UBS" },
  { codigo: "USF-RA", nome: "Unidade de Saúde Rogerio Oliveira de Almeida", bairro: "Santa Rita", tipo: "UBS" },
  { codigo: "USF-RC", nome: "Unidade de Saúde Rosalina Carvalho de Paula", bairro: "Canelinha", tipo: "UBS" },
  { codigo: "USF-ZS", nome: "Unidade de Saúde Zacarias Sant'Ana do Nascimento", bairro: "Ribeirão Grande", tipo: "UBS" },
  { codigo: "UAC", nome: "Unidade de Apoio Cerne", bairro: "Cerne", tipo: "OUTRO" },
  { codigo: "UAD", nome: "Unidade de Apoio Divisa", bairro: "Divisa", tipo: "OUTRO" },
];

const CATEGORIAS = ["MEDICAMENTO", "MEDICO_HOSPITALAR", "LIMPEZA_HIGIENE"] as const;
const PERFIS = ["ADMINISTRADOR", "GESTOR_SAUDE", "RESPONSAVEL_UNIDADE"] as const;
const PERIODOS = ["MENSAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL"] as const;
const FABRICANTES = ["Becton Dickinson", "Johnson & Johnson", "3M Health Care", "Medtronic", "Hartmann", "Lifemed", "Mikros", "Philips Healthcare"];
const NOMES_PRODUTOS = [
  "Dipirona", "Paracetamol", "Amoxicilina", "Soro fisiológico", "Luvas cirúrgicas",
  "Máscara N95", "Gaze estéril", "Esparadrapo", "Seringa 10ml", "Agulha 25x7",
  "Termômetro digital", "Oxímetro de dedo", "Atadura crepe", "Álcool 70%", "Hipoclorito de sódio",
  "Detergente hospitalar", "Papel toalha", "Luva de procedimento", "Máscara cirúrgica", "Touca descartável",
  "Omeprazol", "Loratadina", "Diclofenaco", "Insulina NPH", "Sulfato de magnésio",
  "Frasco soro 500ml", "Frasco soro 1000ml", "Lâmina de bisturi", "Fio de sutura", "Compressa cirúrgica",
  "Sonda vesical", "Sonda nasogástrica", "Cateter venoso", "Equipo macrogotas", "Bandeja clínica",
  "Tesoura cirúrgica", "Pinça Kelly", "Pinça Backhaus", "Afastador Farabeuf", "Manta térmica",
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(items: readonly T[]) {
  return items[randomInt(0, items.length - 1)];
}

function randomItems<T>(items: readonly T[], min: number, max: number) {
  const qtd = randomInt(min, max);
  return [...items].sort(() => Math.random() - 0.5).slice(0, qtd);
}

function gerarDataPassada(diasMax: number) {
  const d = new Date();
  d.setDate(d.getDate() - randomInt(0, diasMax));
  d.setHours(randomInt(8, 18), randomInt(0, 59), randomInt(0, 59), 0);
  return d;
}

async function main() {
  console.log("Limpando dados existentes...");
  await prisma.$executeRaw`TRUNCATE TABLE "ContagemInventario", "Inventario", "ItemRequisicao", "Requisicao", "HistoricoCota", "Cota", "Movimentacao", "SaldoEstoque", "Lote", "Produto", "Usuario" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Unidade" RESTART IDENTITY CASCADE`;

  console.log("Iniciando seed com unidades reais...");

  const unidades: { id: string; nome: string }[] = [];
  const produtos: { id: string; descricao: string }[] = [];
  const lotes: { id: string; produtoId: string }[] = [];
  const usuarios: { id: string; nome: string }[] = [];

  console.log("Criando unidades...");
  for (const u of UNIDADES_REAIS) {
    const criada = await prisma.unidade.create({
      data: {
        codigo: u.codigo,
        nome: u.nome,
        tipo: u.tipo as any,
        cnpj: `${randomInt(10, 99)}.${randomInt(100, 999)}.${randomInt(100, 999)}/${randomInt(1000, 9999)}-${randomInt(10, 99)}`,
        endereco: `Rua ${randomItem(["A", "B", "C", "D", "E"])}, ${randomInt(1, 999)}`,
        bairro: u.bairro,
        cidade: "Campina Grande do Sul",
        cep: `${randomInt(10000, 99999)}-${randomInt(100, 999)}`,
        telefone: `(${randomInt(11, 99)}) 9${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`,
        email: `${u.codigo.toLowerCase()}@sms.gov.br`,
        responsavel: `Responsável ${u.codigo}`,
        isAlmoxarifado: u.codigo === "UAC",
        situacao: "ATIVA",
      },
    });
    unidades.push({ id: criada.id, nome: criada.nome });
  }

  console.log("Criando produtos...");
  for (let i = 0; i < 80; i++) {
    const base = randomItem(NOMES_PRODUTOS);
    const sufixo = i < NOMES_PRODUTOS.length ? "" : ` ${Math.floor(i / NOMES_PRODUTOS.length) + 1}`;
    const produto = await prisma.produto.create({
      data: {
        codigoInterno: `PRD-${String(i + 1).padStart(4, "0")}`,
        descricao: `${base}${sufixo}`,
        categoria: randomItem(CATEGORIAS),
        unidadeMedida: randomItem(["UN", "CX", "PC", "FR", "ML"]),
        fabricante: randomItem(FABRICANTES),
        estoqueMinimo: randomInt(5, 100),
        estoqueMaximo: randomInt(101, 500),
        localizacaoFisica: `Corredor ${randomInt(1, 20)}, Prateleira ${randomInt(1, 10)}`,
        situacao: "ATIVO",
      },
    });
    produtos.push({ id: produto.id, descricao: produto.descricao });
  }

  console.log("Criando lotes...");
  for (let i = 0; i < 250; i++) {
    const produto = randomItem(produtos);
    const dataFabricacao = gerarDataPassada(365);
    const dataValidade = new Date(dataFabricacao);
    dataValidade.setFullYear(dataValidade.getFullYear() + randomInt(1, 3));
    const lote = await prisma.lote.create({
      data: {
        produtoId: produto.id,
        numeroLote: `L-${randomInt(10000, 99999)}`,
        dataFabricacao,
        dataValidade,
        quantidade: randomInt(1, 500),
      },
    });
    lotes.push({ id: lote.id, produtoId: lote.produtoId });
  }

  console.log("Criando usuários...");
  const perfis = [...PERFIS];
  for (let i = 0; i < 60; i++) {
    const perfil = randomItem(perfis);
    const usuario = await prisma.usuario.create({
      data: {
        authUserId: `seed-user-${i + 1}`,
        nome: `Usuário ${i + 1}`,
        email: `usuario${i + 1}@sms.gov.br`,
        perfil,
        unidadeId: perfil === "RESPONSAVEL_UNIDADE" ? randomItem(unidades).id : null,
        ativo: randomInt(1, 20) !== 1,
      },
    });
    usuarios.push({ id: usuario.id, nome: usuario.nome });
  }

  console.log("Criando movimentações...");
  for (let i = 0; i < 500; i++) {
    const tipo = randomItem(["ENTRADA_COMPRA", "ENTRADA_DOACAO", "ENTRADA_TRANSFERENCIA", "SAIDA_DISTRIBUICAO", "SAIDA_PERDA", "SAIDA_VENCIMENTO", "AJUSTE_INVENTARIO"] as const);
    const produto = randomItem(produtos);
    const lote = randomItem(lotes);
    const usuario = randomItem(usuarios);
    const unidadeDestino = randomInt(1, 5) === 1 ? randomItem(unidades) : null;
    await prisma.movimentacao.create({
      data: {
        tipo,
        produtoId: produto.id,
        loteId: lote.id,
        unidadeDestinoId: unidadeDestino?.id ?? undefined,
        quantidade: randomInt(1, 200),
        dataMovimentacao: gerarDataPassada(180),
        usuarioId: usuario.id,
        observacoes: randomInt(1, 20) === 1 ? "Observação automática" : undefined,
      },
    });
  }

  console.log("Criando requisições...");
  for (let i = 0; i < 120; i++) {
    const unidade = randomItem(unidades);
    const solicitante = randomItem(usuarios);
    const status = randomItem(["ABERTA", "EM_ANALISE", "APROVADA", "SEPARACAO", "EM_TRANSPORTE", "ENTREGUE", "CANCELADA"] as const);
    const criadaEm = gerarDataPassada(120);
    await prisma.requisicao.create({
      data: {
        numero: `REQ-${String(i + 1).padStart(6, "0")}`,
        unidadeId: unidade.id,
        status,
        solicitanteId: solicitante.id,
        createdAt: criadaEm,
        updatedAt: criadaEm,
        itens: {
          create: randomItems(produtos, 1, 4).map((produto) => ({
            produtoId: produto.id,
            quantidadeSolicitada: randomInt(1, 50),
            quantidadeAprovada: status === "APROVADA" || status === "ENTREGUE" ? randomInt(1, 50) : undefined,
          })),
        },
      },
    });
  }

  console.log("Criando cotas...");
  for (let i = 0; i < 100; i++) {
    const unidade = randomItem(unidades);
    const produto = randomItem(produtos);
    const periodo = randomItem(PERIODOS);
    const dataInicio = gerarDataPassada(90);
    const dataTermino = new Date(dataInicio);
    if (periodo === "MENSAL") dataTermino.setMonth(dataTermino.getMonth() + 1);
    else if (periodo === "TRIMESTRAL") dataTermino.setMonth(dataTermino.getMonth() + 3);
    else if (periodo === "SEMESTRAL") dataTermino.setMonth(dataTermino.getMonth() + 6);
    else dataTermino.setFullYear(dataTermino.getFullYear() + 1);
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

  console.log("Criando inventários...");
  for (let i = 0; i < 50; i++) {
    const unidade = randomItem(unidades);
    const status = randomInt(1, 10) === 1 ? "FINALIZADO" : "ABERTO";
    await prisma.inventario.create({
      data: {
        unidadeId: unidade.id,
        tipo: randomItem(["GERAL", "ROTATIVO"] as any),
        status,
        dataInicio: gerarDataPassada(60),
        dataFim: status === "FINALIZADO" ? gerarDataPassada(30) : undefined,
        contagens: {
          create: randomItems(produtos, 5, 12).map((produto) => ({
            produtoId: produto.id,
            quantidadeSistema: randomInt(0, 100),
            quantidadeContada: randomInt(0, 120),
            divergencia: randomInt(-20, 20),
          })),
        },
      },
    });
  }

  console.log("Seed com unidades reais concluído.");
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
