const API_URL = "http://localhost:5000/api";

let veiculosCadastrados = [];
let veiculoEmEdicaoId = null;

async function carregarVeiculos() {
    const lista = document.getElementById("listaVeiculos");

    try {
        const resposta = await fetch(`${API_URL}/Veiculos`);

        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        const veiculos = await resposta.json();
        veiculosCadastrados = veiculos;

        if (veiculos.length === 0) {
            lista.innerHTML = "<p>Nenhum veículo cadastrado.</p>";
            return;
        }

        lista.innerHTML = "";

        veiculos.forEach(veiculo => {
            const coluna = document.createElement("div");
            coluna.className = "col-12 col-md-6 col-lg-4";

            const card = document.createElement("div");
            card.className = "card h-100 shadow-sm";

            const corpo = document.createElement("div");
            corpo.className = "card-body";

            const titulo = document.createElement("h3");
            titulo.className = "h5 card-title";
            titulo.textContent = veiculo.modelo;

            const placa = document.createElement("p");
            placa.className = "mb-1";
            placa.textContent = `Placa: ${veiculo.placa}`;

            const fabricante = document.createElement("p");
            fabricante.className = "mb-1";
            fabricante.textContent =
                `Fabricante: ${veiculo.fabricante?.nome ?? "Não informado"}`;

            const categoria = document.createElement("p");
            categoria.className = "mb-1";
            categoria.textContent =
                `Categoria: ${veiculo.categoriaVeiculo?.nome ?? "Não informada"}`;

            const status = document.createElement("span");
            status.className = veiculo.disponivel
                ? "badge bg-success"
                : "badge bg-secondary";

            status.textContent = veiculo.disponivel
                ? "Disponível"
                : "Indisponível";

            const acoes = document.createElement("div");
            acoes.className = "d-flex gap-2 mt-3";

            const btnEditar = document.createElement("button");
            btnEditar.type = "button";
            btnEditar.className = "btn btn-outline-secondary btn-sm";
            btnEditar.innerHTML = '<i class="bi bi-pencil-square"></i> Editar';

            btnEditar.addEventListener("click", () => {
                abrirEdicaoVeiculo(veiculo.veiculoId);
            });

            const btnExcluir = document.createElement("button");
            btnExcluir.type = "button";
            btnExcluir.className = "btn btn-outline-danger btn-sm";
            btnExcluir.innerHTML = '<i class="bi bi-trash3"></i> Excluir';

            btnExcluir.addEventListener("click", () => {
                excluirVeiculo(veiculo.veiculoId, veiculo.modelo);
            });

            acoes.append(btnEditar, btnExcluir);

            corpo.append(titulo, placa, fabricante, categoria, status, acoes);
            card.appendChild(corpo);
            coluna.appendChild(card);
            lista.appendChild(coluna);
        });

    } catch (erro) {
        console.error(erro);

        lista.innerHTML = `
            <p class="text-danger">
                Não foi possível carregar os veículos.
            </p>
        `;
    }
}

async function carregarIndicadores() {
    const totalVeiculos = document.getElementById("totalVeiculos");
    const disponiveis = document.getElementById("veiculosDisponiveis");
    const indisponiveis = document.getElementById("veiculosIndisponiveis");
    const totalAlugueis = document.getElementById("totalAlugueis");

    try {
        const [respostaVeiculos, respostaAlugueis] = await Promise.all([
            fetch(`${API_URL}/Veiculos`),
            fetch(`${API_URL}/Alugueis`)
        ]);

        if (!respostaVeiculos.ok || !respostaAlugueis.ok) {
            throw new Error("Erro ao consultar os indicadores.");
        }

        const veiculos = await respostaVeiculos.json();
        const alugueis = await respostaAlugueis.json();

        const quantidadeDisponiveis = veiculos.filter(
            veiculo => veiculo.disponivel === true
        ).length;

        totalVeiculos.textContent = veiculos.length;
        disponiveis.textContent = quantidadeDisponiveis;
        indisponiveis.textContent =
            veiculos.length - quantidadeDisponiveis;
        totalAlugueis.textContent = alugueis.length;

    } catch (erro) {
        console.error("Erro ao carregar indicadores:", erro);

        [totalVeiculos, disponiveis, indisponiveis, totalAlugueis]
            .forEach(elemento => {
                elemento.textContent = "Erro";
            });
    }
}

