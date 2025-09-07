using AppAdminSIE_BE.Models;

namespace AppAdminSIE_BE.Data.Interfaces
{
    public interface IProductoRepository
    {
        IEnumerable<Producto> GetAllProducto();
        
    }
}
