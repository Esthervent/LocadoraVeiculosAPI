using System.ComponentModel.DataAnnotations;

namespace LocadoraVeiculosAPI.Models
{
    public class Cliente
    {
        [Key]
        public int ClienteId { get; set; }

        [Required]
        [MaxLength(120)]
        public string Nome { get; set; } = string.Empty;

        [Required]
        [MaxLength(14)]
        public string CPF { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? Telefone { get; set; }

        public ICollection<Aluguel> Alugueis { get; set; } = new List<Aluguel>();
    }
}