function filtrarVeiculos() {
    const modelo = document
        .getElementById("filtroModelo")
        .value.trim().toLowerCase();

    const placa = document
        .getElementById("filtroPlaca")
        .value.trim().toLowerCase();

    const veiculosFiltrados = veiculosCadastrados.filter(veiculo => {
        const correspondeModelo = (veiculo.modelo ?? "")
            .toLowerCase()
            .includes(modelo);

        const correspondePlaca = (veiculo.placa ?? "")
            .toLowerCase()
            .includes(placa);

        return correspondeModelo && correspondePlaca;
    });

    const cards = document.querySelectorAll("#listaVeiculos > div");

    cards.forEach(card => {
        const titulo = card.querySelector(".card-title");
        const textoPlaca = Array.from(card.querySelectorAll("p"))
            .find(p => p.textContent.startsWith("Placa:"));

        if (!titulo || !textoPlaca) return;

        const corresponde = veiculosFiltrados.some(veiculo =>
            veiculo.modelo === titulo.textContent &&
            textoPlaca.textContent.includes(veiculo.placa)
        );

        card.style.display = corresponde ? "" : "none";
    });
}


async function carregarOpcoesVeiculo() {
    const selectFabricante = document.getElementById("veiculoFabricante");
    const selectCategoria = document.getElementById("veiculoCategoria");

    selectFabricante.innerHTML = '<option value="">Carregando fabricantes...</option>';
    selectCategoria.innerHTML = '<option value="">Carregando categorias...</option>';

    try {
        const [respostaFabricantes, respostaCategorias] = await Promise.all([
            fetch(`${API_URL}/Fabricantes`),
            fetch(`${API_URL}/CategoriasVeiculo`)
        ]);

        if (!respostaFabricantes.ok || !respostaCategorias.ok) {
            throw new Error("Não foi possível consultar fabricantes e categorias.");
        }

        const fabricantes = await respostaFabricantes.json();
        const categorias = await respostaCategorias.json();

        selectFabricante.innerHTML = '<option value="">Selecione um fabricante</option>';
        selectCategoria.innerHTML = '<option value="">Selecione uma categoria</option>';

        fabricantes.forEach(fabricante => {
            const option = document.createElement("option");
            option.value = fabricante.fabricanteId;
            option.textContent = fabricante.nome;
            selectFabricante.appendChild(option);
        });

        categorias.forEach(categoria => {
            const option = document.createElement("option");
            option.value = categoria.categoriaVeiculoId;
            option.textContent = categoria.nome;
            selectCategoria.appendChild(option);
        });

    } catch (erro) {
        console.error("Erro ao carregar opções:", erro);

        selectFabricante.innerHTML =
            '<option value="">Erro ao carregar fabricantes</option>';

        selectCategoria.innerHTML =
            '<option value="">Erro ao carregar categorias</option>';
    }
}


async function salvarVeiculo(evento) {
    evento.preventDefault();

    const botaoSalvar = document.getElementById("btnSalvarVeiculo");
    const mensagem = document.getElementById("mensagemVeiculo");

    const placa = document.getElementById("veiculoPlaca")
        .value.trim().toUpperCase();

    const veiculo = {
        modelo: document.getElementById("veiculoModelo").value.trim(),
        placa: placa,
        anoFabricacao: Number(
            document.getElementById("veiculoAno").value
        ),
        quilometragem: Number(
            document.getElementById("veiculoQuilometragem").value
        ),
        fabricanteId: Number(
            document.getElementById("veiculoFabricante").value
        ),
        categoriaVeiculoId: Number(
            document.getElementById("veiculoCategoria").value
        ),
        disponivel: document.getElementById("veiculoDisponivel").checked
    };

    // Validação básica antes do envio
    if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(placa)) {
        mensagem.innerHTML =
            '<div class="alert alert-warning">Informe uma placa válida, como ABC1D23 ou ABC1234.</div>';
        return;
    }

    if (!veiculo.fabricanteId || !veiculo.categoriaVeiculoId) {
        mensagem.innerHTML =
            '<div class="alert alert-warning">Selecione o fabricante e a categoria.</div>';
        return;
    }

    botaoSalvar.disabled = true;
    botaoSalvar.innerHTML =
        '<span class="spinner-border spinner-border-sm"></span> Salvando...';

    mensagem.innerHTML = "";

    try {

        const editando = veiculoEmEdicaoId !== null;

        const url = editando
            ? `${API_URL}/Veiculos/${veiculoEmEdicaoId}`
            : `${API_URL}/Veiculos`;

        const metodo = editando ? "PUT" : "POST";

        const dadosEnvio = editando
            ? { ...veiculo, veiculoId: veiculoEmEdicaoId }
            : veiculo;

        const resposta = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dadosEnvio)
        });

        if (!resposta.ok) {
            const detalhe = await resposta.text();
            throw new Error(
                `Erro HTTP ${resposta.status}: ${detalhe}`
            );
        }

        // Atualiza os dados da tela
        await Promise.all([
            carregarVeiculos(),
            carregarIndicadores()
        ]);

        // Fecha o formulário
        const modal = bootstrap.Modal.getInstance(
            document.getElementById("modalVeiculo")
        );

        modal.hide();

        document.getElementById("formVeiculo").reset();

        alert(
            editando
                ? "Veículo atualizado com sucesso!"
                : "Veículo cadastrado com sucesso!"
        );

        veiculoEmEdicaoId = null;

    } catch (erro) {
        console.error("Erro ao cadastrar veículo:", erro);

        mensagem.innerHTML =
            '<div class="alert alert-danger">Não foi possível cadastrar o veículo. Verifique os dados e tente novamente.</div>';

    } finally {
        botaoSalvar.disabled = false;
        botaoSalvar.innerHTML =
            '<i class="bi bi-check-lg"></i> Salvar veículo';
    }
}


