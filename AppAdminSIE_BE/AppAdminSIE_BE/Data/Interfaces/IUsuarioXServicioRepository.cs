using JobOclock_BackEnd.Models;

namespace JobOclock_BackEnd.Data.Interfaces
{
    public interface IUsuarioXServicioRepository
    {
        IEnumerable<UsuarioXServicio> GetByUsuario(int idUsuario);
        void Add(UsuarioXServicio registro);
        void UpdateEstado(int idUsuario, int idActividad, string nuevoEstado);
    }
}
