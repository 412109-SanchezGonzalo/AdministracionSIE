using AppAdminSIE_BE.Models;

namespace AppAdminSIE_BE.Data.Interfaces
{
    public interface IEdificioXUsuario
    {
        IEnumerable<EdificioXUsuario> GetEdificioByUser(string contrasena);
    }
}
