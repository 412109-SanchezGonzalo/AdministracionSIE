using JobOclock_BackEnd.Models;

namespace JobOclock_BackEnd.Data.Interfaces
{
    public interface IServicioRepository
    {
        IEnumerable<Servicio> GetAll();
        void Add(string tipo);
    }
}
