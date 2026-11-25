/**
 * silos.ts — arquitetura de links internos (Hub → Pilares → Satélites).
 *
 * Fonte da verdade do mapa em docs/mapa-de-silos.md.
 * - O hub linka todos os pilares ("Guias por categoria").
 * - Cada pilar linka seus satélites e volta ao hub.
 * - Cada satélite linka o seu pilar e os satélites irmãos do mesmo silo.
 * - Satélites NÃO levam link de afiliado; só caminhos relativos.
 *
 * Para criar um pilar novo (ex.: Marcas), troque `exists` para true quando a página existir.
 * Até lá os satélites daquele silo apontam para o hub.
 */

export interface Pillar {
  slug: string;
  /** Texto do link na lista do hub */
  anchor: string;
  /** Frase curta que descreve o pilar */
  blurb: string;
  /** Texto do link nos satélites (varia em relação ao anchor do hub) */
  ctaAnchor: string;
  /** Frase que antecede o link nos satélites */
  cta: string;
  /** A página-pilar já existe? */
  exists: boolean;
}

export const HUB = {
  slug: 'melhor-air-fryer-oven',
  anchor: 'Melhor air fryer oven: ranking com as 10 melhores',
  ctaAnchor: 'ranking das melhores air fryer oven',
};

export const PILLARS: Record<string, Pillar> = {
  '12l': {
    slug: 'air-fryer-12l-qual-a-melhor',
    anchor: 'Air fryer oven de 12 litros: qual a melhor',
    blurb: 'Comparativo dos modelos de 12 litros, a capacidade mais vendida para famílias.',
    ctaAnchor: 'comparativo das melhores air fryer oven de 12 litros',
    cta: 'Quer escolher o modelo de tamanho certo para a sua família? Veja o',
    exists: true,
  },
  espeto: {
    slug: 'melhor-air-fryer-oven-espeto-giratorio',
    anchor: 'Air fryer oven com espeto giratório: qual a melhor',
    blurb: 'As melhores air fryer oven para assar frango inteiro com rotisserie.',
    ctaAnchor: 'melhores air fryer oven com espeto giratório',
    cta: 'Quer assar frango inteiro como o de padaria? Confira as',
    exists: true,
  },
  '500': {
    slug: 'melhor-air-fryer-oven-ate-500-reais',
    anchor: 'Melhor air fryer oven até 500 reais',
    blurb: 'Modelos que cabem no orçamento sem perder potência.',
    ctaAnchor: 'melhores air fryer oven até 500 reais',
    cta: 'Procurando um modelo que caiba no orçamento? Veja as',
    exists: true,
  },
  cb: {
    slug: 'melhor-air-fryer-oven-custo-beneficio',
    anchor: 'Melhor air fryer oven custo-benefício',
    blurb: 'Os modelos com mais recursos e acessórios, independente do preço.',
    ctaAnchor: 'air fryer oven com melhor custo-benefício',
    cta: 'Quer saber quais modelos entregam mais recursos? Compare as',
    exists: true,
  },
  electrolux: {
    slug: 'melhor-air-fryer-oven-electrolux',
    anchor: 'Air fryer oven Electrolux (Rita Lobo): qual escolher',
    blurb: 'A linha Experience da Electrolux: EAF90, EAF86 e comparativos.',
    ctaAnchor: 'análise das air fryer oven Electrolux',
    cta: 'Pensando em um modelo da linha Rita Lobo? Leia a',
    exists: true,
  },
  marcas: {
    slug: 'qual-a-melhor-marca-de-air-fryer-oven',
    anchor: 'Qual a melhor marca de air fryer oven',
    blurb: 'Philco, Mondial, Oster, Britânia e Electrolux frente a frente.',
    ctaAnchor: 'comparativo entre as marcas de air fryer oven',
    cta: 'Em dúvida entre as marcas? Veja o',
    exists: true,
  },
  receitas: {
    slug: 'receitas-para-air-fryer-oven',
    anchor: 'Receitas para air fryer oven',
    blurb: 'Mais de 50 receitas testadas para usar o seu forno air fryer.',
    ctaAnchor: 'mais receitas para air fryer oven',
    cta: 'Quer mais ideias para o seu forno air fryer? Veja',
    exists: true,
  },
};

