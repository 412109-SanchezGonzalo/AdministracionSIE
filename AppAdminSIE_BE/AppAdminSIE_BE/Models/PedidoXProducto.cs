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
        public double Cantidad { get; set; }
        public string EstadoPedido { get; set; }
        public string NombreProducto { get; set; }
        public string UnidadMedidaProducto { get; set; }

    }
}
