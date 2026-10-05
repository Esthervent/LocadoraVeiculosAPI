# Etapa 3 - Testes e Documentação

A terceira etapa do projeto teve como objetivo integrar, documentar e testar as APIs desenvolvidas para o sistema de aluguel de veículos.

Nesta etapa, foi utilizado o **Swagger** para documentar e testar os endpoints da aplicação, permitindo visualizar as rotas disponíveis, seus métodos HTTP, parâmetros, dados de entrada e respostas retornadas pela API.

Também foram realizados testes manuais das operações desenvolvidas, utilizando o Swagger para verificar o funcionamento dos endpoints e registrar evidências dos resultados obtidos.

## 1. Swagger

O Swagger foi integrado ao projeto para permitir a documentação e os testes das APIs desenvolvidas no backend.

Por meio da interface do Swagger, é possível visualizar os controllers disponíveis, os endpoints de cada recurso, os métodos HTTP utilizados e executar as requisições diretamente na aplicação.

![Tela inicial do Swagger com os controllers](evidencias/swagger.png)

## 2. Estrutura das APIs

As APIs foram organizadas em controllers, disponibilizando operações CRUD para as principais entidades do sistema.

### Fabricantes

O controller `FabricantesController` disponibiliza as operações CRUD para o gerenciamento dos fabricantes dos veículos.

![Tela dos endpoints de Fabricantes no Swagger](evidencias/fabricantes.png)

#### Especificação técnica — Fabricantes

**POST `/api/Fabricantes`**

- **Parâmetros:** nenhum parâmetro de rota.
- **Corpo da requisição (Body):** nome, paisOrigem.
- **Possíveis respostas:**
  - 201 Created — fabricante cadastrado com sucesso.
  - 400 Bad Request — dados inválidos.
  - 409 Conflict — fabricante já cadastrado.

**PUT `/api/Fabricantes/{id}`**

- **Parâmetros:** id — identificador do fabricante.
- **Possíveis respostas:**
  - 204 No Content — fabricante atualizado com sucesso.
  - 404 Not Found — fabricante não encontrado.

**GET `/api/Fabricantes`**

- **Parâmetros:** nenhum.
- **Possíveis respostas:**
  - 200 OK — lista de fabricantes retornada com sucesso.

**GET `/api/Fabricantes/{id}`**

- **Parâmetros:** id — identificador do fabricante.
- **Possíveis respostas:**
  - 200 OK — fabricante encontrado.
  - 404 Not Found — fabricante não encontrado.

**DELETE `/api/Fabricantes/{id}`**

- **Parâmetros:** id — identificador do fabricante.
- **Possíveis respostas:**
  - 204 No Content — fabricante excluído com sucesso.
  - 404 Not Found — fabricante não encontrado.

---

### Categorias de Veículos

O controller `CategoriasVeiculoController` é responsável pelo gerenciamento das categorias da frota, como SUV, Sedan, Hatch, entre outras.

![Tela dos endpoints de Categorias no Swagger](evidencias/categorias.png)

#### Especificação técnica — Categorias de Veículos

**POST `/api/CategoriasVeiculo`**

- **Parâmetros:** nenhum parâmetro de rota.
- **Corpo da requisição (Body):** nome, descricao.
- **Possíveis respostas:**
  - 201 Created — categoria cadastrada com sucesso.
  - 400 Bad Request — dados inválidos.
  - 409 Conflict — nome da categoria já cadastrado.

**PUT `/api/CategoriasVeiculo/{id}`**

- **Parâmetros:** id — identificador da categoria.
- **Corpo da requisição (Body):** nome, descricao.
- **Possíveis respostas:**
  - 204 No Content — categoria atualizada com sucesso.
  - 404 Not Found — categoria não encontrada.
  - 409 Conflict — nome da categoria já cadastrado.

**GET `/api/CategoriasVeiculo`**

- **Parâmetros:** nenhum.
- **Possíveis respostas:**
  - 200 OK — lista de categorias retornada com sucesso.

**GET `/api/CategoriasVeiculo/{id}`**

- **Parâmetros:** id — identificador da categoria.
- **Possíveis respostas:**
  - 200 OK — categoria encontrada.
  - 404 Not Found — categoria não encontrada.

