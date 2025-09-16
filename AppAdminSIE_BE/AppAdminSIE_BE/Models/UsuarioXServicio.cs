namespace JobOclock_BackEnd.Models
{
    public class UsuarioXServicio
    {
        public int IdUsuarioXActividad { get; set; }
        public int IdUsuario { get; set; }
        public int IdServicio { get; set; }
        public string NombreServicio { get; set; }
        public int IdEdificio { get; set; }
        public string NombreEdificio { get; set; }
        public string? Observaciones { get; set; }
        public DateTime Fecha { get; set; }
        public DateTime? FechaFinalizacion { get; set; } 
        public string Estado { get; set; }
    }
}
