import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";

async function main() {
  const email = "admin@sms.gov.br";
  const password = "admin123";
  const nome = "Administrador SMS";

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    console.log("Usuário admin já existe:", email);
    return;
  }

  const criado = await auth.api.signUpEmail({
    body: { email, password, name: nome },
    headers: new Headers(),
  });

  await prisma.usuario.create({
    data: {
      authUserId: criado.user.id,
      nome,
      email,
      perfil: "ADMINISTRADOR",
      ativo: true,
    },
  });

  const almox = await prisma.unidade.findFirst({ where: { isAlmoxarifado: true } });
  if (!almox) {
    await prisma.unidade.create({
      data: {
        codigo: "ALMOX-CENTRAL",
        nome: "Almoxarifado Central",
        tipo: "ALMOXARIFADO_CENTRAL",
        endereco: "Rua Exemplo, 1",
        bairro: "Centro",
        cidade: "Cidade",
        cep: "00000000",
        telefone: "000000000",
        email: "almox@sms.gov.br",
        responsavel: "Responsável Central",
        isAlmoxarifado: true,
      },
    });
  }

  console.log("Seed concluído. Login:", email, "/ senha:", password);
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
