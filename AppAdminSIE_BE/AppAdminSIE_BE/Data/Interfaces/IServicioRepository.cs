using JobOclock_BackEnd.Models;

namespace AppAdminSIE_BE.Data.Interfaces
{
    public interface IServicioRepository
    {
        IEnumerable<Servicio> GetAll();
        void Add(string tipo);
    }
}
