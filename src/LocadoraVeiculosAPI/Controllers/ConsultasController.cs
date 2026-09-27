using LocadoraVeiculosAPI.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LocadoraVeiculosAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ConsultasController : ControllerBase
    {
        private readonly ApplicationContext _context;

        public ConsultasController(ApplicationContext context)
        {
            _context = context;
        }

        // 1 - FILTRO: veículos por fabricante
        // Utiliza INNER JOIN
        // GET: api/Consultas/veiculos/fabricante/1
        [HttpGet("veiculos/fabricante/{fabricanteId}")]
        public async Task<IActionResult> GetVeiculosPorFabricante(int fabricanteId)
        {
            var fabricanteExiste = await _context.Fabricantes
                .AnyAsync(f => f.FabricanteId == fabricanteId);

            if (!fabricanteExiste)
            {
                return NotFound(new
                {
                    mensagem = "Fabricante não encontrado."
                });
            }

            var resultado = await (
                from veiculo in _context.Veiculos
                join fabricante in _context.Fabricantes
                    on veiculo.FabricanteId equals fabricante.FabricanteId
                where fabricante.FabricanteId == fabricanteId
                select new
                {
                    veiculo.VeiculoId,
                    veiculo.Modelo,
                    veiculo.AnoFabricacao,
                    veiculo.Quilometragem,
                    veiculo.Placa,
                    veiculo.Disponivel,
                    Fabricante = fabricante.Nome
                }
            ).ToListAsync();

            return Ok(resultado);
        }

        // 2 - FILTRO: veículos por categoria
        // Utiliza INNER JOIN
        // GET: api/Consultas/veiculos/categoria/1
        [HttpGet("veiculos/categoria/{categoriaId}")]
        public async Task<IActionResult> GetVeiculosPorCategoria(int categoriaId)
        {
            var categoriaExiste = await _context.CategoriasVeiculo
                .AnyAsync(c => c.CategoriaVeiculoId == categoriaId);

            if (!categoriaExiste)
            {
                return NotFound(new
                {
                    mensagem = "Categoria não encontrada."
                });
            }

            var resultado = await (
                from veiculo in _context.Veiculos
                join categoria in _context.CategoriasVeiculo
                    on veiculo.CategoriaVeiculoId equals categoria.CategoriaVeiculoId
                where categoria.CategoriaVeiculoId == categoriaId
                select new
                {
                    veiculo.VeiculoId,
                    veiculo.Modelo,
                    veiculo.Placa,
                    veiculo.AnoFabricacao,
                    veiculo.Disponivel,
                    Categoria = categoria.Nome
                }
            ).ToListAsync();

            return Ok(resultado);
        }

        // 3 - FILTRO: veículos disponíveis
        // GET: api/Consultas/veiculos/disponiveis
        [HttpGet("veiculos/disponiveis")]
        public async Task<IActionResult> GetVeiculosDisponiveis()
        {
            var resultado = await _context.Veiculos
                .Where(v => v.Disponivel)
                .Select(v => new
                {
                    v.VeiculoId,
                    v.Modelo,
                    v.Placa,
                    v.AnoFabricacao,
                    v.Quilometragem,
                    v.Disponivel
                })
                .ToListAsync();

            return Ok(resultado);
        }

        // 4 - FILTRO: aluguéis por cliente
        // Utiliza INNER JOIN com Cliente e Veículo
        // GET: api/Consultas/alugueis/cliente/1
        [HttpGet("alugueis/cliente/{clienteId}")]
        public async Task<IActionResult> GetAlugueisPorCliente(int clienteId)
        {
            var clienteExiste = await _context.Clientes
                .AnyAsync(c => c.ClienteId == clienteId);

            if (!clienteExiste)
            {
                return NotFound(new
                {
                    mensagem = "Cliente não encontrado."
                });
            }

            var resultado = await (
                from aluguel in _context.Alugueis
                join cliente in _context.Clientes
                    on aluguel.ClienteId equals cliente.ClienteId
                join veiculo in _context.Veiculos
                    on aluguel.VeiculoId equals veiculo.VeiculoId
                where cliente.ClienteId == clienteId
                select new
                {
                    aluguel.AluguelId,
                    Cliente = cliente.Nome,
                    Veiculo = veiculo.Modelo,
                    veiculo.Placa,
                    aluguel.DataInicio,
                    aluguel.DataFimPrevista,
                    aluguel.DataDevolucao,
                    aluguel.ValorDiaria,
                    aluguel.ValorTotal
                }
            ).ToListAsync();

            return Ok(resultado);
        }

        // 5 - FILTRO: aluguéis por período
        // Exemplo:
        // api/Consultas/alugueis/periodo?inicio=2026-09-01&fim=2026-09-30
        [HttpGet("alugueis/periodo")]
        public async Task<IActionResult> GetAlugueisPorPeriodo(
            DateTime inicio,
            DateTime fim)
        {
            if (fim < inicio)
            {
                return BadRequest(new
                {
                    mensagem = "A data final não pode ser anterior à data inicial."
                });
            }

            var resultado = await _context.Alugueis
                .Where(a =>
                    a.DataInicio >= inicio &&
                    a.DataInicio <= fim)
                .Select(a => new
                {
                    a.AluguelId,
                    a.ClienteId,
                    a.VeiculoId,
                    a.DataInicio,
                    a.DataFimPrevista,
                    a.DataDevolucao,
                    a.ValorDiaria,
                    a.ValorTotal
                })
                .ToListAsync();

            return Ok(resultado);
        }

        // LEFT JOIN
        // Lista todos os fabricantes, mesmo aqueles sem veículos cadastrados
        // GET: api/Consultas/fabricantes-com-veiculos
        [HttpGet("fabricantes-com-veiculos")]
        public async Task<IActionResult> GetFabricantesComVeiculos()
        {
            var resultado = await (
                from fabricante in _context.Fabricantes

                join veiculo in _context.Veiculos
                    on fabricante.FabricanteId equals veiculo.FabricanteId
                    into grupoVeiculos

                from veiculo in grupoVeiculos.DefaultIfEmpty()

                select new
                {
                    fabricante.FabricanteId,
                    Fabricante = fabricante.Nome,

                    VeiculoId = veiculo != null
                        ? (int?)veiculo.VeiculoId
                        : null,

                    Modelo = veiculo != null
                        ? veiculo.Modelo
                        : null,

                    Placa = veiculo != null
                        ? veiculo.Placa
                        : null
                }
            ).ToListAsync();

            return Ok(resultado);
        }
    }
}