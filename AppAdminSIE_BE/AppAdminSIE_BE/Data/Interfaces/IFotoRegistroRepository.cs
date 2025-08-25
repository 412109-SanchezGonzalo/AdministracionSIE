using JobOclock_BackEnd.Models;

namespace JobOclock_BackEnd.Data.Interfaces
{
    public interface IFotoRegistroRepository
    {
        IEnumerable<FotoRegistro> GetByRegistro(int idRegistro);
        void Add(FotoRegistro foto);
    }
}
