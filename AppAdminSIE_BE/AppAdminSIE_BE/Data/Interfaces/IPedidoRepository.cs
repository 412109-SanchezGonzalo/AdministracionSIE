using AppAdminSIE_BE.Models;

namespace AppAdminSIE_BE.Data.Interfaces
{
    public interface IPedidoRepository
    {
        IEnumerable<Pedido> GetAllPedidos();
        int AddPedido(NewPedido newPedido);
        void UpdateEstado(int idPedido, string nuevoEstado);
    }
}
