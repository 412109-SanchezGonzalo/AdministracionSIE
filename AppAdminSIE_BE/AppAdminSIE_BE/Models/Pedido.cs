namespace AppAdminSIE_BE.Models
{
    public class Pedido
    {
        public int IdPedido { get; set; }
        public DateTime FechaEntrega { get; set; }
        public int Estado { get; set; }
        public DateTime FechaCreacion { get; set; }

    }
}
