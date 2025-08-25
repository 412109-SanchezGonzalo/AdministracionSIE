using JobOclock_BackEnd.Models;

namespace JobOclock_BackEnd.Data.Interfaces
{
    public interface IActividadRepository
    {
        IEnumerable<Actividad> GetAll();
        void Add(string tipo);
    }
}
