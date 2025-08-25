namespace JobOclock_BackEnd.Models
{
    public class PosicionUsuario
    {
        public int IdPosicion { get; set; }
        public int IdUsuario { get; set; }
        public int IdActividad { get; set; }
        public Decimal Latitud { get; set; }
        public Decimal Longitud { get; set; }
        public DateTime FechaHora { get; set; }
        public Decimal PrecisionGPS { get; set; }
        public int BateriaDispositivo { get; set; }
    }
}
