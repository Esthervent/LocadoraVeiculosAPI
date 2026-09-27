using LocadoraVeiculosAPI.Data;
using LocadoraVeiculosAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LocadoraVeiculosAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClientesController : ControllerBase
    {
        private readonly ApplicationContext _context;

        public ClientesController(ApplicationContext context)
        {
            _context = context;
        }

        // GET: api/Clientes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Cliente>>> GetClientes()
        {
            return await _context.Clientes.ToListAsync();
        }

        // GET: api/Clientes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Cliente>> GetCliente(int id)
        {
            var cliente = await _context.Clientes.FindAsync(id);

            if (cliente == null)
            {
                return NotFound(new
                {
                    mensagem = "Cliente não encontrado."
                });
            }

            return cliente;
        }

        // POST: api/Clientes
        [HttpPost]
        public async Task<ActionResult<Cliente>> PostCliente(Cliente cliente)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var cpfExistente = await _context.Clientes
                .AnyAsync(c => c.CPF == cliente.CPF);

            if (cpfExistente)
            {
                return Conflict(new
                {
                    mensagem = "Já existe um cliente cadastrado com esse CPF."
                });
            }

            var emailExistente = await _context.Clientes
                .AnyAsync(c => c.Email == cliente.Email);

            if (emailExistente)
            {
                return Conflict(new
                {
                    mensagem = "Já existe um cliente cadastrado com esse e-mail."
                });
            }

            _context.Clientes.Add(cliente);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetCliente),
                new { id = cliente.ClienteId },
                cliente
            );
        }

        // PUT: api/Clientes/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCliente(
            int id,
            Cliente cliente)
        {
            if (id != cliente.ClienteId)
            {
                return BadRequest(new
                {
                    mensagem = "O ID informado na URL é diferente do ID do cliente."
                });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var clienteExistente = await _context.Clientes
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.ClienteId == id);

            if (clienteExistente == null)
            {
                return NotFound(new
                {
                    mensagem = "Cliente não encontrado."
                });
            }

            var cpfDuplicado = await _context.Clientes
                .AnyAsync(c =>
                    c.CPF == cliente.CPF &&
                    c.ClienteId != id);

            if (cpfDuplicado)
            {
                return Conflict(new
                {
                    mensagem = "Já existe outro cliente cadastrado com esse CPF."
                });
            }

            var emailDuplicado = await _context.Clientes
                .AnyAsync(c =>
                    c.Email == cliente.Email &&
                    c.ClienteId != id);

            if (emailDuplicado)
            {
                return Conflict(new
                {
                    mensagem = "Já existe outro cliente cadastrado com esse e-mail."
                });
            }

            _context.Entry(cliente).State = EntityState.Modified;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Clientes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCliente(int id)
        {
            var cliente = await _context.Clientes.FindAsync(id);

            if (cliente == null)
            {
                return NotFound(new
                {
                    mensagem = "Cliente não encontrado."
                });
            }

            var possuiAlugueis = await _context.Alugueis
                .AnyAsync(a => a.ClienteId == id);

            if (possuiAlugueis)
            {
                return Conflict(new
                {
                    mensagem = "Não é possível excluir este cliente porque existem aluguéis vinculados a ele."
                });
            }

            _context.Clientes.Remove(cliente);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}