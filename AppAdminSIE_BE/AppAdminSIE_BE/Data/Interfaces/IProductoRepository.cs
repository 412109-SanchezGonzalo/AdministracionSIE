using AppAdminSIE_BE.Models;
using Org.BouncyCastle.Asn1;

namespace AppAdminSIE_BE.Data.Interfaces
{
    public interface IProductoRepository
    {
        IEnumerable<Producto> GetAllProducto();
        Producto GetByName(string name);

        void Add(Producto producto);
        
    }
}