/** slug do satélite → chave do pilar */
export const SATELLITES: Record<string, string> = {
  // 12 litros
  'tamanhos-de-air-fryer-oven': '12l',
  'medidas-da-air-fryer-oven': '12l',
  'o-que-e-air-fryer-oven': '12l',
  'diferenca-entre-air-fryer-e-air-fryer-oven': '12l',
  'air-fryer-oven-vs-forno-eletrico': '12l',
  'air-fryer-oven-ou-microondas': '12l',
  'air-fryer-oven-ou-fritadeira': '12l',
  'air-fryer-oven-vale-a-pena': '12l',
  'qual-a-voltagem-da-air-fryer-oven': '12l',
  'air-fryer-oven-digital': '12l',
  // espeto giratório
  'como-usar-o-espeto-giratorio-air-fryer-oster': 'espeto',
  'frango-assado-na-air-fryer-oven': 'espeto',
  'carne-na-air-fryer-oven': 'espeto',
  'air-fryer-oven-cesto-giratorio': 'espeto',
  'air-fryer-oven-precisa-virar-os-alimentos': 'espeto',
  'temperatura-air-fryer-oven': 'espeto',
  'como-pre-aquecer-air-fryer-oven': 'espeto',
  // até 500 reais
  'onde-comprar-air-fryer-oven': '500',
  'garantia-air-fryer-oven': '500',
  'consumo-de-energia-air-fryer-oven': '500',
  'air-fryer-oven-precisa-de-oleo': '500',
  // custo-benefício (benefícios e funções)
  'funcao-desidratar-air-fryer-oven': 'cb',
  'simbolos-air-fryer-oven': 'cb',
  'como-usar-air-fryer-oven': 'cb',
  'primeiro-uso-da-air-fryer-oven': 'cb',
  'manual-de-instrucoes-air-fryer-oven': 'cb',
  'como-limpar-air-fryer-oven': 'cb',
  'air-fryer-oven-fumaca-e-normal': 'cb',
  'air-fryer-oven-faz-muito-barulho': 'cb',
  'acessorios-para-air-fryer-oven': 'cb',
  'kit-acessorios-para-air-fryer-oven': 'cb',
  'forma-de-silicone-para-air-fryer-oven': 'cb',
  'pode-usar-papel-aluminio-air-fryer-oven': 'cb',
  'pode-usar-forma-de-aluminio-na-air-fryer-oven': 'cb',
  // Electrolux
  'air-fryer-oven-vermelha': 'electrolux',
  'electrolux-eaf85-ou-eaf90': 'electrolux',
  // marcas (pilar ainda não existe)
  'air-fryer-oven-branca': 'marcas',
  'air-fryer-oven-oster': 'marcas',
  'air-fryer-oven-mondial': 'marcas',
  'air-fryer-oven-philco': 'marcas',
  'air-fryer-oven-philco-pfr2200p-e-boa': 'marcas',
  'air-fryer-britania-e-boa': 'marcas',
  'air-fryer-wap-e-boa': 'marcas',
  'air-fryer-philips-walita-e-boa': 'marcas',
  // receitas
  'batata-frita-na-air-fryer-oven': 'receitas',
  'bolo-na-air-fryer-oven': 'receitas',
  'pizza-na-air-fryer-oven': 'receitas',
  'pudim-na-air-fryer-oven': 'receitas',
  'lasanha-na-air-fryer-oven': 'receitas',
  'pao-de-queijo-na-air-fryer-oven': 'receitas',
  'como-assar-pao-na-air-fryer-oven': 'receitas',
  'legumes-na-air-fryer-oven': 'receitas',
  'peixe-na-air-fryer-oven': 'receitas',
};

export function pillarKeyBySlug(slug: string): string | undefined {
  return Object.keys(PILLARS).find((k) => PILLARS[k].slug === slug);
}

export function satellitesOf(key: string): string[] {
  return Object.keys(SATELLITES).filter((s) => SATELLITES[s] === key);
}
