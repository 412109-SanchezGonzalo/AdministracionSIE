using JobOclock_BackEnd.Models;

namespace JobOclock_BackEnd.Data.Interfaces
{
    public interface IUsuarioXServicioRepository
    {
        IEnumerable<UsuarioXServicio> GetByUsuario(int idUsuario);
        IEnumerable<UsuarioXServicio> GetByFecha(DateTime fecha);
        IEnumerable<UsuarioXServicio> GetByEstado(string estado);
        int Add(UsuarioXServicio registro);
        void Update(int idServicioXUsuario,int idServicio, int idEdificio, DateTime fecha, string? observaciones);
        void ChangeStatus(int idServicioXUsuario, string nuevoEstado);
        void UpdateObservaciones(string observacionesNuevas, int idServicioXUsuario);
        void Delete(int idServicioXUsuario);
    }
}
