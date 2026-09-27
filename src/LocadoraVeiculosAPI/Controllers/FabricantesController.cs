using LocadoraVeiculosAPI.Data;
using LocadoraVeiculosAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LocadoraVeiculosAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FabricantesController : ControllerBase
    {
        private readonly ApplicationContext _context;

        public FabricantesController(ApplicationContext context)
        {
            _context = context;
        }

        // GET: api/Fabricantes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Fabricante>>> GetFabricantes()
        {
            return await _context.Fabricantes.ToListAsync();
        }

        // GET: api/Fabricantes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Fabricante>> GetFabricante(int id)
        {
            var fabricante = await _context.Fabricantes.FindAsync(id);

            if (fabricante == null)
            {
                return NotFound(new
                {
                    mensagem = "Fabricante não encontrado."
                });
            }

            return fabricante;
        }

        // POST: api/Fabricantes
        [HttpPost]
        public async Task<ActionResult<Fabricante>> PostFabricante(Fabricante fabricante)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var nomeExistente = await _context.Fabricantes
                .AnyAsync(f => f.Nome == fabricante.Nome);

            if (nomeExistente)
            {
                return Conflict(new
                {
                    mensagem = "Já existe um fabricante com esse nome."
                });
            }

            _context.Fabricantes.Add(fabricante);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetFabricante),
                new { id = fabricante.FabricanteId },
                fabricante
            );
        }

        // PUT: api/Fabricantes/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutFabricante(
            int id,
            Fabricante fabricante)
        {
            if (id != fabricante.FabricanteId)
            {
                return BadRequest(new
                {
                    mensagem = "O ID informado na URL é diferente do ID do fabricante."
                });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var fabricanteExistente = await _context.Fabricantes
                .AsNoTracking()
                .FirstOrDefaultAsync(f => f.FabricanteId == id);

            if (fabricanteExistente == null)
            {
                return NotFound(new
                {
                    mensagem = "Fabricante não encontrado."
                });
            }

            var nomeDuplicado = await _context.Fabricantes
                .AnyAsync(f =>
                    f.Nome == fabricante.Nome &&
                    f.FabricanteId != id);

            if (nomeDuplicado)
            {
                return Conflict(new
                {
                    mensagem = "Já existe outro fabricante com esse nome."
                });
            }

            _context.Entry(fabricante).State = EntityState.Modified;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Fabricantes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFabricante(int id)
        {
            var fabricante = await _context.Fabricantes.FindAsync(id);

            if (fabricante == null)
            {
                return NotFound(new
                {
                    mensagem = "Fabricante não encontrado."
                });
            }

            var possuiVeiculos = await _context.Veiculos
                .AnyAsync(v => v.FabricanteId == id);

            if (possuiVeiculos)
            {
                return Conflict(new
                {
                    mensagem = "Não é possível excluir este fabricante porque existem veículos vinculados a ele."
                });
            }

            _context.Fabricantes.Remove(fabricante);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}