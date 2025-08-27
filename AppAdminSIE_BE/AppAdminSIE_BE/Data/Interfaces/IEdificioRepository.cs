using AppAdminSIE_BE.Models;

namespace AppAdminSIE_BE.Data.Interfaces
{
    public interface IEdificioRepository
    {
        IEnumerable<Edificio> GetAllEdificios();
    }
}