**DELETE `/api/CategoriasVeiculo/{id}`**

- **Parâmetros:** id — identificador da categoria.
- **Possíveis respostas:**
  - 204 No Content — categoria excluída com sucesso.
  - 404 Not Found — categoria não encontrada.
  - 409 Conflict — categoria vinculada a registros que impedem sua exclusão.

---

### Clientes

O controller `ClientesController` é responsável pelo cadastro e gerenciamento dos dados dos clientes da locadora.

![Tela dos endpoints de Clientes no Swagger](evidencias/clientes.png)

#### Especificação técnica — Clientes

**POST `/api/Clientes`**

- **Parâmetros:** nenhum parâmetro de rota.
- **Corpo da requisição (Body):** nome, cpf, email, telefone.
- **Possíveis respostas:**
  - 201 Created — cliente cadastrado com sucesso.
  - 400 Bad Request — dados inválidos.
  - 409 Conflict — CPF ou e-mail já cadastrado.

**PUT `/api/Clientes/{id}`**

- **Parâmetros:** id — identificador do cliente.
- **Corpo da requisição (Body):** nome, cpf, email, telefone.
- **Possíveis respostas:**
  - 204 No Content — cliente atualizado com sucesso.
  - 404 Not Found — cliente não encontrado.
  - 409 Conflict — CPF ou e-mail já cadastrado.

**GET `/api/Clientes`**

- **Parâmetros:** nenhum.
- **Possíveis respostas:**
  - 200 OK — lista de clientes retornada com sucesso.

**GET `/api/Clientes/{id}`**

- **Parâmetros:** id — identificador do cliente.
- **Possíveis respostas:**
  - 200 OK — cliente encontrado.
  - 404 Not Found — cliente não encontrado.

**DELETE `/api/Clientes/{id}`**

- **Parâmetros:** id — identificador do cliente.
- **Possíveis respostas:**
  - 204 No Content — cliente excluído com sucesso.
  - 404 Not Found — cliente não encontrado.

---

### Veículos

O controller `VeiculosController` é responsável pelo gerenciamento dos veículos da frota, incluindo fabricante, categoria, placa e disponibilidade.

![Tela dos endpoints de Veículos no Swagger](evidencias/veiculos.png)

#### Especificação técnica — Veículos

**POST `/api/Veiculos`**

- **Parâmetros:** nenhum parâmetro de rota.
- **Corpo da requisição (Body):** modelo, anoFabricacao, quilometragem, placa, disponivel, fabricanteId, categoriaVeiculoId.
- **Possíveis respostas:**
  - 201 Created — veículo cadastrado com sucesso.
  - 400 Bad Request — dados inválidos ou fabricante/categoria inválidos.
  - 409 Conflict — placa já cadastrada.

**PUT `/api/Veiculos/{id}`**

- **Parâmetros:** id — identificador do veículo.
- **Corpo da requisição (Body):** dados atualizados do veículo.
- **Possíveis respostas:**
  - 204 No Content — veículo atualizado com sucesso.
  - 400 Bad Request — dados inválidos ou fabricante/categoria inválidos.
  - 404 Not Found — veículo não encontrado.
  - 409 Conflict — placa já cadastrada.

**GET `/api/Veiculos`**

- **Parâmetros:** nenhum.
- **Possíveis respostas:**
  - 200 OK — lista de veículos retornada com sucesso.

**GET `/api/Veiculos/{id}`**

- **Parâmetros:** id — identificador do veículo.
- **Possíveis respostas:**
  - 200 OK — veículo encontrado.
  - 404 Not Found — veículo não encontrado.

**DELETE `/api/Veiculos/{id}`**

- **Parâmetros:** id — identificador do veículo.
- **Possíveis respostas:**
  - 204 No Content — veículo excluído com sucesso.
  - 404 Not Found — veículo não encontrado.
  - 409 Conflict — veículo vinculado a registros que impedem sua exclusão.

---

### Aluguéis

O controller `AlugueisController` é responsável pelo gerenciamento do ciclo de vida das locações, aplicando as regras de negócio e realizando o cálculo automático dos valores.

