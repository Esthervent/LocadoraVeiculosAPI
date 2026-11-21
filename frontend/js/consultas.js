/* ==========================================
   MOVIA | Consultas do Backend
========================================== */

const API_CONSULTAS = "http://localhost:5000/api";

const ROTAS_CONSULTAS = {
    fabricante: id =>
        `${API_CONSULTAS}/Consultas/veiculos/fabricante/${id}`,

    categoria: id =>
        `${API_CONSULTAS}/Consultas/veiculos/categoria/${id}`,

    disponiveis:
        `${API_CONSULTAS}/Consultas/veiculos/disponiveis`,

    cliente: id =>
        `${API_CONSULTAS}/Consultas/alugueis/cliente/${id}`,

    // Confirme no Swagger se os parâmetros são
    // dataInicio e dataFim. Se forem diferentes,
    // altere somente esta função.
    periodo: (inicio, fim) => {
        const parametros = new URLSearchParams({
            dataInicio: inicio,
            dataFim: fim
        });

        return `${API_CONSULTAS}/Consultas/alugueis/periodo?${parametros}`;
    },

    fabricantesComVeiculos:
        `${API_CONSULTAS}/Consultas/fabricantes-com-veiculos`
};

const TIPOS_CONSULTAS = {
    fabricante: {
        titulo: "Veículos por fabricante",
        descricao: "Veículos cadastrados para o fabricante selecionado."
    },
    categoria: {
        titulo: "Veículos por categoria",
        descricao: "Veículos pertencentes à categoria selecionada."
    },
    disponiveis: {
        titulo: "Veículos disponíveis",
        descricao: "Veículos que a API identifica como disponíveis."
    },
    cliente: {
        titulo: "Aluguéis por cliente",
        descricao: "Histórico de locações do cliente selecionado."
    },
    periodo: {
        titulo: "Aluguéis por período",
        descricao: "Locações encontradas no intervalo informado."
    },
    fabricantesComVeiculos: {
        titulo: "Fabricantes com veículos",
        descricao: "Fabricantes retornados pela consulta do backend."
    }
};

let fabricantesConsulta = [];
let categoriasConsulta = [];
let clientesConsulta = [];

const consultaEl = id => document.getElementById(id);

/* ==========================================
   FORMATAÇÃO
========================================== */

function moedaConsulta(valor) {
    if (valor === null || valor === undefined || valor === "") {
        return "—";
    }

    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
        return "—";
    }

    return numero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function dataConsulta(valor) {
    if (!valor) return "—";

    const partes = String(valor).match(
        /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/
    );

    if (!partes) return String(valor);

    const [, ano, mes, dia, hora, minuto] = partes;

    return hora
        ? `${dia}/${mes}/${ano} ${hora}:${minuto}`
        : `${dia}/${mes}/${ano}`;
}

function textoConsulta(valor) {
    if (valor === null || valor === undefined || valor === "") {
        return "—";
    }

    if (typeof valor === "boolean") {
        return valor ? "Sim" : "Não";
    }

    if (typeof valor === "object") {
        return "—";
    }

    return String(valor);
}

function valorCampo(objeto, ...nomes) {
    if (!objeto || typeof objeto !== "object") return undefined;

    for (const nome of nomes) {
        if (objeto[nome] !== undefined && objeto[nome] !== null) {
            return objeto[nome];
        }
    }

    return undefined;
}

function nomeFabricanteConsulta(id) {
    return fabricantesConsulta.find(
        f => Number(f.fabricanteId) === Number(id)
    )?.nome ?? `Fabricante #${id}`;
}

function nomeCategoriaConsulta(id) {
    return categoriasConsulta.find(
        c => Number(c.categoriaVeiculoId) === Number(id)
    )?.nome ?? `Categoria #${id}`;
}

function nomeClienteConsulta(id) {
    return clientesConsulta.find(
        c => Number(c.clienteId) === Number(id)
    )?.nome ?? `Cliente #${id}`;
}

/* ==========================================
   COMUNICAÇÃO COM A API
========================================== */

async function buscarConsulta(url) {
    const resposta = await fetch(url);

    if (!resposta.ok) {
        let detalhe = "";

        try {
            const dados = await resposta.json();
            detalhe = dados.detail || dados.message || dados.title || "";
        } catch {
            // Utiliza a mensagem padrão.
        }

        throw new Error(
            detalhe || `Falha na consulta (HTTP ${resposta.status}).`
        );
    }

    return resposta.json();
}

