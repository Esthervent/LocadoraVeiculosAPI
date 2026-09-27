using LocadoraVeiculosAPI.Data;
using LocadoraVeiculosAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LocadoraVeiculosAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AlugueisController : ControllerBase
    {
        private readonly ApplicationContext _context;

        public AlugueisController(ApplicationContext context)
        {
            _context = context;
        }

        // GET: api/Alugueis
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Aluguel>>> GetAlugueis()
        {
            return await _context.Alugueis
                .Include(a => a.Cliente)
                .Include(a => a.Veiculo)
                .ToListAsync();
        }

        // GET: api/Alugueis/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Aluguel>> GetAluguel(int id)
        {
            var aluguel = await _context.Alugueis
                .Include(a => a.Cliente)
                .Include(a => a.Veiculo)
                .FirstOrDefaultAsync(a => a.AluguelId == id);

            if (aluguel == null)
            {
                return NotFound(new
                {
                    mensagem = "Aluguel não encontrado."
                });
            }

            return aluguel;
        }

        // POST: api/Alugueis
        [HttpPost]
        public async Task<ActionResult<Aluguel>> PostAluguel(Aluguel aluguel)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var cliente = await _context.Clientes
                .FindAsync(aluguel.ClienteId);

            if (cliente == null)
            {
                return BadRequest(new
                {
                    mensagem = "O cliente informado não existe."
                });
            }

            var veiculo = await _context.Veiculos
                .FindAsync(aluguel.VeiculoId);

            if (veiculo == null)
            {
                return BadRequest(new
                {
                    mensagem = "O veículo informado não existe."
                });
            }

            if (!veiculo.Disponivel)
            {
                return Conflict(new
                {
                    mensagem = "O veículo informado não está disponível para aluguel."
                });
            }

            if (aluguel.DataFimPrevista <= aluguel.DataInicio)
            {
                return BadRequest(new
                {
                    mensagem = "A data de fim prevista deve ser posterior à data de início."
                });
            }

            if (aluguel.QuilometragemInicial < 0)
            {
                return BadRequest(new
                {
                    mensagem = "A quilometragem inicial não pode ser negativa."
                });
            }

            if (aluguel.ValorDiaria <= 0)
            {
                return BadRequest(new
                {
                    mensagem = "O valor da diária deve ser maior que zero."
                });
            }

            var quantidadeDias =
                (int)Math.Ceiling(
                    (aluguel.DataFimPrevista - aluguel.DataInicio).TotalDays);

            aluguel.ValorTotal = aluguel.ValorDiaria * quantidadeDias;

            aluguel.DataDevolucao = null;
            aluguel.QuilometragemFinal = null;

            veiculo.Disponivel = false;

            _context.Alugueis.Add(aluguel);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetAluguel),
                new { id = aluguel.AluguelId },
                aluguel
            );
        }

        // PUT: api/Alugueis/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAluguel(
            int id,
            Aluguel aluguel)
        {
            if (id != aluguel.AluguelId)
            {
                return BadRequest(new
                {
                    mensagem = "O ID informado na URL é diferente do ID do aluguel."
                });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var aluguelExistente = await _context.Alugueis
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.AluguelId == id);

            if (aluguelExistente == null)
            {
                return NotFound(new
                {
                    mensagem = "Aluguel não encontrado."
                });
            }

            var clienteExiste = await _context.Clientes
                .AnyAsync(c => c.ClienteId == aluguel.ClienteId);

            if (!clienteExiste)
            {
                return BadRequest(new
                {
                    mensagem = "O cliente informado não existe."
                });
            }

            var veiculoExiste = await _context.Veiculos
                .AnyAsync(v => v.VeiculoId == aluguel.VeiculoId);

            if (!veiculoExiste)
            {
                return BadRequest(new
                {
                    mensagem = "O veículo informado não existe."
                });
            }

            if (aluguel.DataFimPrevista <= aluguel.DataInicio)
            {
                return BadRequest(new
                {
                    mensagem = "A data de fim prevista deve ser posterior à data de início."
                });
            }

            if (aluguel.QuilometragemInicial < 0)
            {
                return BadRequest(new
                {
                    mensagem = "A quilometragem inicial não pode ser negativa."
                });
            }

            if (aluguel.ValorDiaria <= 0)
            {
                return BadRequest(new
                {
                    mensagem = "O valor da diária deve ser maior que zero."
                });
            }

            if (aluguel.QuilometragemFinal.HasValue &&
                aluguel.QuilometragemFinal < aluguel.QuilometragemInicial)
            {
                return BadRequest(new
                {
                    mensagem = "A quilometragem final não pode ser menor que a quilometragem inicial."
                });
            }

            var quantidadeDias =
                (int)Math.Ceiling(
                    (aluguel.DataFimPrevista - aluguel.DataInicio).TotalDays);

            aluguel.ValorTotal = aluguel.ValorDiaria * quantidadeDias;

            _context.Entry(aluguel).State = EntityState.Modified;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Alugueis/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAluguel(int id)
        {
            var aluguel = await _context.Alugueis.FindAsync(id);

            if (aluguel == null)
            {
                return NotFound(new
                {
                    mensagem = "Aluguel não encontrado."
                });
            }

            var veiculo = await _context.Veiculos
                .FindAsync(aluguel.VeiculoId);

            if (veiculo != null)
            {
                veiculo.Disponivel = true;
            }

            _context.Alugueis.Remove(aluguel);

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT: api/Alugueis/5/devolucao
        [HttpPut("{id}/devolucao")]
        public async Task<IActionResult> RegistrarDevolucao(
            int id,
            double quilometragemFinal)
        {
            var aluguel = await _context.Alugueis
                .FirstOrDefaultAsync(a => a.AluguelId == id);

            if (aluguel == null)
            {
                return NotFound(new
                {
                    mensagem = "Aluguel não encontrado."
                });
            }

            if (aluguel.DataDevolucao != null)
            {
                return Conflict(new
                {
                    mensagem = "Este aluguel já possui devolução registrada."
                });
            }

            if (quilometragemFinal < aluguel.QuilometragemInicial)
            {
                return BadRequest(new
                {
                    mensagem = "A quilometragem final não pode ser menor que a quilometragem inicial."
                });
            }

            var veiculo = await _context.Veiculos
                .FindAsync(aluguel.VeiculoId);

            aluguel.DataDevolucao = DateTime.Now;
            aluguel.QuilometragemFinal = quilometragemFinal;

            if (veiculo != null)
            {
                veiculo.Quilometragem = quilometragemFinal;
                veiculo.Disponivel = true;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}