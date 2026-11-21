/* ==========================================
   MOVIA | CRUD de Categorias
========================================== */

const API_CATEGORIAS = "http://localhost:5000/api/CategoriasVeiculo";

let categoriasCadastradas = [];
let categoriaEmEdicaoId = null;
let categoriaParaExcluirId = null;

const el = id => document.getElementById(id);

const modalCategoria = () =>
    bootstrap.Modal.getOrCreateInstance(el("modalCategoria"));

const modalExclusaoCategoria = () =>
    bootstrap.Modal.getOrCreateInstance(el("modalExcluirCategoria"));

/* Utilitários */

function normalizarTexto(texto) {
    return String(texto ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function mostrarAvisoCategoria(mensagem, tipo = "success") {
    const container = el("avisoCategorias");
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

function mostrarErroCategoria(id, mensagem) {
    const container = el(id);
    container.replaceChildren();

    const alerta = document.createElement("div");
    alerta.className = "alert alert-danger mb-0";
    alerta.textContent = mensagem;

    container.appendChild(alerta);
}

async function obterErroCategoria(resposta) {
    let detalhe = "";

    try {
        const conteudo = await resposta.text();

        if (conteudo) {
            try {
                const dados = JSON.parse(conteudo);
                detalhe = dados.detail ||
                    dados.title ||
                    dados.message ||
                    dados.mensagem ||
                    "";
            } catch {
                detalhe = conteudo.length <= 180 ? conteudo : "";
            }
        }
    } catch {
        // Mantém mensagem padrão.
    }

    if (resposta.status === 404) {
        return "Categoria não encontrada.";
    }

    if (resposta.status === 409) {
        return "Esta categoria possui registros relacionados e não pode ser excluída.";
    }

    if (resposta.status === 400) {
        return detalhe || "Dados inválidos. Verifique os campos preenchidos.";
    }

    if (resposta.status === 500) {
        return "O servidor não conseguiu concluir a operação. " +
            "Verifique se há veículos vinculados a esta categoria.";
    }

    return detalhe ||
        `Não foi possível concluir a operação (HTTP ${resposta.status}).`;
}

/* READ — Listagem */

async function carregarCategorias() {
    const tabela = el("tabelaCategorias");

    tabela.innerHTML = `
        <tr>
            <td colspan="4" class="text-center py-5">
                <span class="spinner-border spinner-border-sm me-2"></span>
                Carregando categorias...
            </td>
        </tr>
    `;

    try {
        const resposta = await fetch(API_CATEGORIAS);

        if (!resposta.ok) {
            throw new Error(await obterErroCategoria(resposta));
        }

        const dados = await resposta.json();

        if (!Array.isArray(dados)) {
            throw new Error("A API retornou um formato inesperado.");
        }

        categoriasCadastradas = dados;

        atualizarIndicadoresCategorias();
        filtrarCategorias();

    } catch (erro) {
        console.error("Erro ao carregar categorias:", erro);

        tabela.replaceChildren();

        const linha = document.createElement("tr");
        const celula = document.createElement("td");

        celula.colSpan = 4;
        celula.className = "text-center text-danger py-5";
        celula.textContent = "Não foi possível carregar as categorias.";

        linha.appendChild(celula);
        tabela.appendChild(linha);

        el("totalCategorias").textContent = "—";
        el("categoriasComDescricao").textContent = "—";
        el("totalResultadosCategorias").textContent = "—";

        mostrarAvisoCategoria(erro.message, "danger");
    }
}

/* Indicadores */

function atualizarIndicadoresCategorias() {
    const comDescricao = categoriasCadastradas.filter(
        categoria => String(categoria.descricao ?? "").trim().length > 0
    ).length;

    el("totalCategorias").textContent = categoriasCadastradas.length;
    el("categoriasComDescricao").textContent = comDescricao;
}

/* Filtros */

function filtrarCategorias() {
    const nome = normalizarTexto(el("filtroNomeCategoria").value);
    const descricao = normalizarTexto(el("filtroDescricaoCategoria").value);

    const filtradas = categoriasCadastradas.filter(categoria =>
        normalizarTexto(categoria.nome).includes(nome) &&
        normalizarTexto(categoria.descricao).includes(descricao)
    );

    el("totalResultadosCategorias").textContent = filtradas.length;
    renderizarCategorias(filtradas);
}

function limparFiltrosCategorias() {
    el("filtroNomeCategoria").value = "";
    el("filtroDescricaoCategoria").value = "";
    filtrarCategorias();
}

/* Renderização da tabela */

function criarBotaoCategoria(texto, icone, classe, acao) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = `btn btn-sm ${classe}`;

    const simbolo = document.createElement("i");
    simbolo.className = `bi ${icone} me-1`;

    botao.append(simbolo, document.createTextNode(texto));
    botao.addEventListener("click", acao);

    return botao;
}

function renderizarCategorias(categorias) {
    const tabela = el("tabelaCategorias");
    tabela.replaceChildren();

    if (categorias.length === 0) {
        const linha = document.createElement("tr");
        const celula = document.createElement("td");

        celula.colSpan = 4;
        celula.className = "text-center py-5 text-muted";
        celula.textContent = categoriasCadastradas.length === 0
            ? "Nenhuma categoria cadastrada."
            : "Nenhuma categoria encontrada para os filtros informados.";

        linha.appendChild(celula);
        tabela.appendChild(linha);
        return;
    }

    const ordenadas = [...categorias].sort((a, b) =>
        String(a.nome ?? "").localeCompare(
            String(b.nome ?? ""),
            "pt-BR"
        )
    );

    ordenadas.forEach(categoria => {
        const linha = document.createElement("tr");

        const colunaNome = document.createElement("td");
        const identidade = document.createElement("div");
        identidade.className = "categoria-identidade";

        const avatar = document.createElement("span");
        avatar.className = "categoria-avatar";

        const icone = document.createElement("i");
        icone.className = "bi bi-tag";

        avatar.appendChild(icone);

        const nome = document.createElement("span");
        nome.className = "categoria-nome";
        nome.textContent = categoria.nome ?? "Sem nome";

        identidade.append(avatar, nome);
        colunaNome.appendChild(identidade);

        const colunaDescricao = document.createElement("td");
        const descricao = document.createElement("span");
        descricao.className = "categoria-descricao";
        descricao.textContent = categoria.descricao || "Sem descrição";
        colunaDescricao.appendChild(descricao);

        const colunaCodigo = document.createElement("td");
        colunaCodigo.className = "categoria-codigo";
        colunaCodigo.textContent = `#${categoria.categoriaVeiculoId}`;

        const colunaAcoes = document.createElement("td");
        const acoes = document.createElement("div");
        acoes.className = "categoria-acoes";

        const editar = criarBotaoCategoria(
            "Editar",
            "bi-pencil-square",
            "btn-outline-secondary",
            () => abrirEdicaoCategoria(categoria.categoriaVeiculoId)
        );

        const excluir = criarBotaoCategoria(
            "Excluir",
            "bi-trash3",
            "btn-outline-danger",
            () => abrirExclusaoCategoria(categoria.categoriaVeiculoId)
        );

        acoes.append(editar, excluir);
        colunaAcoes.appendChild(acoes);

        linha.append(
            colunaNome,
            colunaDescricao,
            colunaCodigo,
            colunaAcoes
        );

        tabela.appendChild(linha);
    });
}

/* CREATE — Abrir cadastro */

function abrirNovaCategoria() {
    categoriaEmEdicaoId = null;

    el("formCategoria").reset();
    el("mensagemCategoria").replaceChildren();

    el("tituloModalCategoria").textContent = "Nova categoria";
    el("btnSalvarCategoria").innerHTML =
        '<i class="bi bi-check-lg"></i> Salvar categoria';

    modalCategoria().show();
}

/* UPDATE — Abrir edição */

function abrirEdicaoCategoria(id) {
    const categoria = categoriasCadastradas.find(
        item => item.categoriaVeiculoId === id
    );

    if (!categoria) {
        mostrarAvisoCategoria("Categoria não encontrada.", "warning");
        return;
    }

    categoriaEmEdicaoId = id;

    el("formCategoria").reset();
    el("mensagemCategoria").replaceChildren();

    el("tituloModalCategoria").textContent = "Editar categoria";
    el("categoriaNome").value = categoria.nome ?? "";
    el("categoriaDescricao").value = categoria.descricao ?? "";

    el("btnSalvarCategoria").innerHTML =
        '<i class="bi bi-check-lg"></i> Salvar alterações';

    modalCategoria().show();
}

/* CREATE / UPDATE — Salvar */

async function salvarCategoria(evento) {
    evento.preventDefault();

    const nome = el("categoriaNome").value.trim();
    const descricao = el("categoriaDescricao").value.trim();

    if (!nome) {
        mostrarErroCategoria(
            "mensagemCategoria",
            "Informe o nome da categoria."
        );
        return;
    }

    const editando = categoriaEmEdicaoId !== null;

    const url = editando
        ? `${API_CATEGORIAS}/${categoriaEmEdicaoId}`
        : API_CATEGORIAS;

    const dados = { nome, descricao };

    if (editando) {
        dados.categoriaVeiculoId = categoriaEmEdicaoId;
    }

    const botao = el("btnSalvarCategoria");
    botao.disabled = true;
    botao.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span> Salvando...';

    el("mensagemCategoria").replaceChildren();

    try {
        const resposta = await fetch(url, {
            method: editando ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) {
            throw new Error(await obterErroCategoria(resposta));
        }

        modalCategoria().hide();
        el("formCategoria").reset();
        categoriaEmEdicaoId = null;

        await carregarCategorias();

        mostrarAvisoCategoria(
            editando
                ? "Categoria atualizada com sucesso!"
                : "Categoria cadastrada com sucesso!"
        );

    } catch (erro) {
        console.error("Erro ao salvar categoria:", erro);
        mostrarErroCategoria("mensagemCategoria", erro.message);

    } finally {
        botao.disabled = false;
        botao.innerHTML = categoriaEmEdicaoId !== null
            ? '<i class="bi bi-check-lg"></i> Salvar alterações'
            : '<i class="bi bi-check-lg"></i> Salvar categoria';
    }
}

/* DELETE — Abrir confirmação */

function abrirExclusaoCategoria(id) {
    const categoria = categoriasCadastradas.find(
        item => item.categoriaVeiculoId === id
    );

    if (!categoria) {
        mostrarAvisoCategoria("Categoria não encontrada.", "warning");
        return;
    }

    categoriaParaExcluirId = id;
    el("nomeCategoriaExcluir").textContent = categoria.nome ?? "esta categoria";
    el("mensagemExclusaoCategoria").replaceChildren();

    modalExclusaoCategoria().show();
}

/* DELETE — Confirmar exclusão */

async function confirmarExclusaoCategoria() {
    if (categoriaParaExcluirId === null) return;

    const id = categoriaParaExcluirId;
    const botao = el("btnConfirmarExclusaoCategoria");

    botao.disabled = true;
    botao.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span> Excluindo...';

    try {
        const resposta = await fetch(
            `${API_CATEGORIAS}/${id}`,
            { method: "DELETE" }
        );

        if (!resposta.ok) {
            throw new Error(await obterErroCategoria(resposta));
        }

        categoriaParaExcluirId = null;
        modalExclusaoCategoria().hide();

        await carregarCategorias();
        mostrarAvisoCategoria("Categoria excluída com sucesso!");

    } catch (erro) {
        console.error("Erro ao excluir categoria:", erro);
        mostrarErroCategoria("mensagemExclusaoCategoria", erro.message);

    } finally {
        botao.disabled = false;
        botao.innerHTML =
            '<i class="bi bi-trash3"></i> Excluir categoria';
    }
}

/* Inicialização */

document.addEventListener("DOMContentLoaded", () => {
    carregarCategorias();

    el("btnNovaCategoria")
        .addEventListener("click", abrirNovaCategoria);

    el("formCategoria")
        .addEventListener("submit", salvarCategoria);

    el("filtroNomeCategoria")
        .addEventListener("input", filtrarCategorias);

    el("filtroDescricaoCategoria")
        .addEventListener("input", filtrarCategorias);

    el("btnLimparFiltrosCategorias")
        .addEventListener("click", limparFiltrosCategorias);

    el("btnAtualizarCategorias")
        .addEventListener("click", carregarCategorias);

    el("btnConfirmarExclusaoCategoria")
        .addEventListener("click", confirmarExclusaoCategoria);
});