function extrairListaConsulta(dados) {
    if (Array.isArray(dados)) return dados;

    if (dados && typeof dados === "object") {
        for (const chave of [
            "resultados",
            "dados",
            "items",
            "veiculos",
            "alugueis",
            "fabricantes"
        ]) {
            if (Array.isArray(dados[chave])) {
                return dados[chave];
            }
        }
    }

    throw new Error(
        "A API retornou um formato de resultados diferente do esperado."
    );
}

function adicionarOpcaoConsulta(select, valor, texto) {
    const opcao = document.createElement("option");
    opcao.value = valor;
    opcao.textContent = texto;
    select.appendChild(opcao);
}

async function carregarFiltrosConsulta() {
    const resultados = await Promise.allSettled([
        buscarConsulta(`${API_CONSULTAS}/Fabricantes`),
        buscarConsulta(`${API_CONSULTAS}/CategoriasVeiculo`),
        buscarConsulta(`${API_CONSULTAS}/Clientes`)
    ]);

    const listas = resultados.map(resultado =>
        resultado.status === "fulfilled" &&
        Array.isArray(resultado.value)
            ? resultado.value
            : []
    );

    [
        fabricantesConsulta,
        categoriasConsulta,
        clientesConsulta
    ] = listas;

    const configuracoes = [
        {
            id: "consultaFabricante",
            lista: fabricantesConsulta,
            chave: "fabricanteId",
            placeholder: "Selecione um fabricante"
        },
        {
            id: "consultaCategoria",
            lista: categoriasConsulta,
            chave: "categoriaVeiculoId",
            placeholder: "Selecione uma categoria"
        },
        {
            id: "consultaCliente",
            lista: clientesConsulta,
            chave: "clienteId",
            placeholder: "Selecione um cliente"
        }
    ];

    configuracoes.forEach(config => {
        const select = consultaEl(config.id);
        select.replaceChildren();

        adicionarOpcaoConsulta(select, "", config.placeholder);

        [...config.lista]
            .sort((a, b) =>
                String(a.nome ?? "").localeCompare(
                    String(b.nome ?? ""), "pt-BR"
                )
            )
            .forEach(item => {
                adicionarOpcaoConsulta(
                    select,
                    item[config.chave],
                    item.nome ?? `Registro #${item[config.chave]}`
                );
            });
    });

    if (resultados.some(resultado => resultado.status === "rejected")) {
        mostrarAvisoConsulta(
            "Alguns filtros não puderam ser carregados. " +
            "Verifique se a API está em execução.",
            "warning"
        );
    }
}

/* ==========================================
   INTERFACE
========================================== */

function mostrarAvisoConsulta(mensagem, tipo = "danger") {
    const container = consultaEl("avisoConsultas");
    container.replaceChildren();

    const alerta = document.createElement("div");
    alerta.className = `alert alert-${tipo} mb-0`;
    alerta.setAttribute("role", "alert");
    alerta.textContent = mensagem;

    container.appendChild(alerta);
}

function limparAvisoConsulta() {
    consultaEl("avisoConsultas").replaceChildren();
}

function atualizarTipoConsulta() {
    const tipo = consultaEl("tipoConsulta").value;

    const campos = {
        fabricante: "campoConsultaFabricante",
        categoria: "campoConsultaCategoria",
        cliente: "campoConsultaCliente",
        periodo: "campoConsultaPeriodo"
    };

    Object.values(campos).forEach(id => {
        consultaEl(id).classList.add("d-none");
    });

    if (campos[tipo]) {
        consultaEl(campos[tipo]).classList.remove("d-none");
    }

    const configuracao = TIPOS_CONSULTAS[tipo];

    consultaEl("tituloResultadoConsulta").textContent =
        configuracao.titulo;

    consultaEl("descricaoResultadoConsulta").textContent =
        configuracao.descricao;

    limparAvisoConsulta();
    limparResultadoConsulta();
}

function limparResultadoConsulta() {
    consultaEl("cabecalhoConsulta").replaceChildren();
    consultaEl("corpoConsulta").replaceChildren();

    const linha = document.createElement("tr");
    const celula = document.createElement("td");

    celula.className = "consulta-vazio";

    const icone = document.createElement("i");
    icone.className = "bi bi-search";

    const mensagem = document.createElement("span");
    mensagem.textContent =
        "Execute uma consulta para visualizar os resultados.";

    celula.append(icone, mensagem);
    linha.appendChild(celula);

    consultaEl("corpoConsulta").appendChild(linha);

    consultaEl("contadorConsulta").textContent =
        "Aguardando consulta";

    consultaEl("totalResultadosConsulta").textContent = "—";
}

