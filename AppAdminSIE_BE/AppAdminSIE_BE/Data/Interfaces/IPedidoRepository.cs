using AppAdminSIE_BE.Models;

namespace AppAdminSIE_BE.Data.Interfaces
{
    public interface IPedidoRepository
    {
        IEnumerable<Pedido> GetAllPedidos();
        int AddPedido(DateTime fechaEntrega);
        void UpdateEstado(int idPedido);
    }
}
