namespace AppAdminSIE_BE.Models
{
    public class UpdateServicioxusuario
    {
        public int IdServcioXActividad { get; set; }
        public int Id { get; set; }
        public int IdServicio { get; set; }
        public int IdEdificio { get; set; }
        public DateTime Fecha { get; set; }
        public string? Observaciones { get; set; }
    }
}
