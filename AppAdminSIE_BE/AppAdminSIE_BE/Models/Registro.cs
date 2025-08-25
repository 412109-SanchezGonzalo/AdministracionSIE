namespace JobOclock_BackEnd.Models
{
    public class Registro
    {
        public int IdRegistro { get; set; }
        public string HoraIngreso { get; set; }
        public string HoraSalida { get; set; }
        public int IdUsuario { get; set; }
        public DateTime Fecha { get; set; }
    }
}
