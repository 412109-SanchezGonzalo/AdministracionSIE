using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Org.BouncyCastle.Bcpg.OpenPgp;

namespace AppAdminSIE_BE.Models
{
    public class PedidoXProducto
    {
        public int IdPedidoXProducto { get; set; }
        public int IdPedido { get; set; }
        public int IdProducto { get; set; }
        public int IdEdificio { get; set; }
        public string Edificio { get; set; }
        public double Cantidad { get; set; }
        public string EstadoPedido { get; set; }
        public string NombreProducto { get; set; }
        public string UnidadMedidaProducto { get; set; }
        public string? Observaciones { get; set; }
        public string EstadoProducto { get; set; }

    }
}
