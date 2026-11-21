/* ==========================================
   MOVIA | CRUD de Fabricantes
   API ASP.NET Core + SQL Server
========================================== */

const API_FABRICANTES = "http://localhost:5000/api/Fabricantes";

let fabricantesCadastrados = [];
let fabricanteEmEdicaoId = null;
let fabricanteParaExcluirId = null;

const elemento = id => document.getElementById(id);

const modalFabricante = () =>
    bootstrap.Modal.getOrCreateInstance(
        elemento("modalFabricante")
    );

const modalExclusao = () =>
    bootstrap.Modal.getOrCreateInstance(
        elemento("modalExcluirFabricante")
    );

/* ------------------------------------------
   Utilitários
------------------------------------------ */

function normalizarTexto(texto) {
    return String(texto ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function mostrarAviso(mensagem, tipo = "success") {
    const aviso = elemento("avisoFabricantes");

    aviso.replaceChildren();

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
    aviso.appendChild(alerta);
}

function mostrarErroModal(id, mensagem) {
    const container = elemento(id);
    container.replaceChildren();

    const alerta = document.createElement("div");
    alerta.className = "alert alert-danger mb-0";
    alerta.textContent = mensagem;

    container.appendChild(alerta);
}

async function obterMensagemErro(resposta) {
    let detalhe = "";

    try {
        const conteudo = await resposta.text();

        if (conteudo) {
            try {
                const dados = JSON.parse(conteudo);

                detalhe =
                    dados.detail ||
                    dados.title ||
                    dados.message ||
                    dados.mensagem ||
                    "";
            } catch {
                detalhe = conteudo.length <= 180
                    ? conteudo
                    : "";
            }
        }
    } catch {
        // Mantém a mensagem padrão.
    }

    if (resposta.status === 404) {
        return "Fabricante não encontrado.";
    }

    if (resposta.status === 409) {
        return "Operação bloqueada por conflito com outros registros.";
    }

    if (resposta.status === 400) {
        return detalhe ||
            "Dados inválidos. Verifique as informações preenchidas.";
    }

    if (resposta.status === 500) {
        return "O servidor não conseguiu concluir a operação. " +
            "Verifique se existem veículos vinculados ao fabricante.";
    }

    return detalhe ||
        `Não foi possível concluir a operação (HTTP ${resposta.status}).`;
}

/* ------------------------------------------
   READ — Consultar fabricantes
------------------------------------------ */

async function carregarFabricantes() {
    const tabela = elemento("tabelaFabricantes");

    tabela.innerHTML = `
        <tr>
            <td colspan="4" class="text-center py-5">
                <span class="spinner-border spinner-border-sm me-2"></span>
                Carregando fabricantes...
            </td>
        </tr>
    `;

    try {
        const resposta = await fetch(API_FABRICANTES);

        if (!resposta.ok) {
            throw new Error(await obterMensagemErro(resposta));
        }

        const dados = await resposta.json();

        if (!Array.isArray(dados)) {
            throw new Error("A API retornou um formato inesperado.");
        }

        fabricantesCadastrados = dados;

        atualizarIndicadores();
        filtrarFabricantes();

    } catch (erro) {
        console.error("Erro ao consultar fabricantes:", erro);

        tabela.replaceChildren();

        const linha = document.createElement("tr");
        const celula = document.createElement("td");

        celula.colSpan = 4;
        celula.className = "text-center text-danger py-5";
        celula.textContent = "Não foi possível carregar os fabricantes.";

        linha.appendChild(celula);
        tabela.appendChild(linha);

        elemento("totalFabricantes").textContent = "—";
        elemento("totalPaises").textContent = "—";
        elemento("totalResultados").textContent = "—";

        mostrarAviso(erro.message, "danger");
    }
}

/* ------------------------------------------
   Indicadores
------------------------------------------ */

function atualizarIndicadores() {
    const paises = new Set(
        fabricantesCadastrados
            .map(f => normalizarTexto(f.paisOrigem))
            .filter(Boolean)
    );

    elemento("totalFabricantes").textContent =
        fabricantesCadastrados.length;

    elemento("totalPaises").textContent = paises.size;
}

/* ------------------------------------------
   Filtros por nome e país
------------------------------------------ */

function filtrarFabricantes() {
    const filtroNome = normalizarTexto(
        elemento("filtroNomeFabricante").value
    );

    const filtroPais = normalizarTexto(
        elemento("filtroPaisFabricante").value
    );

    const filtrados = fabricantesCadastrados.filter(fabricante => {
        const nome = normalizarTexto(fabricante.nome);
        const pais = normalizarTexto(fabricante.paisOrigem);

        return nome.includes(filtroNome) &&
            pais.includes(filtroPais);
    });

    elemento("totalResultados").textContent = filtrados.length;

    renderizarFabricantes(filtrados);
}

function limparFiltros() {
    elemento("filtroNomeFabricante").value = "";
    elemento("filtroPaisFabricante").value = "";

    filtrarFabricantes();
}

/* ------------------------------------------
   Renderização segura da tabela
------------------------------------------ */

function criarCelula(texto, classe = "") {
    const td = document.createElement("td");

    td.textContent = texto ?? "—";
    td.className = classe;

    return td;
}

function criarBotaoAcao(texto, icone, classe, acao) {
    const botao = document.createElement("button");

    botao.type = "button";
    botao.className = `btn btn-sm ${classe}`;

    const simbolo = document.createElement("i");
    simbolo.className = `bi ${icone} me-1`;

    botao.append(simbolo, document.createTextNode(texto));
    botao.addEventListener("click", acao);

    return botao;
}

function renderizarFabricantes(fabricantes) {
    const tabela = elemento("tabelaFabricantes");

    tabela.replaceChildren();

    if (fabricantes.length === 0) {
        const linha = document.createElement("tr");
        const celula = document.createElement("td");

        celula.colSpan = 4;
        celula.className = "text-center py-5 text-muted";

        celula.textContent = fabricantesCadastrados.length === 0
            ? "Nenhum fabricante cadastrado."
            : "Nenhum fabricante encontrado para os filtros informados.";

        linha.appendChild(celula);
        tabela.appendChild(linha);

        return;
    }

    const ordenados = [...fabricantes].sort((a, b) =>
        String(a.nome ?? "").localeCompare(
            String(b.nome ?? ""),
            "pt-BR"
        )
    );

    ordenados.forEach(fabricante => {
        const linha = document.createElement("tr");

        // Nome e ícone
        const colunaNome = document.createElement("td");

        const identidade = document.createElement("div");
        identidade.className = "fabricante-identidade";

        const avatar = document.createElement("span");
        avatar.className = "fabricante-avatar";

        const icone = document.createElement("i");
        icone.className = "bi bi-building";

        avatar.appendChild(icone);

        const nome = document.createElement("span");
        nome.className = "fabricante-nome";
        nome.textContent = fabricante.nome ?? "Sem nome";

        identidade.append(avatar, nome);
        colunaNome.appendChild(identidade);

        // País
        const colunaPais = document.createElement("td");

        const pais = document.createElement("span");
        pais.className = "fabricante-pais";

        const iconePais = document.createElement("i");
        iconePais.className = "bi bi-globe-americas";

        pais.append(
            iconePais,
            document.createTextNode(fabricante.paisOrigem ?? "—")
        );

        colunaPais.appendChild(pais);

        // ID
        const colunaCodigo = criarCelula(
            `#${fabricante.fabricanteId}`,
            "fabricante-codigo"
        );

        // Ações
        const colunaAcoes = document.createElement("td");

        const acoes = document.createElement("div");
        acoes.className = "fabricante-acoes";

        const botaoEditar = criarBotaoAcao(
            "Editar",
            "bi-pencil-square",
            "btn-outline-secondary",
            () => abrirEdicaoFabricante(fabricante.fabricanteId)
        );

        const botaoExcluir = criarBotaoAcao(
            "Excluir",
            "bi-trash3",
            "btn-outline-danger",
            () => abrirExclusaoFabricante(fabricante.fabricanteId)
        );

        acoes.append(botaoEditar, botaoExcluir);
        colunaAcoes.appendChild(acoes);

        linha.append(
            colunaNome,
            colunaPais,
            colunaCodigo,
            colunaAcoes
        );

        tabela.appendChild(linha);
    });
}

/* ------------------------------------------
   CREATE — Abrir cadastro
------------------------------------------ */

function abrirNovoFabricante() {
    fabricanteEmEdicaoId = null;

    elemento("formFabricante").reset();
    elemento("mensagemFabricante").replaceChildren();

    elemento("tituloModalFabricante").textContent =
        "Novo fabricante";

    elemento("btnSalvarFabricante").innerHTML =
        '<i class="bi bi-check-lg"></i> Salvar fabricante';

    modalFabricante().show();
}

/* ------------------------------------------
   UPDATE — Abrir edição
------------------------------------------ */

function abrirEdicaoFabricante(id) {
    const fabricante = fabricantesCadastrados.find(
        f => f.fabricanteId === id
    );

    if (!fabricante) {
        mostrarAviso("Fabricante não encontrado.", "warning");
        return;
    }

    fabricanteEmEdicaoId = id;

    elemento("formFabricante").reset();
    elemento("mensagemFabricante").replaceChildren();

    elemento("tituloModalFabricante").textContent =
        "Editar fabricante";

    elemento("fabricanteNome").value =
        fabricante.nome ?? "";

    elemento("fabricantePais").value =
        fabricante.paisOrigem ?? "";

    elemento("btnSalvarFabricante").innerHTML =
        '<i class="bi bi-check-lg"></i> Salvar alterações';

    modalFabricante().show();
}

/* ------------------------------------------
   CREATE / UPDATE — Salvar
------------------------------------------ */

async function salvarFabricante(evento) {
    evento.preventDefault();

    const nome = elemento("fabricanteNome").value.trim();
    const paisOrigem = elemento("fabricantePais").value.trim();

    const botao = elemento("btnSalvarFabricante");

    elemento("mensagemFabricante").replaceChildren();

    if (!nome || !paisOrigem) {
        mostrarErroModal(
            "mensagemFabricante",
            "Preencha o nome e o país de origem."
        );
        return;
    }

    const editando = fabricanteEmEdicaoId !== null;

    const url = editando
        ? `${API_FABRICANTES}/${fabricanteEmEdicaoId}`
        : API_FABRICANTES;

    const dados = {
        nome,
        paisOrigem
    };

    // Compatibilidade com controllers que validam
    // a igualdade entre o ID da rota e o ID do corpo.
    if (editando) {
        dados.fabricanteId = fabricanteEmEdicaoId;
    }

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
            throw new Error(await obterMensagemErro(resposta));
        }

        modalFabricante().hide();

        elemento("formFabricante").reset();
        fabricanteEmEdicaoId = null;

        await carregarFabricantes();

        mostrarAviso(
            editando
                ? "Fabricante atualizado com sucesso!"
                : "Fabricante cadastrado com sucesso!"
        );

    } catch (erro) {
        console.error("Erro ao salvar fabricante:", erro);

        mostrarErroModal(
            "mensagemFabricante",
            erro.message
        );

    } finally {
        botao.disabled = false;

        botao.innerHTML = fabricanteEmEdicaoId !== null
            ? '<i class="bi bi-check-lg"></i> Salvar alterações'
            : '<i class="bi bi-check-lg"></i> Salvar fabricante';
    }
}

