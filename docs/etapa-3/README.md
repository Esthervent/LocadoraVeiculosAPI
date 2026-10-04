# Etapa 3 - Testes e Documentação

A terceira etapa do projeto teve como objetivo integrar, documentar e testar as APIs desenvolvidas para o sistema de aluguel de veículos.

Nesta etapa, foi utilizado o **Swagger** para documentar e testar os endpoints da aplicação, permitindo visualizar as rotas disponíveis, seus métodos HTTP, parâmetros, dados de entrada e respostas retornadas pela API.

Também foram realizados testes manuais das operações desenvolvidas, utilizando o Swagger para verificar o funcionamento dos endpoints e registrar evidências dos resultados obtidos.


## 1. Swagger

O Swagger foi integrado ao projeto para permitir a documentação e os testes das APIs desenvolvidas no backend.

Por meio da interface do Swagger, é possível visualizar os controllers disponíveis, os endpoints de cada recurso, os métodos HTTP utilizados e executar as requisições diretamente na aplicação.

Os principais recursos disponibilizados são:

> 📸 **[INSERIR IMAGEM 01 - Tela inicial do Swagger com os controllers]**

---

## 2. Estrutura das APIs

As APIs foram organizadas em controllers, disponibilizando operações CRUD para as principais entidades do sistema.

### Fabricantes

O controller `FabricantesController` disponibiliza as operações CRUD para o gerenciamento dos fabricantes dos veículos.

- `GET /api/Fabricantes` — Retorna todos os fabricantes cadastrados no sistema.
- `GET /api/Fabricantes/{id}` — Retorna um fabricante específico a partir do seu identificador.
- `POST /api/Fabricantes` — Cadastra um novo fabricante.
- `PUT /api/Fabricantes/{id}` — Atualiza os dados de um fabricante existente.
- `DELETE /api/Fabricantes/{id}` — Exclui um fabricante cadastrado.

> 📸 **[INSERIR IMAGEM 02 - Teste dos endpoints de Fabricantes no Swagger]**

### Categorias de Veículos

O controller `CategoriasVeiculoController` é responsável pelo gerenciamento das categorias da frota, como SUV, Sedan, Hatch, entre outras.

- `GET /api/CategoriasVeiculo` — Retorna todas as categorias de veículos cadastradas.
- `GET /api/CategoriasVeiculo/{id}` — Retorna uma categoria específica a partir do seu identificador.
- `POST /api/CategoriasVeiculo` — Cadastra uma nova categoria de veículo.
- `PUT /api/CategoriasVeiculo/{id}` — Atualiza os dados de uma categoria existente.
- `DELETE /api/CategoriasVeiculo/{id}` — Exclui uma categoria cadastrada.

> 📸 **[INSERIR IMAGEM 03 - Teste dos endpoints de Categorias no Swagger]**

### Clientes

O controller `ClientesController` é responsável pelo cadastro e gerenciamento dos dados dos clientes da locadora.

- `GET /api/Clientes` — Retorna todos os clientes cadastrados.
- `GET /api/Clientes/{id}` — Retorna um cliente específico a partir do seu identificador.
- `POST /api/Clientes` — Cadastra um novo cliente.
- `PUT /api/Clientes/{id}` — Atualiza os dados de um cliente existente.
- `DELETE /api/Clientes/{id}` — Exclui um cliente cadastrado.

> 📸 **[INSERIR IMAGEM 04 - Teste dos endpoints de Clientes no Swagger]**

### Veículos

O controller `VeiculosController` é responsável pelo gerenciamento dos veículos da frota, incluindo fabricante, categoria, placa e disponibilidade.

- `GET /api/Veiculos` — Retorna todos os veículos cadastrados.
- `GET /api/Veiculos/{id}` — Retorna um veículo específico a partir do seu identificador.
- `POST /api/Veiculos` — Cadastra um novo veículo.
- `PUT /api/Veiculos/{id}` — Atualiza os dados de um veículo existente.
- `DELETE /api/Veiculos/{id}` — Exclui um veículo cadastrado.

> 📸 **[INSERIR IMAGEM 05 - Teste dos endpoints de Veículos no Swagger]**

### Aluguéis

O controller `AlugueisController` é responsável pelo gerenciamento do ciclo de vida das locações, aplicando as regras de negócio e realizando o cálculo automático dos valores.

- `GET /api/Alugueis` — Retorna todos os aluguéis cadastrados.
- `GET /api/Alugueis/{id}` — Retorna um aluguel específico a partir do seu identificador.
- `POST /api/Alugueis` — Cadastra um novo aluguel.
- `PUT /api/Alugueis/{id}/devolucao` — Registra a devolução de um veículo alugado.
- `DELETE /api/Alugueis/{id}` — Exclui um aluguel cadastrado.

