    namespace JobOclock_BackEnd.Models
{
    public class FotoRegistro
    {
        public int IdFoto { get; set; }
        public int IdRegistro { get; set; }
        public string UrlFoto { get; set; }
        public string TipoFoto { get; set; } // Entrada o Salida
        public DateTime FechaHora { get; set; }
    }
}
