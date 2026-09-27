using LocadoraVeiculosAPI.Data;
using LocadoraVeiculosAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LocadoraVeiculosAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VeiculosController : ControllerBase
    {
        private readonly ApplicationContext _context;

        public VeiculosController(ApplicationContext context)
        {
            _context = context;
        }

        // GET: api/Veiculos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Veiculo>>> GetVeiculos()
        {
            return await _context.Veiculos
                .Include(v => v.Fabricante)
                .Include(v => v.CategoriaVeiculo)
                .ToListAsync();
        }

        // GET: api/Veiculos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Veiculo>> GetVeiculo(int id)
        {
            var veiculo = await _context.Veiculos
                .Include(v => v.Fabricante)
                .Include(v => v.CategoriaVeiculo)
                .FirstOrDefaultAsync(v => v.VeiculoId == id);

            if (veiculo == null)
            {
                return NotFound(new
                {
                    mensagem = "Veículo não encontrado."
                });
            }

            return veiculo;
        }

        // POST: api/Veiculos
        [HttpPost]
        public async Task<ActionResult<Veiculo>> PostVeiculo(Veiculo veiculo)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (veiculo.AnoFabricacao < 1900 ||
                veiculo.AnoFabricacao > DateTime.Now.Year + 1)
            {
                return BadRequest(new
                {
                    mensagem = "Ano de fabricação inválido."
                });
            }

            if (veiculo.Quilometragem < 0)
            {
                return BadRequest(new
                {
                    mensagem = "A quilometragem não pode ser negativa."
                });
            }

            var placaExistente = await _context.Veiculos
                .AnyAsync(v => v.Placa == veiculo.Placa);

            if (placaExistente)
            {
                return Conflict(new
                {
                    mensagem = "Já existe um veículo cadastrado com essa placa."
                });
            }

            var fabricanteExiste = await _context.Fabricantes
                .AnyAsync(f => f.FabricanteId == veiculo.FabricanteId);

            if (!fabricanteExiste)
            {
                return BadRequest(new
                {
                    mensagem = "O fabricante informado não existe."
                });
            }

            var categoriaExiste = await _context.CategoriasVeiculo
                .AnyAsync(c => c.CategoriaVeiculoId == veiculo.CategoriaVeiculoId);

            if (!categoriaExiste)
            {
                return BadRequest(new
                {
                    mensagem = "A categoria informada não existe."
                });
            }

            _context.Veiculos.Add(veiculo);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetVeiculo),
                new { id = veiculo.VeiculoId },
                veiculo
            );
        }

        // PUT: api/Veiculos/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutVeiculo(
            int id,
            Veiculo veiculo)
        {
            if (id != veiculo.VeiculoId)
            {
                return BadRequest(new
                {
                    mensagem = "O ID informado na URL é diferente do ID do veículo."
                });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var veiculoExistente = await _context.Veiculos
                .AsNoTracking()
                .FirstOrDefaultAsync(v => v.VeiculoId == id);

            if (veiculoExistente == null)
            {
                return NotFound(new
                {
                    mensagem = "Veículo não encontrado."
                });
            }

            if (veiculo.AnoFabricacao < 1900 ||
                veiculo.AnoFabricacao > DateTime.Now.Year + 1)
            {
                return BadRequest(new
                {
                    mensagem = "Ano de fabricação inválido."
                });
            }

            if (veiculo.Quilometragem < 0)
            {
                return BadRequest(new
                {
                    mensagem = "A quilometragem não pode ser negativa."
                });
            }

            var placaDuplicada = await _context.Veiculos
                .AnyAsync(v =>
                    v.Placa == veiculo.Placa &&
                    v.VeiculoId != id);

            if (placaDuplicada)
            {
                return Conflict(new
                {
                    mensagem = "Já existe outro veículo cadastrado com essa placa."
                });
            }

            var fabricanteExiste = await _context.Fabricantes
                .AnyAsync(f => f.FabricanteId == veiculo.FabricanteId);

            if (!fabricanteExiste)
            {
                return BadRequest(new
                {
                    mensagem = "O fabricante informado não existe."
                });
            }

            var categoriaExiste = await _context.CategoriasVeiculo
                .AnyAsync(c => c.CategoriaVeiculoId == veiculo.CategoriaVeiculoId);

            if (!categoriaExiste)
            {
                return BadRequest(new
                {
                    mensagem = "A categoria informada não existe."
                });
            }

            _context.Entry(veiculo).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Veiculos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVeiculo(int id)
        {
            var veiculo = await _context.Veiculos.FindAsync(id);

            if (veiculo == null)
            {
                return NotFound(new
                {
                    mensagem = "Veículo não encontrado."
                });
            }

            var possuiAlugueis = await _context.Alugueis
                .AnyAsync(a => a.VeiculoId == id);

            if (possuiAlugueis)
            {
                return Conflict(new
                {
                    mensagem = "Não é possível excluir este veículo porque existem aluguéis vinculados a ele."
                });
            }

            _context.Veiculos.Remove(veiculo);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}