namespace JobOclock_BackEnd.Models
{
    public class Usuario
    {
        public int IdUsuario { get; set; }
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public string Email { get; set; }
        public string Telefono { get; set; }
        public string NicknameDni { get ; set; }
        public string Contraseña { get; set; }
        public string Rol { get; set; }
    }
}
