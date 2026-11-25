
# LocadoraVeiculosAPI

`CURSO: Análise e Desenvolvimento de Sistemas`

`DISCIPLINA: Tecnologias para Análise e Desenvolvimento de Sistemas`

`4º semestre / 2026`

**Aluna:** Esther Ventura de Souza  
**Professor:** Ramon Lacerda Marques

## Sobre o projeto

O projeto **LocadoraVeiculosAPI** tem como objetivo desenvolver o backend de um sistema de gerenciamento de locadora de veículos, utilizando C#, ASP.NET Core, Entity Framework Core e SQL Server.

A solução contempla a modelagem do banco de dados e a implementação de uma API RESTful, permitindo o gerenciamento de fabricantes, categorias de veículos, veículos, clientes e aluguéis.

O sistema também conta com operações CRUD completas, filtros de pesquisa, consultas específicas, validações, relacionamentos entre entidades, persistência de dados e documentação das rotas.

## Tecnologias utilizadas

- C#
- ASP.NET Core
- Entity Framework Core
- SQL Server
- Swagger
- HTML
- CSS
- JavaScript
- Git
- GitHub

## Entidades principais

- Fabricante
- CategoriaVeiculo
- Veiculo
- Cliente
- Aluguel

## Funcionalidades implementadas

- Cadastro, consulta, atualização e exclusão de fabricantes.
- Cadastro, consulta, atualização e exclusão de categorias de veículos.
- Cadastro, consulta, atualização e exclusão de veículos.
- Cadastro, consulta, atualização e exclusão de clientes.
- Gerenciamento de aluguéis e registro de devoluções.
- Filtros de pesquisa nos módulos do sistema.
- Consultas específicas envolvendo fabricantes, categorias, veículos, clientes e aluguéis.
- Integração entre frontend, API REST e banco de dados SQL Server.

## Protótipo navegável

O protótipo interativo apresenta a proposta visual e a navegação entre as principais telas do sistema.

**[Acessar o protótipo do MOVIA no Figma](https://www.figma.com/proto/Vh0CZibKGhP7ARYw5Nthm2/MOVIA-%7C-Wireframes?t=ulvBYHqN1M4tzm5c-8&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1&node-id=2-3&starting-point-node-id=2%3A3&hide-ui=1)**

## Demonstração do sistema

O vídeo apresenta o funcionamento do MOVIA, demonstrando as principais funcionalidades implementadas, os módulos de gerenciamento, as operações CRUD, os filtros de pesquisa e as consultas integradas ao banco de dados.

**[▶ Assistir ao vídeo demonstrativo do MOVIA no YouTube](https://youtu.be/O28mxEBzK_U)**

## Estrutura do trabalho

- [Etapa 1 - Modelagem do Banco de Dados](docs/etapa-1/README.md)
- [Etapa 2 - Implementação do Backend](docs/etapa-2/README.md)
- [Etapa 3 - Testes e Documentação](docs/etapa-3/README.md)
- [Etapa 4 - Apresentação em formato Pitch](docs/etapa-4/README.md)

## Banco de dados

O projeto utiliza SQL Server com Entity Framework Core para persistência dos dados, garantindo o armazenamento e o relacionamento das informações utilizadas pelas funcionalidades do sistema.

## Organização do repositório

```text
LocadoraVeiculosAPI
│
├── src
│   └── LocadoraVeiculosAPI
│
├── docs
│   ├── etapa-1
│   ├── etapa-2
│   ├── etapa-3
│   └── etapa-4
│
├── README.md
├── .gitignore
├── .gitattributes
└── LocadoraVeiculosAPI.slnx
```
