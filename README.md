# SCCON — Teste Front-End

**Desenvolvedor:** Pedro Henrique  
**Tecnologias:** Angular 21, TypeScript, Angular Material, SCSS, RxJS e ViaCEP.

## Sobre o projeto

Aplicação web desenvolvida para o teste de Front-End da SCCON. Permite navegar entre a Home e a área de Endereços, consultar endereços pelo CEP usando a API ViaCEP e visualizar/remover o histórico de pesquisas.

## Requisitos

- Node.js compatível com Angular 21 (recomenda-se Node.js 20.19+ ou 22.12+).
- npm.
- Conexão com a internet para consultar o ViaCEP e carregar os tiles do mapa.

## Instalação

Abra o terminal na raiz do projeto e execute:

```bash
npm ci
```

Se o PowerShell bloquear `npm.ps1`, use `npm.cmd ci` ou `npm.cmd install`.

## Executar localmente

```bash
npm start
```

Acesse http://localhost:4200.

## Build de produção

```bash
npm run build
```

## Testes

```bash
npm test
npm run test:coverage
```

## Funcionalidades e decisões técnicas

- Home e Endereços são carregados sob demanda por rotas lazy-loaded.
- Cabeçalho e menu ficam em componentes separados e reutilizam o logo SVG fornecido.
- Formulário de busca usa Reactive Forms, máscara `00000-000` e validação por expressão regular antes da chamada ao serviço.
- O serviço ViaCEP valida o CEP normalizado e trata falhas da API.
- Histórico de buscas exibido em tabela Angular Material, com paginação e exclusão de registros.
- Histórico implementado através de uma API REST simulada em memória (`angular-in-memory-web-api`); os dados são temporários e reiniciam ao recarregar a aplicação.
- Uso de Observables/RxJS para chamadas HTTP, controle de fluxo, erros e cancelamento de inscrições quando o componente é destruído.
- Estilos em SCSS com variáveis reutilizáveis, layout responsivo, estados de hover/focus e animações.
- O projeto inclui uma página WebGIS adicional com Leaflet e dados geográficos do IBGE.

## Estrutura resumida

```text
src/app/
├── components/header/          # Cabeçalho e navegação
├── core/                       # API REST simulada e utilitários
└── modules/
    ├── home/pages/home/         # Página inicial
    ├── cep/
    │   ├── pages/busca/         # Formulário de busca de CEP
    │   ├── components/listagem/ # Histórico em tabela
    │   └── services/            # ViaCEP e histórico
    └── webgis/                  # Mapa interativo adicional
```

## Observações

- O histórico usa armazenamento em memória para simular uma API REST. Para persistência entre sessões, substitua o mock por um backend real ou use `localStorage`/IndexedDB.
- A aplicação depende de serviços externos (ViaCEP, OpenStreetMap e IBGE) para as respectivas funcionalidades.
