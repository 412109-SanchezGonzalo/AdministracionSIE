using AppAdminSIE_BE.Models;

namespace AppAdminSIE_BE.Data.Interfaces
{
    public interface IPedidoXProductoRepository
    {
        IEnumerable<PedidoXProducto> GetAllPedidoXProductos();
        void AddPedidoXProducto(PedidoXProducto pedidoxproducto);
        void UpdateObservacionesPedidoXProducto(int idPedido, string? observacionesExtras);
        void UpdateEstadoProductoPedidoXProducto(int idPedido, int idProducto, string nuevoEstadoProducto);


    }
}
