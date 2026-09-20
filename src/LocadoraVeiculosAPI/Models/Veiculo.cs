using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LocadoraVeiculosAPI.Models
{
    public class Veiculo
    {
        [Key]
        public int VeiculoId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Modelo { get; set; } = string.Empty;

        [Required]
        public int AnoFabricacao { get; set; }

        [Required]
        public double Quilometragem { get; set; }

        [Required]
        [MaxLength(10)]
        public string Placa { get; set; } = string.Empty;

        public bool Disponivel { get; set; } = true;

        [Required]
        public int FabricanteId { get; set; }

        [ForeignKey("FabricanteId")]
        public Fabricante? Fabricante { get; set; }

        [Required]
        public int CategoriaVeiculoId { get; set; }

        [ForeignKey("CategoriaVeiculoId")]
        public CategoriaVeiculo? CategoriaVeiculo { get; set; }

        public ICollection<Aluguel> Alugueis { get; set; } = new List<Aluguel>();
    }
}