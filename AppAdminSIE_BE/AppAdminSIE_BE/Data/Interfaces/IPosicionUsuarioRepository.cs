using JobOclock_BackEnd.Models;

namespace JobOclock_BackEnd.Data.Interfaces
{
    public interface IPosicionUsuarioRepository
    {
        IEnumerable<PosicionUsuario> GetByUsuario(int intUsuario);
        PosicionUsuario GetUltimaPosicion(int idUsuario);
        void Add(PosicionUsuario posicion);
    }
}