![Tela dos endpoints de Aluguéis no Swagger](evidencias/alugueis.png)

As operações de aluguel também aplicam regras de negócio, como a verificação da existência do cliente e do veículo e a disponibilidade do veículo para locação.

#### Especificação técnica — Aluguéis e Devolução

**POST `/api/Alugueis`**

- **Parâmetros:** nenhum parâmetro de rota.
- **Corpo da requisição (Body):** dataInicio, dataFimPrevista, quilometragemInicial, valorDiaria, clienteId, veiculoId.
- **Possíveis respostas:**
  - 201 Created — aluguel criado com sucesso e veículo marcado como indisponível.
  - 400 Bad Request — dados inválidos.
  - 409 Conflict — veículo indisponível para aluguel.

**GET `/api/Alugueis`**

- **Parâmetros:** nenhum.
- **Possíveis respostas:**
  - 200 OK — lista de aluguéis retornada com sucesso.

**GET `/api/Alugueis/{id}`**

- **Parâmetros:** id — identificador do aluguel.
- **Possíveis respostas:**
  - 200 OK — aluguel encontrado.
  - 404 Not Found — aluguel não encontrado.

**PUT `/api/Alugueis/{id}`**

- **Parâmetros:** id — identificador do aluguel.
- **Possíveis respostas:**
  - 204 No Content — aluguel atualizado com sucesso.
  - 404 Not Found — aluguel não encontrado.

**DELETE `/api/Alugueis/{id}`**

- **Parâmetros:** id — identificador do aluguel.
- **Possíveis respostas:**
  - 204 No Content — aluguel excluído com sucesso.
  - 404 Not Found — aluguel não encontrado.

**PUT `/api/Alugueis/{id}/devolucao`**

- **Parâmetros:** id — identificador do aluguel.
- **Corpo da requisição (Body):** dados necessários para registrar a devolução, conforme o modelo definido pela API.
- **Possíveis respostas:**
  - 200 OK — devolução registrada e veículo liberado.
  - 404 Not Found — aluguel não encontrado.
  - 409 Conflict — tentativa de realizar uma devolução já registrada.

---

### Consultas

Foram implementadas consultas específicas para atender aos filtros e relacionamentos solicitados no projeto:

![Tela das consultas e filtros no Swagger](evidencias/consultas.png)

Essas consultas utilizam relacionamentos entre as entidades, incluindo operações com **`INNER JOIN`** e **`LEFT JOIN`**.

#### Especificação técnica — Consultas

**GET** `/api/Consultas/veiculos/fabricante/{fabricanteId}`

- **Parâmetros:** fabricanteId — identificador do fabricante.
- **Possíveis respostas:**
  - 200 OK — veículos encontrados para o fabricante informado.
  - 404 Not Found — fabricante não encontrado ou sem registros relacionados.

**GET** `/api/Consultas/veiculos/categoria/{categoriaId}`

- **Parâmetros:** categoriaId — identificador da categoria.
- **Possíveis respostas:**
  - 200 OK — veículos encontrados para a categoria informada.
  - 404 Not Found — categoria não encontrada ou sem registros relacionados.

**GET** `/api/Consultas/veiculos/disponiveis`

- **Parâmetros:** nenhum.
- **Possíveis respostas:**
  - 200 OK — lista de veículos disponíveis.

**GET** `/api/Consultas/alugueis/cliente/{clienteId}`

- **Parâmetros:** clienteId — identificador do cliente.
- **Relacionamentos:** utiliza INNER JOIN para relacionar Aluguel, Cliente e Veiculo, retornando os registros que possuem correspondência entre as entidades.
- **Possíveis respostas:**
  - 200 OK — histórico de aluguéis do cliente.

**GET** `/api/Consultas/alugueis/periodo`

- **Parâmetros:** intervalo de datas utilizado para filtrar os aluguéis.
- **Possíveis respostas:**
  - 200 OK — lista de aluguéis encontrados no período informado.

**GET** `/api/Consultas/fabricantes-com-veiculos`