async function abrirEdicaoVeiculo(id) {
    const veiculo = veiculosCadastrados.find(
        item => item.veiculoId === id
    );

    if (!veiculo) {
        alert("Veículo não encontrado.");
        return;
    }

    veiculoEmEdicaoId = id;

    document.getElementById("formVeiculo").reset();
    document.getElementById("mensagemVeiculo").textContent = "";

    document.getElementById("tituloModalVeiculo").textContent =
        "Editar veículo";

    document.getElementById("btnSalvarVeiculo").innerHTML =
        '<i class="bi bi-check-lg"></i> Salvar alterações';

    document.getElementById("veiculoModelo").value =
        veiculo.modelo ?? "";

    document.getElementById("veiculoPlaca").value =
        veiculo.placa ?? "";

    document.getElementById("veiculoAno").value =
        veiculo.anoFabricacao ?? "";

    document.getElementById("veiculoQuilometragem").value =
        veiculo.quilometragem ?? 0;

    document.getElementById("veiculoDisponivel").checked =
        veiculo.disponivel === true;

    const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("modalVeiculo")
    );

    modal.show();

    await carregarOpcoesVeiculo();

    document.getElementById("veiculoFabricante").value =
        String(veiculo.fabricanteId);

    document.getElementById("veiculoCategoria").value =
        String(veiculo.categoriaVeiculoId);
}


async function excluirVeiculo(id, modelo) {
    const confirmado = confirm(
        `Tem certeza que deseja excluir o veículo "${modelo}"?\n\n` +
        "Esta ação não poderá ser desfeita."
    );

    if (!confirmado) {
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/Veiculos/${id}`, {
            method: "DELETE"
        });

        if (!resposta.ok) {
            if (resposta.status === 404) {
                throw new Error("Veículo não encontrado.");
            }

            if (resposta.status === 409) {
                throw new Error(
                    "Este veículo possui registros relacionados e não pode ser excluído."
                );
            }

            throw new Error(
                `Não foi possível excluir o veículo. Erro HTTP ${resposta.status}.`
            );
        }

        await Promise.all([
            carregarVeiculos(),
            carregarIndicadores()
        ]);

        // Reaplica os filtros, caso estejam preenchidos.
        filtrarVeiculos();

        alert("Veículo excluído com sucesso!");

    } catch (erro) {
        console.error("Erro ao excluir veículo:", erro);
        alert(erro.message);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    carregarVeiculos();
    carregarIndicadores();

    document.getElementById("filtroModelo")
        .addEventListener("input", filtrarVeiculos);

    document.getElementById("filtroPlaca")
        .addEventListener("input", filtrarVeiculos);

    document.getElementById("btnNovoVeiculo")
        .addEventListener("click", async () => {

            veiculoEmEdicaoId = null;

            document.getElementById("tituloModalVeiculo").textContent =
                "Novo veículo";

            document.getElementById("btnSalvarVeiculo").innerHTML =
                '<i class="bi bi-check-lg"></i> Salvar veículo';

            document.getElementById("formVeiculo").reset();
            document.getElementById("mensagemVeiculo").textContent = "";

            const modal = bootstrap.Modal.getOrCreateInstance(
                document.getElementById("modalVeiculo")
            );

            modal.show();

            await carregarOpcoesVeiculo();
        });

    document.getElementById("formVeiculo")
        .addEventListener("submit", salvarVeiculo);
});