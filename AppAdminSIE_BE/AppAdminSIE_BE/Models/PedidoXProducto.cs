using Microsoft.AspNetCore.Mvc.ViewFeatures;

namespace AppAdminSIE_BE.Models
{
    public class PedidoXProducto
    {
        public int IdPedidoXProducto { get; set; }
        public int IdPedido { get; set; }
        public int IdProducto { get; set; }
        public int Cantidad { get; set; }

    }
}