- **Parâmetros:** nenhum.
- **Relacionamentos:** utiliza LEFT JOIN para retornar todos os fabricantes, inclusive aqueles que não possuem veículos relacionados.
- **Possíveis respostas:**
  - 200 OK — lista de fabricantes e seus veículos relacionados.

### Uso de INNER JOIN

O INNER JOIN foi utilizado para demonstrar o relacionamento entre diferentes entidades do banco de dados.

Na consulta:

**GET** `/api/Consultas/alugueis/cliente/{clienteId}`

são relacionadas as entidades: Aluguel, Cliente e Veiculo.

O relacionamento permite retornar informações do aluguel juntamente com os dados do cliente e do veículo correspondente.

Dessa forma, a consulta demonstra a utilização prática de um INNER JOIN, retornando registros que possuem correspondência entre as tabelas relacionadas.

![Aluguéis por cliente - INNER JOIN](evidencias/filtro-cliente.png)

### Uso de LEFT JOIN

Também foi implementado um LEFT JOIN na consulta:

**GET `/api/Consultas/fabricantes-com-veiculos`**

Nesse caso, o objetivo é retornar todos os fabricantes, inclusive aqueles que ainda não possuem veículos cadastrados.

A utilização do LEFT JOIN garante que os registros da tabela principal sejam mantidos mesmo quando não existe correspondência na tabela relacionada.

![Fabricantes com veículos - LEFT JOIN](evidencias/filtro-left-join.png)

---

## 3. Resumo Geral dos Endpoints

| Recurso | Métodos | Endpoint Principal | Descrição |
| :--- | :--- | :--- | :--- |
| **Fabricantes** | GET, POST, PUT, DELETE | `/api/Fabricantes` | Gerenciamento dos fabricantes |
| **Categorias de Veículo** | GET, POST, PUT, DELETE | `/api/CategoriasVeiculo` | Classificação dos veículos |
| **Clientes** | GET, POST, PUT, DELETE | `/api/Clientes` | Cadastro e gerenciamento de clientes |
| **Veículos** | GET, POST, PUT, DELETE | `/api/Veiculos` | Controle da frota e das placas |
| **Aluguéis** | GET, POST, PUT, DELETE | `/api/Alugueis` | Gerenciamento das locações e devoluções |
| **Consultas** | GET | `/api/Consultas/...` | Filtros avançados e relacionamentos |

---

## 4. Testes Manuais e Evidências

Os testes manuais foram realizados utilizando a interface do **Swagger**, com o objetivo de verificar o funcionamento dos endpoints, as respostas HTTP e as regras de negócio implementadas na aplicação.

Foram realizados testes de sucesso, além de testes de validação e tratamento de erros.

### 4.1 Testes de CRUD

#### Fabricantes

- **POST — Cadastro de fabricante:** ![POST Fabricante](evidencias/post-fabricante.png)
- **GET — Consulta de fabricantes:** ![GET Fabricantes](evidencias/get-fabricantes.png)
- **GET por ID — Consulta de fabricante:** ![GET Fabricante por ID](evidencias/get-fabricante-id.png)
- **PUT — Atualização de fabricante:** ![PUT Fabricante](evidencias/put-fabricante.png)
- **DELETE — Exclusão de fabricante:** ![DELETE Fabricante](evidencias/delete-fabricante.png)

#### Categorias de Veículos

- **POST — Cadastro de categoria:** ![POST Categoria](evidencias/post-categoria.png)
- **GET — Consulta de categorias:** ![GET Categorias](evidencias/get-categorias.png)
- **GET por ID — Consulta de categoria:** ![GET Categoria por ID](evidencias/get-categoria-id.png)
- **PUT — Atualização de categoria:** ![PUT Categoria](evidencias/put-categoria.png)
- **DELETE — Exclusão de categoria:** ![DELETE Categoria](evidencias/delete-categoria.png)

#### Clientes

- **POST — Cadastro de cliente:** ![POST Cliente](evidencias/post-cliente.png)
- **GET — Consulta de clientes:** ![GET Clientes](evidencias/get-clientes.png)
- **GET por ID — Consulta de cliente:** ![GET Cliente por ID](evidencias/get-cliente-id.png)
- **PUT — Atualização de cliente:** ![PUT Cliente](evidencias/put-cliente.png)
- **DELETE — Exclusão de cliente:** ![DELETE Cliente](evidencias/delete-cliente.png)

