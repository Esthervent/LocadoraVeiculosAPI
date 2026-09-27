using LocadoraVeiculosAPI.Data;
using LocadoraVeiculosAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LocadoraVeiculosAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriasVeiculoController : ControllerBase
    {
        private readonly ApplicationContext _context;

        public CategoriasVeiculoController(ApplicationContext context)
        {
            _context = context;
        }

        // GET: api/CategoriasVeiculo
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoriaVeiculo>>> GetCategorias()
        {
            return await _context.CategoriasVeiculo.ToListAsync();
        }

        // GET: api/CategoriasVeiculo/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CategoriaVeiculo>> GetCategoria(int id)
        {
            var categoria = await _context.CategoriasVeiculo.FindAsync(id);

            if (categoria == null)
            {
                return NotFound(new
                {
                    mensagem = "Categoria de veículo não encontrada."
                });
            }

            return categoria;
        }

        // POST: api/CategoriasVeiculo
        [HttpPost]
        public async Task<ActionResult<CategoriaVeiculo>> PostCategoria(CategoriaVeiculo categoria)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var nomeExistente = await _context.CategoriasVeiculo
                .AnyAsync(c => c.Nome == categoria.Nome);

            if (nomeExistente)
            {
                return Conflict(new
                {
                    mensagem = "Já existe uma categoria com esse nome."
                });
            }

            _context.CategoriasVeiculo.Add(categoria);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetCategoria),
                new { id = categoria.CategoriaVeiculoId },
                categoria
            );
        }

        // PUT: api/CategoriasVeiculo/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCategoria(
            int id,
            CategoriaVeiculo categoria)
        {
            if (id != categoria.CategoriaVeiculoId)
            {
                return BadRequest(new
                {
                    mensagem = "O ID informado na URL é diferente do ID da categoria."
                });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var categoriaExistente = await _context.CategoriasVeiculo
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.CategoriaVeiculoId == id);

            if (categoriaExistente == null)
            {
                return NotFound(new
                {
                    mensagem = "Categoria de veículo não encontrada."
                });
            }

            var nomeDuplicado = await _context.CategoriasVeiculo
                .AnyAsync(c =>
                    c.Nome == categoria.Nome &&
                    c.CategoriaVeiculoId != id);

            if (nomeDuplicado)
            {
                return Conflict(new
                {
                    mensagem = "Já existe outra categoria com esse nome."
                });
            }

            _context.Entry(categoria).State = EntityState.Modified;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/CategoriasVeiculo/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategoria(int id)
        {
            var categoria = await _context.CategoriasVeiculo.FindAsync(id);

            if (categoria == null)
            {
                return NotFound(new
                {
                    mensagem = "Categoria de veículo não encontrada."
                });
            }

            var possuiVeiculos = await _context.Veiculos
                .AnyAsync(v => v.CategoriaVeiculoId == id);

            if (possuiVeiculos)
            {
                return Conflict(new
                {
                    mensagem = "Não é possível excluir esta categoria porque existem veículos vinculados a ela."
                });
            }

            _context.CategoriasVeiculo.Remove(categoria);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}