function mostrarCarregamentoConsulta() {
    const corpo = consultaEl("corpoConsulta");
    consultaEl("cabecalhoConsulta").replaceChildren();
    corpo.replaceChildren();

    const linha = document.createElement("tr");
    const celula = document.createElement("td");

    celula.className = "consulta-vazio";
    celula.textContent = "Consultando o banco de dados...";

    linha.appendChild(celula);
    corpo.appendChild(linha);
}

/* ==========================================
   CONFIGURAÇÃO DAS TABELAS
========================================== */

function colunasVeiculos() {
    return [
        {
            titulo: "MODELO",
            valor: item => textoConsulta(
                valorCampo(item, "modelo", "nomeModelo")
            )
        },
        {
            titulo: "PLACA",
            valor: item => textoConsulta(item.placa)
        },
        {
            titulo: "FABRICANTE",
            valor: item => {
                const nome = valorCampo(
                    item, "fabricanteNome", "nomeFabricante"
                ) ?? item.fabricante?.nome;

                return nome ?? (
                    item.fabricanteId != null
                        ? nomeFabricanteConsulta(item.fabricanteId)
                        : "—"
                );
            }
        },
        {
            titulo: "CATEGORIA",
            valor: item => {
                const nome = valorCampo(
                    item, "categoriaNome", "nomeCategoria"
                ) ?? item.categoriaVeiculo?.nome;

                return nome ?? (
                    item.categoriaVeiculoId != null
                        ? nomeCategoriaConsulta(item.categoriaVeiculoId)
                        : "—"
                );
            }
        },
        {
            titulo: "ANO",
            valor: item => textoConsulta(item.anoFabricacao)
        },
        {
            titulo: "DISPONIBILIDADE",
            valor: item => {
                const disponivel = valorCampo(
                    item, "disponivel", "estaDisponivel"
                );

                if (disponivel == null) return "—";

                return disponivel ? "Disponível" : "Indisponível";
            }
        }
    ];
}

function colunasAlugueis() {
    return [
        {
            titulo: "CÓDIGO",
            valor: item => textoConsulta(item.aluguelId)
        },
        {
            titulo: "CLIENTE",
            valor: item =>
                valorCampo(item, "clienteNome", "nomeCliente") ??
                item.cliente?.nome ??
                (item.clienteId != null
                    ? nomeClienteConsulta(item.clienteId)
                    : "—")
        },
        {
            titulo: "VEÍCULO",
            valor: item =>
                valorCampo(item, "veiculoModelo", "modeloVeiculo") ??
                item.veiculo?.modelo ??
                (item.veiculoId != null
                    ? `Veículo #${item.veiculoId}`
                    : "—")
        },
        {
            titulo: "INÍCIO",
            valor: item => dataConsulta(item.dataInicio)
        },
        {
            titulo: "DEVOLUÇÃO PREVISTA",
            valor: item => dataConsulta(item.dataFimPrevista)
        },
        {
            titulo: "VALOR TOTAL",
            valor: item => moedaConsulta(item.valorTotal)
        },
        {
            titulo: "SITUAÇÃO",
            valor: item =>
                item.dataDevolucao ? "Finalizado" : "Em andamento"
        }
    ];
}

function colunasFabricantes() {
    return [
        {
            titulo: "FABRICANTE",
            valor: item =>
                textoConsulta(valorCampo(
                    item, "nome", "nomeFabricante"
                ) ?? item.fabricante?.nome)
        },
        {
            titulo: "PAÍS DE ORIGEM",
            valor: item =>
                textoConsulta(valorCampo(
                    item, "paisOrigem", "pais"
                ))
        },
        {
            titulo: "QUANTIDADE DE VEÍCULOS",
            valor: item => {
                const quantidade = valorCampo(
                    item,
                    "quantidadeVeiculos",
                    "totalVeiculos",
                    "numeroVeiculos",
                    "qtdVeiculos"
                );

                if (quantidade != null) return quantidade;

                if (Array.isArray(item.veiculos)) {
                    return item.veiculos.length;
                }

                return "—";
            }
        }
    ];
}

function obterColunasConsulta(tipo) {
    if (tipo === "cliente" || tipo === "periodo") {
        return colunasAlugueis();
    }

    if (tipo === "fabricantesComVeiculos") {
        return colunasFabricantes();
    }

    return colunasVeiculos();
}

/* ==========================================
   RENDERIZAR RESULTADOS
========================================== */