As operações de aluguel também aplicam regras de negócio, como a verificação da existência do cliente e do veículo e a disponibilidade do veículo para locação.

> 📸 **[INSERIR IMAGEM 06 - Testes dos endpoints de Aluguéis no Swagger]**

### Consultas

Foram implementadas consultas específicas para atender aos filtros e relacionamentos solicitados no projeto:

- `GET /api/Consultas/veiculos/fabricante/{fabricanteId}` — Retorna os veículos relacionados a um determinado fabricante.
- `GET /api/Consultas/veiculos/categoria/{categoriaId}` — Retorna os veículos pertencentes a uma determinada categoria.
- `GET /api/Consultas/veiculos/disponiveis` — Retorna apenas os veículos que estão disponíveis para aluguel.
- `GET /api/Consultas/alugueis/cliente/{clienteId}` — Retorna o histórico de aluguéis de um determinado cliente.
- `GET /api/Consultas/alugueis/periodo` — Retorna os aluguéis realizados dentro de um determinado intervalo de datas.
- `GET /api/Consultas/fabricantes-com-veiculos` — Retorna os fabricantes e os veículos relacionados a cada um deles.

Essas consultas utilizam relacionamentos entre as entidades, incluindo operações com `INNER JOIN` e `LEFT JOIN`.

> 📸 **[INSERIR IMAGEM 07 - Testes das consultas e filtros no Swagger]**

---

## 3. Resumo Geral dos Endpoints

| Recurso | Métodos | Endpoint Principal | Descrição |
|---|---|---|---|
| **Fabricantes** | GET, POST, PUT, DELETE | `/api/Fabricantes` | Gerenciamento dos fabricantes |
| **Categorias de Veículo** | GET, POST, PUT, DELETE | `/api/CategoriasVeiculo` | Classificação dos veículos |
| **Clientes** | GET, POST, PUT, DELETE | `/api/Clientes` | Cadastro e gerenciamento de clientes |
| **Veículos** | GET, POST, PUT, DELETE | `/api/Veiculos` | Controle da frota e das placas |
| **Aluguéis** | GET, POST, PUT, DELETE | `/api/Alugueis` | Gerenciamento das locações e devoluções |
| **Consultas** | GET | `/api/Consultas/...` | Filtros avançados e relacionamentos |

---

## 4. Testes Manuais e Validação

Os testes manuais foram realizados por meio da interface do **Swagger**, com o objetivo de verificar o funcionamento dos endpoints e validar as regras de negócio implementadas na aplicação.

Foram realizados testes contemplando tanto os cenários de sucesso, denominados **Caminho Feliz**, quanto os cenários de erro e exceção, denominados **Caminho Infeliz**.

Entre os cenários testados, estão:

- Consulta de registros existentes;;
- Consulta de registros por identificador;
- Cadastro de novos registros;
- Atualização de registros;
- Exclusão de registros;
- Validação de dados obrigatórios;
- Tentativas de cadastro de informações duplicadas;
- Validação de CPF e e-mail únicos;
- Validação de placa de veículo única;
- Bloqueio de veículos que já estão alugados;
- Registro de devolução de veículos;
- Atualização da quilometragem durante a devolução;
- Consultas utilizando filtros e relacionamentos.

As evidências registram os resultados obtidos durante a execução das requisições no Swagger e servem como comprovação do funcionamento das funcionalidades implementadas.

### Teste de sucesso — GET

> 📸 **[INSERIR IMAGEM 08 - Chamada GET e retorno 200 OK]**

### Teste de sucesso — GET por id

> 📸 **[INSERIR IMAGEM 08 - Chamada GET e retorno 200 OK]**

### Teste de sucesso — POST

> 📸 **[INSERIR IMAGEM 09 - Chamada POST e retorno 201 Created]**

### Teste de atualização — PUT

> 📸 **[INSERIR IMAGEM 10 - Chamada PUT e retorno 204 No Content]**

### Teste de exclusão — DELETE

> 📸 **[INSERIR IMAGEM 11 - Chamada DELETE e retorno 204 No Content]**

### Teste de erro / validação

> 📸 **[INSERIR IMAGEM 12 - Exemplo de erro ou conflito retornado pela API]**

### Teste de regra de negócio

> 📸 **[INSERIR IMAGEM 13 - Exemplo de veículo indisponível ou outra regra de negócio]**

---

## 5. Conclusão da Etapa

A terceira etapa permitiu consolidar as funcionalidades desenvolvidas no backend, documentando os endpoints por meio do Swagger e realizando testes manuais para validar as operações e regras de negócio da aplicação.

A documentação dos controllers e endpoints facilita a compreensão da estrutura da API, enquanto os testes realizados permitiram verificar os cenários de sucesso e de erro previstos para o sistema de aluguel de veículos.
