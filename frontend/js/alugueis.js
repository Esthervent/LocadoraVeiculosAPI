/* ==========================================
   MOVIA | CRUD de Aluguéis
========================================== */

const API_BASE_ALUGUEIS = "http://localhost:5000/api";
const API_ALUGUEIS = `${API_BASE_ALUGUEIS}/Alugueis`;
const API_CLIENTES_ALUGUEL = `${API_BASE_ALUGUEIS}/Clientes`;
const API_VEICULOS_ALUGUEL = `${API_BASE_ALUGUEIS}/Veiculos`;

let alugueisCadastrados = [];
let clientesDisponiveis = [];
let veiculosCadastrados = [];

let aluguelEmEdicaoId = null;
let aluguelParaExcluirId = null;
let aluguelParaDevolverId = null;

const elAluguel = id => document.getElementById(id);

function obterModalAluguel(id) {
    return bootstrap.Modal.getOrCreateInstance(elAluguel(id));
}

/* ==========================================
   UTILITÁRIOS
========================================== */

function normalizarAluguel(texto) {
    return String(texto ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function formatarMoedaAluguel(valor) {
    const numero = Number(valor);

    if (!Number.isFinite(numero)) return "—";

    return numero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function formatarDataAluguel(valor) {
    if (!valor) return "—";

    const partes = String(valor).match(
        /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/
    );

    if (!partes) return "—";

    const [, ano, mes, dia, hora, minuto] = partes;

    return hora
        ? `${dia}/${mes}/${ano} ${hora}:${minuto}`
        : `${dia}/${mes}/${ano}`;
}

function dataParaInput(valor) {
    if (!valor) return "";

    const partes = String(valor).match(
        /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/
    );

    return partes ? `${partes[1]}T${partes[2]}` : "";
}

function dataAtualInput() {
    const agora = new Date();
    const local = new Date(
        agora.getTime() - agora.getTimezoneOffset() * 60000
    );

    return local.toISOString().slice(0, 16);
}

function dataParaApi(valor) {
    // Mantém o horário local informado no formulário.
    return `${valor}:00`;
}

function aluguelFinalizado(aluguel) {
    return Boolean(aluguel.dataDevolucao);
}

function obterClienteAluguel(id) {
    return clientesDisponiveis.find(
        cliente => Number(cliente.clienteId) === Number(id)
    );
}

function obterVeiculoAluguel(id) {
    return veiculosCadastrados.find(
        veiculo => Number(veiculo.veiculoId) === Number(id)
    );
}

function nomeClienteAluguel(aluguel) {
    return obterClienteAluguel(aluguel.clienteId)?.nome
        ?? aluguel.cliente?.nome
        ?? `Cliente #${aluguel.clienteId}`;
}

function nomeVeiculoAluguel(aluguel) {
    const veiculo = obterVeiculoAluguel(aluguel.veiculoId)
        ?? aluguel.veiculo;

    if (!veiculo) {
        return `Veículo #${aluguel.veiculoId}`;
    }

    return `${veiculo.modelo ?? "Veículo"} — ${veiculo.placa ?? "Sem placa"}`;
}

function avisoAluguel(mensagem, tipo = "success") {
    const container = elAluguel("avisoAlugueis");
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

function erroNoModalAluguel(id, mensagem) {
    const container = elAluguel(id);
    container.replaceChildren();

    const alerta = document.createElement("div");
    alerta.className = "alert alert-danger mb-0";
    alerta.textContent = mensagem;

    container.appendChild(alerta);
}

async function mensagemErroApiAluguel(resposta) {
    let detalhe = "";

    try {
        const texto = await resposta.text();

        if (texto) {
            try {
                const dados = JSON.parse(texto);

                detalhe = dados.detail
                    || dados.message
                    || dados.mensagem
                    || "";

                if (!detalhe && dados.errors) {
                    detalhe = Object.entries(dados.errors)
                        .map(([campo, mensagens]) =>
                            `${campo}: ${[].concat(mensagens).join(", ")}`
                        )
                        .join(" | ");
                }

                if (!detalhe) {
                    detalhe = dados.title || "";
                }
            } catch {
                detalhe = texto.length <= 200 ? texto : "";
            }
        }
    } catch {
        // Mantém mensagem padrão.
    }

    if (resposta.status === 404) {
        return "Registro não encontrado.";
    }

    if (resposta.status === 409) {
        return detalhe || "Operação não permitida devido a um conflito.";
    }

    if (resposta.status === 400) {
        return detalhe || "Dados inválidos. Confira os campos.";
    }

    if (resposta.status === 500) {
        return "O servidor não conseguiu concluir a operação. " +
            "Verifique as regras do aluguel e os vínculos no banco.";
    }

    return detalhe || `Erro HTTP ${resposta.status}.`;
}

async function requisitarJsonAluguel(url, opcoes = {}) {
    const resposta = await fetch(url, opcoes);

    if (!resposta.ok) {
        throw new Error(await mensagemErroApiAluguel(resposta));
    }

    if (resposta.status === 204) return null;

    const texto = await resposta.text();
    return texto ? JSON.parse(texto) : null;
}

/* ==========================================
   READ — CARREGAR DADOS
========================================== */

async function carregarDadosAlugueis() {
    elAluguel("tabelaAlugueis").innerHTML = `
        <tr>
            <td colspan="6" class="text-center py-5">
                <span class="spinner-border spinner-border-sm me-2"></span>
                Carregando aluguéis...
            </td>
        </tr>
    `;

    try {
        const [alugueis, clientes, veiculos] = await Promise.all([
            requisitarJsonAluguel(API_ALUGUEIS),
            requisitarJsonAluguel(API_CLIENTES_ALUGUEL),
            requisitarJsonAluguel(API_VEICULOS_ALUGUEL)
        ]);

        if (
            !Array.isArray(alugueis) ||
            !Array.isArray(clientes) ||
            !Array.isArray(veiculos)
        ) {
            throw new Error("A API retornou dados em formato inesperado.");
        }

        alugueisCadastrados = alugueis;
        clientesDisponiveis = clientes;
        veiculosCadastrados = veiculos;

        atualizarIndicadoresAlugueis();
        filtrarAlugueis();

    } catch (erro) {
        console.error("Erro ao carregar aluguéis:", erro);

        elAluguel("tabelaAlugueis").replaceChildren();

        const linha = document.createElement("tr");
        const celula = document.createElement("td");

        celula.colSpan = 6;
        celula.className = "text-center text-danger py-5";
        celula.textContent = "Não foi possível carregar os aluguéis.";

        linha.appendChild(celula);
        elAluguel("tabelaAlugueis").appendChild(linha);

        [
            "totalAlugueis",
            "alugueisAtivos",
            "alugueisFinalizados",
            "resultadosAlugueis"
        ].forEach(id => {
            elAluguel(id).textContent = "—";
        });

        avisoAluguel(erro.message, "danger");
    }
}

/* ==========================================
   INDICADORES
========================================== */

function atualizarIndicadoresAlugueis() {
    const finalizados = alugueisCadastrados.filter(
        aluguelFinalizado
    ).length;

    elAluguel("totalAlugueis").textContent =
        alugueisCadastrados.length;

    elAluguel("alugueisAtivos").textContent =
        alugueisCadastrados.length - finalizados;

    elAluguel("alugueisFinalizados").textContent =
        finalizados;
}

/* ==========================================
   FILTROS
========================================== */

function filtrarAlugueis() {
    const cliente = normalizarAluguel(
        elAluguel("filtroClienteAluguel").value
    );

    const veiculo = normalizarAluguel(
        elAluguel("filtroVeiculoAluguel").value
    );

    const status = elAluguel("filtroStatusAluguel").value;

    const filtrados = alugueisCadastrados.filter(aluguel => {
        const correspondeCliente = normalizarAluguel(
            nomeClienteAluguel(aluguel)
        ).includes(cliente);

        const correspondeVeiculo = normalizarAluguel(
            nomeVeiculoAluguel(aluguel)
        ).includes(veiculo);

        const finalizado = aluguelFinalizado(aluguel);

        const correspondeStatus =
            !status ||
            (status === "finalizado" && finalizado) ||
            (status === "ativo" && !finalizado);

        return correspondeCliente &&
            correspondeVeiculo &&
            correspondeStatus;
    });

    elAluguel("resultadosAlugueis").textContent =
        filtrados.length;

    renderizarAlugueis(filtrados);
}

function limparFiltrosAlugueis() {
    elAluguel("filtroClienteAluguel").value = "";
    elAluguel("filtroVeiculoAluguel").value = "";
    elAluguel("filtroStatusAluguel").value = "";

    filtrarAlugueis();
}

/* ==========================================
   TABELA
========================================== */

function criarBotaoAluguel(texto, icone, classe, acao) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = `btn btn-sm ${classe}`;

    const simbolo = document.createElement("i");
    simbolo.className = `bi ${icone} me-1`;

    botao.append(simbolo, document.createTextNode(texto));
    botao.addEventListener("click", acao);

    return botao;
}

function criarTdAluguel(conteudo) {
    const td = document.createElement("td");
    td.textContent = conteudo ?? "—";
    return td;
}

function renderizarAlugueis(alugueis) {
    const tabela = elAluguel("tabelaAlugueis");
    tabela.replaceChildren();

    if (alugueis.length === 0) {
        const linha = document.createElement("tr");
        const td = document.createElement("td");

        td.colSpan = 6;
        td.className = "text-center text-muted py-5";
        td.textContent = alugueisCadastrados.length
            ? "Nenhum aluguel corresponde aos filtros."
            : "Nenhum aluguel cadastrado.";

        linha.appendChild(td);
        tabela.appendChild(linha);
        return;
    }

    const ordenados = [...alugueis].sort((a, b) =>
        String(b.dataInicio ?? "").localeCompare(
            String(a.dataInicio ?? "")
        )
    );

    ordenados.forEach(aluguel => {
        const linha = document.createElement("tr");

        const tdIdentidade = document.createElement("td");
        const identidade = document.createElement("div");
        identidade.className = "aluguel-identidade";

        const avatar = document.createElement("span");
        avatar.className = "aluguel-avatar";

        const icone = document.createElement("i");
        icone.className = "bi bi-car-front";
        avatar.appendChild(icone);

        const detalhes = document.createElement("div");

        const nome = document.createElement("strong");
        nome.textContent = nomeClienteAluguel(aluguel);

        const modelo = document.createElement("small");
        modelo.textContent = nomeVeiculoAluguel(aluguel);

        detalhes.append(nome, modelo);
        identidade.append(avatar, detalhes);
        tdIdentidade.appendChild(identidade);

        const tdPeriodo = document.createElement("td");
        tdPeriodo.className = "aluguel-periodo";

        const inicio = document.createElement("strong");
        inicio.textContent = formatarDataAluguel(aluguel.dataInicio);

        const fim = document.createElement("small");
        fim.textContent = `Prevista: ${formatarDataAluguel(
            aluguel.dataFimPrevista
        )}`;

        tdPeriodo.append(inicio, fim);

        const tdDiaria = criarTdAluguel(
            formatarMoedaAluguel(aluguel.valorDiaria)
        );

        const tdTotal = criarTdAluguel(
            aluguel.valorTotal == null
                ? "A calcular"
                : formatarMoedaAluguel(aluguel.valorTotal)
        );

        const tdStatus = document.createElement("td");
        const status = document.createElement("span");

        const finalizado = aluguelFinalizado(aluguel);

        status.className = finalizado
            ? "aluguel-status finalizado"
            : "aluguel-status ativo";

        status.textContent = finalizado
            ? "Finalizado"
            : "Em andamento";

        tdStatus.appendChild(status);

        const tdAcoes = document.createElement("td");
        const acoes = document.createElement("div");
        acoes.className = "aluguel-acoes";

        const editar = criarBotaoAluguel(
            "Editar",
            "bi-pencil-square",
            "btn-outline-secondary",
            () => abrirEdicaoAluguel(aluguel.aluguelId)
        );

        acoes.appendChild(editar);

        if (!finalizado) {
            const devolver = criarBotaoAluguel(
                "Devolver",
                "bi-check-circle",
                "btn-outline-success",
                () => abrirDevolucaoAluguel(aluguel.aluguelId)
            );

            acoes.appendChild(devolver);
        }

        const excluir = criarBotaoAluguel(
            "Excluir",
            "bi-trash3",
            "btn-outline-danger",
            () => abrirExclusaoAluguel(aluguel.aluguelId)
        );

        acoes.appendChild(excluir);
        tdAcoes.appendChild(acoes);

        linha.append(
            tdIdentidade,
            tdPeriodo,
            tdDiaria,
            tdTotal,
            tdStatus,
            tdAcoes
        );

        tabela.appendChild(linha);
    });
}

/* ==========================================
   PREENCHER SELECTS
========================================== */

function adicionarOpcao(select, valor, texto) {
    const opcao = document.createElement("option");
    opcao.value = valor;
    opcao.textContent = texto;
    select.appendChild(opcao);
}

function preencherClientesAluguel(selecionado = null) {
    const select = elAluguel("aluguelCliente");
    select.replaceChildren();

    adicionarOpcao(select, "", "Selecione o cliente");

    [...clientesDisponiveis]
        .sort((a, b) => String(a.nome ?? "").localeCompare(
            String(b.nome ?? ""), "pt-BR"
        ))
        .forEach(cliente => {
            adicionarOpcao(
                select,
                cliente.clienteId,
                cliente.nome ?? `Cliente #${cliente.clienteId}`
            );
        });

    if (selecionado !== null) {
        select.value = String(selecionado);
    }
}

function preencherVeiculosAluguel(selecionado = null) {
    const select = elAluguel("aluguelVeiculo");
    select.replaceChildren();

    adicionarOpcao(select, "", "Selecione o veículo");

    veiculosCadastrados
        .filter(veiculo =>
            veiculo.disponivel === true ||
            Number(veiculo.veiculoId) === Number(selecionado)
        )
        .sort((a, b) => String(a.modelo ?? "").localeCompare(
            String(b.modelo ?? ""), "pt-BR"
        ))
        .forEach(veiculo => {
            const identificacao =
                `${veiculo.modelo ?? "Veículo"} — ${veiculo.placa ?? "Sem placa"}`;

            adicionarOpcao(
                select,
                veiculo.veiculoId,
                identificacao
            );
        });

    if (selecionado !== null) {
        select.value = String(selecionado);
    }
}

/* ==========================================
   CREATE — NOVO ALUGUEL
========================================== */

async function abrirNovoAluguel() {
    try {
        await carregarReferenciasAluguel();
    } catch (erro) {
        avisoAluguel(erro.message, "danger");
        return;
    }

    aluguelEmEdicaoId = null;

    elAluguel("formAluguel").reset();
    elAluguel("mensagemAluguel").replaceChildren();

    preencherClientesAluguel();
    preencherVeiculosAluguel();

    elAluguel("tituloModalAluguel").textContent = "Novo aluguel";
    elAluguel("aluguelDataInicio").value = dataAtualInput();

    elAluguel("btnSalvarAluguel").innerHTML =
        '<i class="bi bi-check-lg"></i> Salvar aluguel';

    obterModalAluguel("modalAluguel").show();
}

async function carregarReferenciasAluguel() {
    const [clientes, veiculos] = await Promise.all([
        requisitarJsonAluguel(API_CLIENTES_ALUGUEL),
        requisitarJsonAluguel(API_VEICULOS_ALUGUEL)
    ]);

    if (!Array.isArray(clientes) || !Array.isArray(veiculos)) {
        throw new Error("Não foi possível carregar clientes e veículos.");
    }

    clientesDisponiveis = clientes;
    veiculosCadastrados = veiculos;
}

/* ==========================================
   UPDATE — EDITAR ALUGUEL
========================================== */

async function abrirEdicaoAluguel(id) {
    const aluguel = alugueisCadastrados.find(
        item => Number(item.aluguelId) === Number(id)
    );

    if (!aluguel) {
        avisoAluguel("Aluguel não encontrado.", "warning");
        return;
    }

    if (aluguelFinalizado(aluguel)) {
        avisoAluguel(
            "Este aluguel já foi finalizado. A edição de contratos " +
            "finalizados deve ser feita conforme as regras do backend.",
            "warning"
        );
        return;
    }

    try {
        await carregarReferenciasAluguel();
    } catch (erro) {
        avisoAluguel(erro.message, "danger");
        return;
    }

    aluguelEmEdicaoId = id;

    elAluguel("formAluguel").reset();
    elAluguel("mensagemAluguel").replaceChildren();

    preencherClientesAluguel(aluguel.clienteId);
    preencherVeiculosAluguel(aluguel.veiculoId);

    elAluguel("tituloModalAluguel").textContent = "Editar aluguel";

    elAluguel("aluguelDataInicio").value =
        dataParaInput(aluguel.dataInicio);

    elAluguel("aluguelDataFim").value =
        dataParaInput(aluguel.dataFimPrevista);

    elAluguel("aluguelKmInicial").value =
        aluguel.quilometragemInicial ?? 0;

    elAluguel("aluguelValorDiaria").value =
        aluguel.valorDiaria ?? "";

    elAluguel("btnSalvarAluguel").innerHTML =
        '<i class="bi bi-check-lg"></i> Salvar alterações';

    obterModalAluguel("modalAluguel").show();
}

/* ==========================================
   CREATE / UPDATE — SALVAR
========================================== */

async function salvarAluguel(evento) {
    evento.preventDefault();

    const clienteId = Number(elAluguel("aluguelCliente").value);
    const veiculoId = Number(elAluguel("aluguelVeiculo").value);

    const inicio = elAluguel("aluguelDataInicio").value;
    const fim = elAluguel("aluguelDataFim").value;

    const kmInicial = Number(
        elAluguel("aluguelKmInicial").value
    );

    const valorDiaria = Number(
        elAluguel("aluguelValorDiaria").value
    );

    elAluguel("mensagemAluguel").replaceChildren();

    if (!clienteId || !veiculoId) {
        erroNoModalAluguel(
            "mensagemAluguel",
            "Selecione um cliente e um veículo."
        );
        return;
    }

    if (!inicio || !fim || fim <= inicio) {
        erroNoModalAluguel(
            "mensagemAluguel",
            "A devolução prevista deve ser posterior ao início."
        );
        return;
    }

    if (!Number.isInteger(kmInicial) || kmInicial < 0) {
        erroNoModalAluguel(
            "mensagemAluguel",
            "Informe uma quilometragem inicial válida."
        );
        return;
    }

    if (!Number.isFinite(valorDiaria) || valorDiaria <= 0) {
        erroNoModalAluguel(
            "mensagemAluguel",
            "Informe um valor de diária maior que zero."
        );
        return;
    }

    const editando = aluguelEmEdicaoId !== null;

    const original = editando
        ? alugueisCadastrados.find(
            item => Number(item.aluguelId) === Number(aluguelEmEdicaoId)
        )
        : null;

    if (editando && !original) {
        erroNoModalAluguel(
            "mensagemAluguel",
            "Não foi possível localizar o aluguel para edição."
        );
        return;
    }

    // Mantém campos existentes ao editar.
    // O valorTotal é preservado na edição e enviado como 0
    // no cadastro; o backend deve aplicar suas próprias regras.
    const dados = {
        clienteId,
        veiculoId,
        dataInicio: dataParaApi(inicio),
        dataFimPrevista: dataParaApi(fim),
        dataDevolucao: original?.dataDevolucao ?? null,
        quilometragemInicial: kmInicial,
        quilometragemFinal: original?.quilometragemFinal ?? null,
        valorDiaria,
        valorTotal: original?.valorTotal ?? 0
    };

    if (editando) {
        dados.aluguelId = aluguelEmEdicaoId;
    }

    const botao = elAluguel("btnSalvarAluguel");
    botao.disabled = true;
    botao.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span> Salvando...';

    try {
        const url = editando
            ? `${API_ALUGUEIS}/${aluguelEmEdicaoId}`
            : API_ALUGUEIS;

        await requisitarJsonAluguel(url, {
            method: editando ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });

        obterModalAluguel("modalAluguel").hide();
        aluguelEmEdicaoId = null;

        await carregarDadosAlugueis();

        avisoAluguel(
            editando
                ? "Aluguel atualizado com sucesso!"
                : "Aluguel cadastrado com sucesso!"
        );

    } catch (erro) {
        console.error("Erro ao salvar aluguel:", erro);
        erroNoModalAluguel("mensagemAluguel", erro.message);

    } finally {
        botao.disabled = false;
        botao.innerHTML = aluguelEmEdicaoId !== null
            ? '<i class="bi bi-check-lg"></i> Salvar alterações'
            : '<i class="bi bi-check-lg"></i> Salvar aluguel';
    }
}

/* ==========================================
   DEVOLUÇÃO — ABRIR MODAL
========================================== */

function abrirDevolucaoAluguel(id) {
    const aluguel = alugueisCadastrados.find(
        item => Number(item.aluguelId) === Number(id)
    );

    if (!aluguel) {
        avisoAluguel("Aluguel não encontrado.", "warning");
        return;
    }

    if (aluguelFinalizado(aluguel)) {
        avisoAluguel("Este aluguel já foi finalizado.", "warning");
        return;
    }

    aluguelParaDevolverId = id;

    elAluguel("formDevolucao").reset();
    elAluguel("mensagemDevolucao").replaceChildren();

    elAluguel("resumoDevolucao").textContent =
        `${nomeClienteAluguel(aluguel)} — ${nomeVeiculoAluguel(aluguel)}`;

    elAluguel("devolucaoData").value = dataAtualInput();

    elAluguel("devolucaoKmFinal").value =
        aluguel.quilometragemInicial ?? 0;

    obterModalAluguel("modalDevolucao").show();
}

/* ==========================================
   DEVOLUÇÃO — CONFIRMAR
========================================== */

async function registrarDevolucaoAluguel(evento) {
    evento.preventDefault();

    const aluguel = alugueisCadastrados.find(
        item => Number(item.aluguelId) === Number(aluguelParaDevolverId)
    );

    if (!aluguel) {
        erroNoModalAluguel(
            "mensagemDevolucao",
            "Aluguel não encontrado."
        );
        return;
    }

    const dataDevolucao = elAluguel("devolucaoData").value;

    const quilometragemFinal = Number(
        elAluguel("devolucaoKmFinal").value
    );

    if (!dataDevolucao ||
        dataDevolucao < dataParaInput(aluguel.dataInicio)) {
        erroNoModalAluguel(
            "mensagemDevolucao",
            "A devolução não pode ser anterior ao início do aluguel."
        );
        return;
    }

    if (
        !Number.isInteger(quilometragemFinal) ||
        quilometragemFinal < Number(aluguel.quilometragemInicial)
    ) {
        erroNoModalAluguel(
            "mensagemDevolucao",
            "A quilometragem final não pode ser menor que a inicial."
        );
        return;
    }

    const botao = elAluguel("btnConfirmarDevolucao");

    botao.disabled = true;
    botao.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span> Registrando...';

    try {
        // Ajustar somente se o DTO de devolução da API
        // exigir outros nomes de propriedades.
        const dados = {
            dataDevolucao: dataParaApi(dataDevolucao),
            quilometragemFinal
        };

        await requisitarJsonAluguel(
            `${API_ALUGUEIS}/${aluguelParaDevolverId}/devolucao`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados)
            }
        );

        aluguelParaDevolverId = null;
        obterModalAluguel("modalDevolucao").hide();

        await carregarDadosAlugueis();

        avisoAluguel("Devolução registrada com sucesso!");

    } catch (erro) {
        console.error("Erro na devolução:", erro);
        erroNoModalAluguel("mensagemDevolucao", erro.message);

    } finally {
        botao.disabled = false;
        botao.innerHTML =
            '<i class="bi bi-check-circle"></i> Registrar devolução';
    }
}

/* ==========================================
   DELETE — EXCLUIR ALUGUEL
========================================== */

function abrirExclusaoAluguel(id) {
    const aluguel = alugueisCadastrados.find(
        item => Number(item.aluguelId) === Number(id)
    );

    if (!aluguel) {
        avisoAluguel("Aluguel não encontrado.", "warning");
        return;
    }

    aluguelParaExcluirId = id;

    elAluguel("identificacaoAluguelExcluir").textContent =
        `#${id} — ${nomeClienteAluguel(aluguel)}`;

    elAluguel("mensagemExclusaoAluguel").replaceChildren();

    obterModalAluguel("modalExcluirAluguel").show();
}

async function confirmarExclusaoAluguel() {
    if (aluguelParaExcluirId === null) return;

    const id = aluguelParaExcluirId;
    const botao = elAluguel("btnConfirmarExclusaoAluguel");

    botao.disabled = true;
    botao.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span> Excluindo...';

    try {
        await requisitarJsonAluguel(
            `${API_ALUGUEIS}/${id}`,
            { method: "DELETE" }
        );

        aluguelParaExcluirId = null;
        obterModalAluguel("modalExcluirAluguel").hide();

        await carregarDadosAlugueis();

        avisoAluguel("Aluguel excluído com sucesso!");

    } catch (erro) {
        console.error("Erro ao excluir aluguel:", erro);
        erroNoModalAluguel(
            "mensagemExclusaoAluguel",
            erro.message
        );

    } finally {
        botao.disabled = false;
        botao.innerHTML =
            '<i class="bi bi-trash3"></i> Excluir aluguel';
    }
}

/* ==========================================
   INICIALIZAÇÃO
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    carregarDadosAlugueis();

    elAluguel("btnNovoAluguel")
        .addEventListener("click", abrirNovoAluguel);

    elAluguel("formAluguel")
        .addEventListener("submit", salvarAluguel);

    elAluguel("formDevolucao")
        .addEventListener("submit", registrarDevolucaoAluguel);

    elAluguel("btnConfirmarExclusaoAluguel")
        .addEventListener("click", confirmarExclusaoAluguel);

    elAluguel("btnAtualizarAlugueis")
        .addEventListener("click", carregarDadosAlugueis);

    elAluguel("filtroClienteAluguel")
        .addEventListener("input", filtrarAlugueis);

    elAluguel("filtroVeiculoAluguel")
        .addEventListener("input", filtrarAlugueis);

    elAluguel("filtroStatusAluguel")
        .addEventListener("change", filtrarAlugueis);

    elAluguel("btnLimparFiltrosAlugueis")
        .addEventListener("click", limparFiltrosAlugueis);

    elAluguel("aluguelVeiculo")
        .addEventListener("change", () => {
            if (aluguelEmEdicaoId !== null) return;

            const veiculo = obterVeiculoAluguel(
                elAluguel("aluguelVeiculo").value
            );

            if (veiculo) {
                elAluguel("aluguelKmInicial").value =
                    veiculo.quilometragem ?? 0;
            }
        });
});