#### Veículos

- **POST — Cadastro de veículo:** ![POST Veículo](evidencias/post-veiculo.png)
- **GET — Consulta de veículos:** ![GET Veículos](evidencias/get-veiculos.png)
- **GET por ID — Consulta de veículo:** ![GET Veículo por ID](evidencias/get-veiculo-id.png)
- **PUT — Atualização de veículo:** ![PUT Veículo](evidencias/put-veiculo.png)
- **DELETE — Exclusão de veículo:** ![DELETE Veículo](evidencias/delete-veiculo.png)

#### Aluguéis

- **POST — Cadastro de aluguel:** ![POST Aluguel](evidencias/post-aluguel.png)
- **GET — Consulta de aluguéis:** ![GET Aluguéis](evidencias/get-alugueis.png)
- **GET por ID — Consulta de aluguel:** ![GET Aluguel por ID](evidencias/get-aluguel-id.png)
- **PUT — Atualização de aluguel:** ![PUT Aluguel](evidencias/put-aluguel.png)
- **DELETE — Exclusão de aluguel:** ![DELETE Aluguel](evidencias/delete-aluguel.png)

### 4.2 Devolução de veículo

- **Teste de devolução (`PUT /api/Alugueis/{id}/devolucao`):** ![Devolução de veículo](evidencias/devolucao-aluguel.png)
- **Tentativa de devolução duplicada:** ![Erro de devolução duplicada](evidencias/devolucao-duplicada.png)

### 4.3 Testes das consultas e filtros

- **Veículos por fabricante:** ![Veículos por fabricante](evidencias/filtro-fabricante.png)
- **Veículos por categoria:** ![Veículos por categoria](evidencias/filtro-categoria.png)
- **Veículos disponíveis:** ![Veículos disponíveis](evidencias/filtro-disponiveis.png)
- **INNER JOIN — Aluguéis por cliente** (`GET /api/Consultas/alugueis/cliente/{clienteId}`): combina dados de `Aluguel`, `Cliente` e `Veiculo`. ![Aluguéis por cliente](evidencias/filtro-cliente.png)
- **Aluguéis por período:** ![Aluguéis por período](evidencias/filtro-periodo.png)
- **LEFT JOIN — Fabricantes com veículos** (`GET /api/Consultas/fabricantes-com-veiculos`): lista todos os fabricantes, inclusive os que não possuem veículos. ![LEFT JOIN](evidencias/filtro-left-join.png)

### 4.4 Testes de validação e tratamento de erros

- **Cadastro de informação duplicada:** ![Informação duplicada](evidencias/erro-duplicado.png)
- **Aluguel de veículo indisponível:** ![Veículo indisponível](evidencias/erro-veiculo-indisponivel.png)
- **Erro ao deletar categoria vinculada a veículo:** ![Erro ao deletar categoria](evidencias/erro-delete-categoria.png)

---

## 5. Conclusão da Etapa

A terceira etapa permitiu consolidar as funcionalidades desenvolvidas no backend, documentando os endpoints por meio do Swagger e realizando testes manuais para validar as operações e regras de negócio da aplicação.

A documentação dos controllers e endpoints facilita a compreensão da estrutura da API, apresentando os métodos HTTP, parâmetros, corpos das requisições e possíveis respostas para as principais operações.

Os testes realizados permitiram verificar os cenários de sucesso, validação e tratamento de erros previstos para o sistema de aluguel de veículos.

Além disso, as consultas implementadas demonstraram o uso de relacionamentos entre as entidades do banco de dados, incluindo consultas com **`INNER JOIN`** e **`LEFT JOIN`**, atendendo ao requisito de utilização de diferentes tipos de junção entre tabelas.

Com a integração do Swagger, foi possível documentar e executar os endpoints diretamente pela interface da aplicação, permitindo verificar as respostas HTTP e o comportamento das funcionalidades desenvolvidas.

Dessa forma, a Etapa 3 consolida a documentação e a validação do backend desenvolvido, deixando o projeto preparado para a etapa final de apresentação do sistema.
