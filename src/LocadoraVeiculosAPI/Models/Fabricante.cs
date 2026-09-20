using System.ComponentModel.DataAnnotations;

namespace LocadoraVeiculosAPI.Models
{
    public class Fabricante
    {
        [Key]
        public int FabricanteId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Nome { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? PaisOrigem { get; set; }

        public ICollection<Veiculo> Veiculos { get; set; } = new List<Veiculo>();
    }
}