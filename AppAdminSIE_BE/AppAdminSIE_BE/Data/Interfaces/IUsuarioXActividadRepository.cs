using JobOclock_BackEnd.Models;

namespace JobOclock_BackEnd.Data.Interfaces
{
    public interface IUsuarioXActividadRepository
    {
        IEnumerable<UsuarioXActividad> GetByUsuario(int idUsuario);
        void Add(UsuarioXActividad registro);
        void UpdateEstado(int idUsuario, int idActividad, string nuevoEstado);
    }
}