function renderizarResultadoConsulta(tipo, registros) {
    const cabecalho = consultaEl("cabecalhoConsulta");
    const corpo = consultaEl("corpoConsulta");

    cabecalho.replaceChildren();
    corpo.replaceChildren();

    consultaEl("totalResultadosConsulta").textContent =
        registros.length;

    consultaEl("contadorConsulta").textContent =
        `${registros.length} resultado(s)`;

    if (registros.length === 0) {
        const linha = document.createElement("tr");
        const celula = document.createElement("td");

        celula.className = "consulta-vazio";
        celula.textContent =
            "Nenhum registro encontrado para esta consulta.";

        linha.appendChild(celula);
        corpo.appendChild(linha);
        return;
    }

    const colunas = obterColunasConsulta(tipo);

    const linhaCabecalho = document.createElement("tr");

    colunas.forEach(coluna => {
        const th = document.createElement("th");
        th.scope = "col";
        th.textContent = coluna.titulo;
        linhaCabecalho.appendChild(th);
    });

    cabecalho.appendChild(linhaCabecalho);

    registros.forEach(registro => {
        const linha = document.createElement("tr");

        colunas.forEach(coluna => {
            const td = document.createElement("td");
            const valor = coluna.valor(registro);

            if (
                coluna.titulo === "DISPONIBILIDADE" &&
                (valor === "Disponível" || valor === "Indisponível")
            ) {
                const badge = document.createElement("span");

                badge.className = valor === "Disponível"
                    ? "consulta-badge disponivel"
                    : "consulta-badge indisponivel";

                badge.textContent = valor;
                td.appendChild(badge);

            } else {
                td.textContent = textoConsulta(valor);
            }

            linha.appendChild(td);
        });

        corpo.appendChild(linha);
    });
}

/* ==========================================
   EXECUTAR CONSULTAS
========================================== */

async function executarConsulta(evento) {
    evento.preventDefault();

    const tipo = consultaEl("tipoConsulta").value;

    let url;

    limparAvisoConsulta();

    if (tipo === "fabricante") {
        const id = consultaEl("consultaFabricante").value;

        if (!id) {
            mostrarAvisoConsulta("Selecione um fabricante.", "warning");
            return;
        }

        url = ROTAS_CONSULTAS.fabricante(id);
    }

    else if (tipo === "categoria") {
        const id = consultaEl("consultaCategoria").value;

        if (!id) {
            mostrarAvisoConsulta("Selecione uma categoria.", "warning");
            return;
        }

        url = ROTAS_CONSULTAS.categoria(id);
    }

    else if (tipo === "disponiveis") {
        url = ROTAS_CONSULTAS.disponiveis;
    }

    else if (tipo === "cliente") {
        const id = consultaEl("consultaCliente").value;

        if (!id) {
            mostrarAvisoConsulta("Selecione um cliente.", "warning");
            return;
        }

        url = ROTAS_CONSULTAS.cliente(id);
    }

    else if (tipo === "periodo") {
        const inicio = consultaEl("consultaDataInicio").value;
        const fim = consultaEl("consultaDataFim").value;

        if (!inicio || !fim) {
            mostrarAvisoConsulta(
                "Informe as duas datas do período.",
                "warning"
            );
            return;
        }

        if (fim < inicio) {
            mostrarAvisoConsulta(
                "A data final não pode ser anterior à inicial.",
                "warning"
            );
            return;
        }

        url = ROTAS_CONSULTAS.periodo(inicio, fim);
    }

    else if (tipo === "fabricantesComVeiculos") {
        url = ROTAS_CONSULTAS.fabricantesComVeiculos;
    }

    else {
        mostrarAvisoConsulta("Tipo de consulta inválido.");
        return;
    }

    const botao = consultaEl("btnExecutarConsulta");

    botao.disabled = true;
    botao.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span> Consultando...';

    mostrarCarregamentoConsulta();

    try {
        const dados = await buscarConsulta(url);
        const registros = extrairListaConsulta(dados);

        renderizarResultadoConsulta(tipo, registros);

    } catch (erro) {
        console.error("Erro ao executar consulta:", erro);

        mostrarAvisoConsulta(erro.message);
        limparResultadoConsulta();

    } finally {
        botao.disabled = false;
        botao.innerHTML =
            '<i class="bi bi-search"></i> Executar consulta';
    }
}

/* ==========================================
   INICIALIZAÇÃO
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    consultaEl("tipoConsulta")
        .addEventListener("change", atualizarTipoConsulta);

    consultaEl("formConsulta")
        .addEventListener("submit", executarConsulta);

    atualizarTipoConsulta();
    carregarFiltrosConsulta();
});