namespace JobOclock_BackEnd.Models
{
    public class UsuarioXActividad
    {
        public int IdActividad { get; set; }
        public int IdUsuario { get; set; }
        public Decimal PagoActividad { get; set; }
        public string UbicacionTarea { get; set; }
        public string Estado { get; set; }
    }
}
