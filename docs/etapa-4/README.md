# Etapa 4 — Apresentação em Formato Pitch

## 1. Objetivo

Esta etapa apresenta, em formato de vídeo pitch, o projeto **LocadoraVeiculosAPI**, uma API REST desenvolvida para gerenciar as principais operações de uma locadora de veículos.

O objetivo é explicar o problema que o sistema resolve, mostrar como ele foi construído e demonstrar seu funcionamento na prática, relacionando a modelagem do banco de dados, as operações da API e as regras de negócio da locação.

## 2. Vídeo de Apresentação

* **Link para assistir:** [Abrir no YouTube](https://youtu.be/CXlg-SybGKE)
* **Duração:** 9 minutos e 41 segundos
* **Formato:** Pitch técnico com slides e demonstração prática no Swagger.
* **Hospedagem:** YouTube (visibilidade **"Não listado"**, garantindo acesso direto sem necessidade de login ou permissões especiais).


## 3. Estrutura do Vídeo

O vídeo está organizado nos seguintes momentos:

1. **Apresentação e problema:** Identificação acadêmica e justificativa da necessidade de uma locadora centralizar clientes, veículos e aluguéis.
2. **Arquitetura e modelo de dados:** tecnologias utilizadas e visão geral das cinco entidades do sistema (`Fabricante`, `CategoriaVeiculo`, `Veiculo`, `Cliente` e `Aluguel`).
3. **Estrutura do projeto:** organização das pastas no Visual Studio e o banco de dados criado.
4. **Funcionalidades:** visão geral do que o sistema oferece.
5. **Demonstração prática no Swagger:** 
   * Cadastros de fabricante, categoria, cliente e veículo;
   * Criação de um aluguel com cálculo automático do valor total;
   * Validação de regra de negócio (bloqueio de aluguel para veículo indisponível);
   * Registro de devolução e liberação da frota;
   * Execução de consultas avançadas utilizando `INNER JOIN` e `LEFT JOIN`.
6. **Conclusão:** Resumo dos resultados obtidos e o link do repositório.

## 4. Material de Apoio (Slide)

[Apresentacao-LocadoraVeiculosAPI.pdf](evidencias/Apresentacao-LocadoraVeiculosAPI.pdf)

## 5. Conclusão do Trabalho

O projeto **LocadoraVeiculosAPI** foi desenvolvido ao longo de quatro etapas complementares:
* **Etapa 1:** Modelagem conceitual, lógica e física do banco de dados relacional.
* **Etapa 2:** Implementação do backend em C# com ASP.NET Core, Entity Framework Core e regras de negócio.
* **Etapa 3:** Integração do Swagger, documentação detalhada e testes manuais com evidências.
* **Etapa 4:** Apresentação em formato Pitch e demonstração prática em vídeo.

O desenvolvimento permitiu praticar de ponta a ponta a construção de APIs RESTful, persistência de dados, tratamento de exceções, validação de integridade e consultas relacionais, consolidando uma base técnica sólida e entregando um sistema funcional e documentado.
