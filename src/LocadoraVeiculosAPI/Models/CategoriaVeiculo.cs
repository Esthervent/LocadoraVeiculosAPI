using System.ComponentModel.DataAnnotations;

namespace LocadoraVeiculosAPI.Models
{
    public class CategoriaVeiculo
    {
        [Key]
        public int CategoriaVeiculoId { get; set; }

        [Required]
        [MaxLength(80)]
        public string Nome { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Descricao { get; set; }

        public ICollection<Veiculo> Veiculos { get; set; } = new List<Veiculo>();
    }
}