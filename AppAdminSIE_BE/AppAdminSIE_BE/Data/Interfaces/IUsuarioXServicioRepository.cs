using JobOclock_BackEnd.Models;

namespace JobOclock_BackEnd.Data.Interfaces
{
    public interface IUsuarioXServicioRepository
    {
        IEnumerable<UsuarioXServicio> GetByUsuario(int idUsuario);
        int Add(UsuarioXServicio registro);
        void Update(int idUsuario,int idServicio, int idEdificio, DateTime fecha, string? observaciones);
        void Delete(int idUsuario);
    }
}