/* ------------------------------------------
   DELETE — Abrir confirmação
------------------------------------------ */

function abrirExclusaoFabricante(id) {
    const fabricante = fabricantesCadastrados.find(
        f => f.fabricanteId === id
    );

    if (!fabricante) {
        mostrarAviso("Fabricante não encontrado.", "warning");
        return;
    }

    fabricanteParaExcluirId = id;

    elemento("nomeFabricanteExcluir").textContent =
        fabricante.nome ?? "este fabricante";

    elemento("mensagemExclusaoFabricante").replaceChildren();

    modalExclusao().show();
}

/* ------------------------------------------
   DELETE — Confirmar exclusão
------------------------------------------ */

async function confirmarExclusaoFabricante() {
    if (fabricanteParaExcluirId === null) {
        return;
    }

    const id = fabricanteParaExcluirId;
    const botao = elemento("btnConfirmarExclusaoFabricante");

    botao.disabled = true;
    botao.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span> Excluindo...';

    try {
        const resposta = await fetch(
            `${API_FABRICANTES}/${id}`,
            { method: "DELETE" }
        );

        if (!resposta.ok) {
            throw new Error(await obterMensagemErro(resposta));
        }

        fabricanteParaExcluirId = null;

        modalExclusao().hide();

        await carregarFabricantes();

        mostrarAviso("Fabricante excluído com sucesso!");

    } catch (erro) {
        console.error("Erro ao excluir fabricante:", erro);

        mostrarErroModal(
            "mensagemExclusaoFabricante",
            erro.message
        );

    } finally {
        botao.disabled = false;
        botao.innerHTML =
            '<i class="bi bi-trash3"></i> Excluir fabricante';
    }
}

/* ------------------------------------------
   Inicialização
------------------------------------------ */

document.addEventListener("DOMContentLoaded", () => {
    carregarFabricantes();

    elemento("btnNovoFabricante")
        .addEventListener("click", abrirNovoFabricante);

    elemento("formFabricante")
        .addEventListener("submit", salvarFabricante);

    elemento("filtroNomeFabricante")
        .addEventListener("input", filtrarFabricantes);

    elemento("filtroPaisFabricante")
        .addEventListener("input", filtrarFabricantes);

    elemento("btnLimparFiltros")
        .addEventListener("click", limparFiltros);

    elemento("btnAtualizarFabricantes")
        .addEventListener("click", carregarFabricantes);

    elemento("btnConfirmarExclusaoFabricante")
        .addEventListener("click", confirmarExclusaoFabricante);
});