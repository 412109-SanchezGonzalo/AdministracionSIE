using JobOclock_BackEnd.Models;

namespace JobOclock_BackEnd.Data.Interfaces
{
    public interface IRegistroRepository
    {
        IEnumerable<Registro> GetByUsuario(int idUsuario);
        Registro GetById(int id);
        void Add(Registro registro);
        void UpdateSalida(int idRegistro, string horaSalida);
    }
}
