/* ==========================================
   MOVIA | CRUD de Clientes
   ASP.NET Core + SQL Server
========================================== */

const API_CLIENTES = "http://localhost:5000/api/Clientes";

let clientesCadastrados = [];
let clienteEmEdicaoId = null;
let clienteParaExcluirId = null;

const campo = id => document.getElementById(id);

const modalCliente = () =>
    bootstrap.Modal.getOrCreateInstance(campo("modalCliente"));

const modalExcluirCliente = () =>
    bootstrap.Modal.getOrCreateInstance(campo("modalExcluirCliente"));

/* ==========================================
   UTILITÁRIOS
========================================== */

function somenteNumeros(valor) {
    return String(valor ?? "").replace(/\D/g, "");
}

function normalizarTexto(valor) {
    return String(valor ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function formatarCPF(valor) {
    const cpf = somenteNumeros(valor).slice(0, 11);

    return cpf
        .replace(/^(\d{3})(\d)/, "$1.$2")
        .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function formatarTelefone(valor) {
    const numeros = somenteNumeros(valor).slice(0, 11);

    if (numeros.length <= 2) {
        return numeros ? `(${numeros}` : "";
    }

    const ddd = numeros.slice(0, 2);
    const restante = numeros.slice(2);

    if (restante.length <= 4) {
        return `(${ddd}) ${restante}`;
    }

    const tamanhoPrimeiraParte = restante.length > 8 ? 5 : 4;

    return `(${ddd}) ${restante.slice(0, tamanhoPrimeiraParte)}-${restante.slice(tamanhoPrimeiraParte)}`;
}

function cpfValido(valor) {
    const cpf = somenteNumeros(valor);

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
    }

    for (let tamanho = 9; tamanho < 11; tamanho++) {
        let soma = 0;

        for (let i = 0; i < tamanho; i++) {
            soma += Number(cpf[i]) * (tamanho + 1 - i);
        }

        const resto = (soma * 10) % 11;
        const digito = resto === 10 ? 0 : resto;

        if (digito !== Number(cpf[tamanho])) {
            return false;
        }
    }

    return true;
}

function mostrarAvisoCliente(mensagem, tipo = "success") {
    const container = campo("avisoClientes");
    container.replaceChildren();

    const alerta = document.createElement("div");
    alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
    alerta.setAttribute("role", "alert");

    const texto = document.createElement("span");
    texto.textContent = mensagem;

    const fechar = document.createElement("button");
    fechar.type = "button";
    fechar.className = "btn-close";
    fechar.setAttribute("data-bs-dismiss", "alert");
    fechar.setAttribute("aria-label", "Fechar");

    alerta.append(texto, fechar);
    container.appendChild(alerta);
}

function mostrarErroCliente(id, mensagem) {
    const container = campo(id);
    container.replaceChildren();

    const alerta = document.createElement("div");
    alerta.className = "alert alert-danger mb-0";
    alerta.textContent = mensagem;

    container.appendChild(alerta);
}

async function obterMensagemErroCliente(resposta) {
    let detalhe = "";

    try {
        const texto = await resposta.text();

        if (texto) {
            try {
                const dados = JSON.parse(texto);

                detalhe =
                    dados.detail ||
                    dados.title ||
                    dados.message ||
                    dados.mensagem ||
                    "";
            } catch {
                detalhe = texto.length <= 180 ? texto : "";
            }
        }
    } catch {
        // Mantém a mensagem padrão.
    }

    if (resposta.status === 404) {
        return "Cliente não encontrado.";
    }

    if (resposta.status === 409) {
        return detalhe ||
            "Operação não permitida. Verifique se existem registros relacionados.";
    }

    if (resposta.status === 400) {
        return detalhe ||
            "Dados inválidos. Verifique as informações preenchidas.";
    }

    if (resposta.status === 500) {
        return "O servidor não conseguiu concluir a operação. " +
            "Verifique se há aluguéis vinculados ou alguma restrição no banco.";
    }

    return detalhe ||
        `Não foi possível concluir a operação (HTTP ${resposta.status}).`;
}

/* ==========================================
   READ — CONSULTAR CLIENTES
========================================== */

async function carregarClientes() {
    const tabela = campo("tabelaClientes");

    tabela.innerHTML = `
        <tr>
            <td colspan="5" class="text-center py-5">
                <span class="spinner-border spinner-border-sm me-2"></span>
                Carregando clientes...
            </td>
        </tr>
    `;

    try {
        const resposta = await fetch(API_CLIENTES);

        if (!resposta.ok) {
            throw new Error(await obterMensagemErroCliente(resposta));
        }

        const dados = await resposta.json();

        if (!Array.isArray(dados)) {
            throw new Error("A API retornou um formato inesperado.");
        }

        clientesCadastrados = dados;

        atualizarIndicadoresClientes();
        filtrarClientes();

    } catch (erro) {
        console.error("Erro ao consultar clientes:", erro);

        clientesCadastrados = [];
        tabela.replaceChildren();

        const linha = document.createElement("tr");
        const celula = document.createElement("td");

        celula.colSpan = 5;
        celula.className = "text-center text-danger py-5";
        celula.textContent = "Não foi possível carregar os clientes.";

        linha.appendChild(celula);
        tabela.appendChild(linha);

        campo("totalClientes").textContent = "—";
        campo("clientesComEmail").textContent = "—";
        campo("resultadosClientes").textContent = "—";

        mostrarAvisoCliente(erro.message, "danger");
    }
}

/* ==========================================
   INDICADORES
========================================== */

function atualizarIndicadoresClientes() {
    const comEmail = clientesCadastrados.filter(
        cliente => String(cliente.email ?? "").trim().length > 0
    ).length;

    campo("totalClientes").textContent = clientesCadastrados.length;
    campo("clientesComEmail").textContent = comEmail;
}

/* ==========================================
   FILTROS POR NOME E CPF
========================================== */

function filtrarClientes() {
    const nome = normalizarTexto(
        campo("filtroNomeCliente").value
    );

    const cpf = somenteNumeros(
        campo("filtroCpfCliente").value
    );

    const filtrados = clientesCadastrados.filter(cliente => {
        const correspondeNome =
            normalizarTexto(cliente.nome).includes(nome);

        const correspondeCpf =
            somenteNumeros(cliente.cpf).includes(cpf);

        return correspondeNome && correspondeCpf;
    });

    campo("resultadosClientes").textContent = filtrados.length;

    renderizarClientes(filtrados);
}

function limparFiltrosClientes() {
    campo("filtroNomeCliente").value = "";
    campo("filtroCpfCliente").value = "";

    filtrarClientes();
}

/* ==========================================
   RENDERIZAÇÃO DA TABELA
========================================== */

function criarBotaoCliente(texto, icone, classe, acao) {
    const botao = document.createElement("button");

    botao.type = "button";
    botao.className = `btn btn-sm ${classe}`;

    const simbolo = document.createElement("i");
    simbolo.className = `bi ${icone} me-1`;

    botao.append(simbolo, document.createTextNode(texto));
    botao.addEventListener("click", acao);

    return botao;
}

function criarCelulaCliente(texto) {
    const celula = document.createElement("td");
    celula.textContent = texto ?? "—";
    return celula;
}

function renderizarClientes(clientes) {
    const tabela = campo("tabelaClientes");
    tabela.replaceChildren();

    if (clientes.length === 0) {
        const linha = document.createElement("tr");
        const celula = document.createElement("td");

        celula.colSpan = 5;
        celula.className = "text-center text-muted py-5";

        celula.textContent = clientesCadastrados.length === 0
            ? "Nenhum cliente cadastrado."
            : "Nenhum cliente encontrado para os filtros informados.";

        linha.appendChild(celula);
        tabela.appendChild(linha);

        return;
    }

    const ordenados = [...clientes].sort((a, b) =>
        String(a.nome ?? "").localeCompare(
            String(b.nome ?? ""),
            "pt-BR"
        )
    );

    ordenados.forEach(cliente => {
        const linha = document.createElement("tr");

        // Identidade do cliente
        const colunaNome = document.createElement("td");

        const identidade = document.createElement("div");
        identidade.className = "cliente-identidade";

        const avatar = document.createElement("span");
        avatar.className = "cliente-avatar";

        const icone = document.createElement("i");
        icone.className = "bi bi-person";

        avatar.appendChild(icone);

        const detalhes = document.createElement("div");

        const nome = document.createElement("strong");
        nome.textContent = cliente.nome ?? "Sem nome";

        const email = document.createElement("small");
        email.textContent = cliente.email ?? "Sem e-mail";

        detalhes.append(nome, email);
        identidade.append(avatar, detalhes);
        colunaNome.appendChild(identidade);

        // Dados
        const colunaCpf = criarCelulaCliente(
            formatarCPF(cliente.cpf)
        );

        const colunaTelefone = criarCelulaCliente(
            formatarTelefone(cliente.telefone)
        );

        const colunaCodigo = criarCelulaCliente(
            `#${cliente.clienteId}`
        );

        // Ações
        const colunaAcoes = document.createElement("td");

        const acoes = document.createElement("div");
        acoes.className = "cliente-acoes";

        const editar = criarBotaoCliente(
            "Editar",
            "bi-pencil-square",
            "btn-outline-secondary",
            () => abrirEdicaoCliente(cliente.clienteId)
        );

        const excluir = criarBotaoCliente(
            "Excluir",
            "bi-trash3",
            "btn-outline-danger",
            () => abrirExclusaoCliente(cliente.clienteId)
        );

        acoes.append(editar, excluir);
        colunaAcoes.appendChild(acoes);

        linha.append(
            colunaNome,
            colunaCpf,
            colunaTelefone,
            colunaCodigo,
            colunaAcoes
        );

        tabela.appendChild(linha);
    });
}

/* ==========================================
   CREATE — ABRIR CADASTRO
========================================== */

function abrirNovoCliente() {
    clienteEmEdicaoId = null;

    campo("formCliente").reset();
    campo("mensagemCliente").replaceChildren();

    campo("tituloModalCliente").textContent = "Novo cliente";

    campo("btnSalvarCliente").innerHTML =
        '<i class="bi bi-check-lg"></i> Salvar cliente';

    modalCliente().show();
}

/* ==========================================
   UPDATE — ABRIR EDIÇÃO
========================================== */

function abrirEdicaoCliente(id) {
    const cliente = clientesCadastrados.find(
        item => item.clienteId === id
    );

    if (!cliente) {
        mostrarAvisoCliente("Cliente não encontrado.", "warning");
        return;
    }

    clienteEmEdicaoId = id;

    campo("formCliente").reset();
    campo("mensagemCliente").replaceChildren();

    campo("tituloModalCliente").textContent = "Editar cliente";

    campo("clienteNome").value = cliente.nome ?? "";
    campo("clienteCpf").value = formatarCPF(cliente.cpf);
    campo("clienteEmail").value = cliente.email ?? "";
    campo("clienteTelefone").value =
        formatarTelefone(cliente.telefone);

    campo("btnSalvarCliente").innerHTML =
        '<i class="bi bi-check-lg"></i> Salvar alterações';

    modalCliente().show();
}

/* ==========================================
   CREATE / UPDATE — SALVAR CLIENTE
========================================== */

async function salvarCliente(evento) {
    evento.preventDefault();

    const nome = campo("clienteNome").value.trim();
    const cpf = somenteNumeros(campo("clienteCpf").value);
    const email = campo("clienteEmail").value.trim();
    const telefone = somenteNumeros(
        campo("clienteTelefone").value
    );

    campo("mensagemCliente").replaceChildren();

    if (nome.length < 2) {
        mostrarErroCliente(
            "mensagemCliente",
            "Informe um nome válido."
        );
        return;
    }

    if (!cpfValido(cpf)) {
        mostrarErroCliente(
            "mensagemCliente",
            "Informe um CPF válido."
        );
        return;
    }

    if (!campo("clienteEmail").checkValidity()) {
        mostrarErroCliente(
            "mensagemCliente",
            "Informe um e-mail válido."
        );
        return;
    }

    if (telefone.length !== 10 && telefone.length !== 11) {
        mostrarErroCliente(
            "mensagemCliente",
            "Informe um telefone com DDD válido."
        );
        return;
    }

    const editando = clienteEmEdicaoId !== null;

    const url = editando
        ? `${API_CLIENTES}/${clienteEmEdicaoId}`
        : API_CLIENTES;

    // CPF e telefone são enviados sem pontuação.
    // O frontend formata apenas para exibição.
    const dados = {
        nome,
        cpf,
        email,
        telefone
    };

    if (editando) {
        dados.clienteId = clienteEmEdicaoId;
    }

    const botao = campo("btnSalvarCliente");

    botao.disabled = true;
    botao.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span> Salvando...';

    try {
        const resposta = await fetch(url, {
            method: editando ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) {
            throw new Error(
                await obterMensagemErroCliente(resposta)
            );
        }

        modalCliente().hide();
        campo("formCliente").reset();
        clienteEmEdicaoId = null;

        await carregarClientes();

        mostrarAvisoCliente(
            editando
                ? "Cliente atualizado com sucesso!"
                : "Cliente cadastrado com sucesso!"
        );

    } catch (erro) {
        console.error("Erro ao salvar cliente:", erro);

        mostrarErroCliente(
            "mensagemCliente",
            erro.message
        );

    } finally {
        botao.disabled = false;

        botao.innerHTML = clienteEmEdicaoId !== null
            ? '<i class="bi bi-check-lg"></i> Salvar alterações'
            : '<i class="bi bi-check-lg"></i> Salvar cliente';
    }
}

/* ==========================================
   DELETE — ABRIR CONFIRMAÇÃO
========================================== */

function abrirExclusaoCliente(id) {
    const cliente = clientesCadastrados.find(
        item => item.clienteId === id
    );

    if (!cliente) {
        mostrarAvisoCliente("Cliente não encontrado.", "warning");
        return;
    }

    clienteParaExcluirId = id;

    campo("nomeClienteExcluir").textContent =
        cliente.nome ?? "este cliente";

    campo("mensagemExclusaoCliente").replaceChildren();

    modalExcluirCliente().show();
}

/* ==========================================
   DELETE — CONFIRMAR EXCLUSÃO
========================================== */

async function confirmarExclusaoCliente() {
    if (clienteParaExcluirId === null) {
        return;
    }

    const id = clienteParaExcluirId;
    const botao = campo("btnConfirmarExclusaoCliente");

    botao.disabled = true;
    botao.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span> Excluindo...';

    try {
        const resposta = await fetch(
            `${API_CLIENTES}/${id}`,
            { method: "DELETE" }
        );

        if (!resposta.ok) {
            throw new Error(
                await obterMensagemErroCliente(resposta)
            );
        }

        clienteParaExcluirId = null;
        modalExcluirCliente().hide();

        await carregarClientes();

        mostrarAvisoCliente("Cliente excluído com sucesso!");

    } catch (erro) {
        console.error("Erro ao excluir cliente:", erro);

        mostrarErroCliente(
            "mensagemExclusaoCliente",
            erro.message
        );

    } finally {
        botao.disabled = false;
        botao.innerHTML =
            '<i class="bi bi-trash3"></i> Excluir cliente';
    }
}

/* ==========================================
   EVENTOS E INICIALIZAÇÃO
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    carregarClientes();

    campo("btnNovoCliente")
        .addEventListener("click", abrirNovoCliente);

    campo("formCliente")
        .addEventListener("submit", salvarCliente);

    campo("filtroNomeCliente")
        .addEventListener("input", filtrarClientes);

    campo("filtroCpfCliente")
        .addEventListener("input", filtrarClientes);

    campo("btnLimparFiltrosClientes")
        .addEventListener("click", limparFiltrosClientes);

    campo("btnAtualizarClientes")
        .addEventListener("click", carregarClientes);

    campo("btnConfirmarExclusaoCliente")
        .addEventListener("click", confirmarExclusaoCliente);

    campo("clienteCpf").addEventListener("input", evento => {
        evento.target.value = formatarCPF(evento.target.value);
    });

    campo("clienteTelefone").addEventListener("input", evento => {
        evento.target.value = formatarTelefone(evento.target.value);
    });
});